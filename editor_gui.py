import subprocess
import tkinter as tk
import pyperclip  # Importar el módulo para manejar el portapapeles
from tkinter import messagebox, filedialog, ttk, scrolledtext
from bs4 import BeautifulSoup, Comment
from PIL import Image, ImageTk
import os
import webbrowser  # Importar el módulo webbrowser
from tkinter import font
import Comprimir  # Importar el módulo comprimir.py
import re
# Ruta del archivo HTML predeterminado
ruta_archivo_actual = None  # Variable global para almacenar la ruta del archivo cargado
default_html_path = 'index.html'
soup = None
imagen_entries = []  # Inicialización de imagen_entries como una lista vacía

# Función para abrir Comprimir.py
def abrir_comprimir():
    try:
        subprocess.Popen(["python", "Comprimir.py"])  # Abrir Comprimir.py con Python
    except Exception as e:
        mostrar_notificacion(f"Error al abrir Comprimir.py: {e}", tipo="error")

# Función para abrir extraer productos para rappi.py
def abrir_exporte_rappi():
    try:
        subprocess.Popen(["python", "extraer productos para rappi.py"])  # Abrir el script
    except Exception as e:
        mostrar_notificacion(f"Error al abrir extraer productos para rappi.py: {e}", tipo="error")

# Función para abrir la página web
def open_web_page():
    webbrowser.open("https://github.com/Berakhah-co/Berakhah-co.github.io/blob/main/index.html")
    webbrowser.open("http://127.0.0.1")


def iniciar_arrastre(event):
    global indice_producto_inicial

    # Solo permitir arrastrar si la reordenación está activa
    if not reordenar_activo.get():
        return

    # Guardar el índice inicial del producto seleccionado
    indice_producto_inicial = productos_listbox.nearest(event.y)


def finalizar_arrastre(event):
    global indice_producto_inicial, indice_producto_final

    # Verificar si la reordenación está activa
    if not reordenar_activo.get():
        return

    # Obtener el índice del producto final (donde se soltó)
    indice_producto_final = productos_listbox.nearest(event.y)

    # Verificar si el índice inicial fue definido
    if indice_producto_inicial is None:
        return

    # Evitar realizar cambios si se suelta en la misma posición
    if indice_producto_inicial == indice_producto_final:
        return

    # Intercambiar los elementos en el Listbox
    producto_inicial = productos_listbox.get(indice_producto_inicial)
    producto_final = productos_listbox.get(indice_producto_final)
    productos_listbox.delete(indice_producto_inicial)
    productos_listbox.insert(indice_producto_final, producto_inicial)

    # Actualizar el HTML para reflejar el nuevo orden
    actualizar_html()

    # Reiniciar el índice inicial para evitar problemas en futuros eventos
    indice_producto_inicial = None



def actualizar_html():
    global soup

    # Orden preestablecido de las categorías
    orden_categorias = ['collares', 'pulseras', 'anillos', 'zarcillos', 'caballeros', 'ocultos']

    # Obtener el contenedor principal del catálogo
    catalogo = soup.find('main', class_='catalogo')

    # Crear un contenedor temporal para los productos reorganizados
    productos_reorganizados = []

    # Iterar sobre las categorías en el orden predefinido
    for categoria in orden_categorias:
        # Buscar los productos de esta categoría en el HTML
        productos_categoria_html = soup.find_all('div', class_='producto', attrs={'data-categoria': categoria})

        # Si la categoría no está en el HTML, saltarla
        if not productos_categoria_html:
            continue

        # Obtener el nuevo orden desde el Listbox para esta categoría
        productos_categoria_listbox = [
            productos_listbox.get(i).strip()
            for i in range(productos_listbox.size())
            if productos_listbox.get(i).strip() and not productos_listbox.get(i).startswith("--")  # Evitar las categorías
        ]

        # Reorganizar los productos en la categoría según el nuevo orden
        for producto_nombre in productos_categoria_listbox:
            # Encontrar el producto y su comentario correspondiente
            producto_html = next((p for p in productos_categoria_html if producto_nombre in p.text), None)
            if producto_html:
                comentario_anterior = producto_html.find_previous(string=lambda text: isinstance(text, Comment))
                if comentario_anterior and f"Categoria: {categoria}" in comentario_anterior:
                    productos_reorganizados.append((comentario_anterior, producto_html.extract()))

    # Agregar categorías que no están en el orden preestablecido al final
    categorias_adicionales = set(
        p.get('data-categoria', '').lower() for p in soup.find_all('div', class_='producto')
    ) - set(orden_categorias)

    for categoria in categorias_adicionales:
        productos_categoria_html = soup.find_all('div', class_='producto', attrs={'data-categoria': categoria})
        for producto_html in productos_categoria_html:
            comentario_anterior = producto_html.find_previous(string=lambda text: isinstance(text, Comment))
            if comentario_anterior:
                productos_reorganizados.append((comentario_anterior, producto_html.extract()))

    # Limpiar el catálogo y añadir los productos reorganizados en el orden correcto
    catalogo.clear()
    for comentario, producto in productos_reorganizados:
        catalogo.append("\n")  # Añadir una nueva línea antes del comentario
        catalogo.append(comentario)
        catalogo.append("\n")  # Añadir una nueva línea antes del producto
        catalogo.append(producto)

    # Guardar los cambios en el archivo HTML
    guardar_html(soup)



def mostrar_notificacion(mensaje):
    # Crear un mensaje flotante en la esquina inferior derecha
    notificacion = tk.Toplevel()
    notificacion.overrideredirect(1)
    notificacion.geometry("250x50+800+500")  # Ajustar posición y tamaño
    notificacion.configure(bg="#4CAF50")

    # Etiqueta para mostrar el mensaje
    label = tk.Label(notificacion, text=mensaje, bg="#4CAF50", fg="white", font=("Arial", 12))
    label.pack(expand=True)

    # Cerrar automáticamente después de 3 segundos
    notificacion.after(3000, notificacion.destroy)


# Función para cargar el archivo HTML
def cargar_html(ruta):
    global ruta_archivo_actual
    ruta_archivo_actual = ruta  # Guarda la ruta del archivo cargado
    with open(ruta, 'r', encoding='utf-8') as file:
        contenido = file.read()
    return BeautifulSoup(contenido, 'html.parser')

# Función para guardar cambios en el archivo HTML
def guardar_html(soup):
    global ruta_archivo_actual
    if ruta_archivo_actual:
        # Guarda los cambios en el archivo cargado
        with open(ruta_archivo_actual, 'w', encoding='utf-8') as file:
            file.write(str(soup))  # Asegúrate de que esto esté bien
    else:
        messagebox.showerror("Error", "No se ha cargado ningún archivo.")



# Función para cargar productos en la lista y organizarlos por categoría, incluyendo los ocultos
def cargar_productos():
    global productos_por_categoria
    productos_listbox.delete(0, tk.END)
    productos_por_categoria = {}
    productos = soup.find_all('div', class_='producto')
    
    # Añadir productos visibles a la lista
    for producto in productos:
        categoria = producto.get('data-categoria', 'Sin Categoría')
        
        titulo_producto = producto.find('h3', class_='titulo-producto')
        if titulo_producto is None:
            continue  # Si no se encuentra el título, saltar este producto
        
        nombre = titulo_producto.text.strip()
        
        if categoria not in productos_por_categoria:
            productos_por_categoria[categoria] = []
        
        productos_por_categoria[categoria].append(nombre)
    
    # Añadir productos por categoría
    for categoria, productos in productos_por_categoria.items():
        productos_listbox.insert(tk.END, f"-- {categoria.upper()} --")
        for producto in productos:
            productos_listbox.insert(tk.END, f"  {producto}")
    
    # Añadir productos ocultos a la categoría "Ocultos"
    productos_ocultos = obtener_productos_ocultos()
    if productos_ocultos:
        productos_listbox.insert(tk.END, "-- OCULTOS --")
        for producto in productos_ocultos:
            productos_listbox.insert(tk.END, f"  {producto}")

# Función para manejar el doble clic en un producto en la lista
def on_double_click_producto(event):
    # Obtener el producto seleccionado en la lista
    seleccionado = productos_listbox.curselection()
    if not seleccionado:
        return

    nombre_producto = productos_listbox.get(seleccionado).strip()
    if nombre_producto.startswith("--"):
        return  # Ignorar si el usuario hizo clic en una categoría en lugar de un producto

    # Abrir la ventana de edición con el producto seleccionado
    producto_html = obtener_producto_por_nombre(nombre_producto)
    if producto_html:
        editar_producto_ventana(producto_html)
    else:
        producto_html = obtener_producto_oculto_por_nombre(nombre_producto)
        if producto_html:
            editar_producto_ventana(producto_html)

# Función para obtener nombres de productos ocultos mediante comentarios
def obtener_productos_ocultos():
    productos_ocultos = []
    comentarios = soup.find_all(string=lambda text: isinstance(text, Comment))
    for comentario in comentarios:
        try:
            producto_html = BeautifulSoup(str(comentario), 'html.parser')
            nombre = producto_html.find('h3', class_='titulo-producto').text
            productos_ocultos.append(nombre)
        except:
            continue
    return productos_ocultos

# Función para mostrar todas las imágenes del producto seleccionado en el panel existente
def mostrar_imagen_producto():
    seleccionado = productos_listbox.curselection()
    if not seleccionado:
        return

    nombre_producto = productos_listbox.get(seleccionado).strip()
    if nombre_producto.startswith("--"):
        return

    # Buscar el producto visible o el producto oculto
    producto_html = obtener_producto_por_nombre(nombre_producto)
    if not producto_html:
        producto_html = obtener_producto_oculto_por_nombre(nombre_producto)

    if producto_html:
        # Buscar las imágenes dentro del carrusel del producto
        carousel = producto_html.find('div', class_='carousel')
        if carousel:
            imagen_tags = carousel.find_all('img')
            rutas_imagenes = [img['src'] for img in imagen_tags if 'src' in img.attrs]

            if rutas_imagenes:
                cargar_imagenes(rutas_imagenes)  # Llama a cargar_imagenes para mostrar las imágenes en el panel de vista previa
            else:
                messagebox.showwarning("Error", "No se encontraron imágenes para el producto seleccionado.")
        else:
            messagebox.showwarning("Error", "No se encontró un carrusel de imágenes en el producto seleccionado.")



# Función para cargar y mostrar múltiples imágenes en el panel de vista previa
import os

def cargar_imagenes(rutas_imagenes):
    # Limpiar el panel de imágenes antes de mostrar las nuevas
    for widget in imagen_frame.winfo_children():
        widget.destroy()

    # Mostrar todas las imágenes en el panel con un tamaño ajustado
    for ruta_imagen in rutas_imagenes:
        try:
            # Convertir la ruta a una ruta completa (absoluta)
            ruta_imagen_completa = os.path.abspath(ruta_imagen)

            # Verificar si la ruta existe
            if not os.path.exists(ruta_imagen_completa):
                raise FileNotFoundError(f"No se encontró la imagen: {ruta_imagen_completa}")

            img = Image.open(ruta_imagen_completa)
            img = img.resize((130, 130), Image.LANCZOS)  # Redimensionar las imágenes
            img_display = ImageTk.PhotoImage(img)

            # Etiqueta para cada imagen
            img_label = tk.Label(imagen_frame, image=img_display)
            img_label.image = img_display
            img_label.pack(pady=2)  # Ajustar el espaciado entre imágenes
        except Exception as e:
            messagebox.showwarning("Error", f"No se pudo cargar la imagen: {e}")


# Función para cargar y mostrar la imagen en la interfaz
def cargar_imagen(ruta_imagen):
    global imagen_label, img_display
    ruta_imagen_completa = os.path.join(os.getcwd(), ruta_imagen)
    img = Image.open(ruta_imagen_completa)
    img = img.resize((200, 200), Image.LANCZOS)
    img_display = ImageTk.PhotoImage(img)
    imagen_label.config(image=img_display)
    imagen_label.image = img_display

# Función para agregar un nuevo producto
def agregar_producto():
    global imagen_entries
    categoria = categoria_combobox.get()
    tipo_articulo = tipo_articulo_combobox.get()  # Obtener el tipo de artículo seleccionado (Collar, Pulsera, etc.)
    nombre = nombre_entry.get()
    precio = precio_entry.get()
    
    # Combinar el tipo de artículo con el nombre del producto
    nombre_completo_producto = f"{tipo_articulo} {nombre}"  # Ejemplo: "Collar Berakhah B-38"
    
    # Guarda la descripción correctamente
    descripcion = descripcion_entry.get("1.0", tk.END).strip()  # Tomar todo el texto

    # Validación para reemplazar entidades HTML
    descripcion = descripcion.replace('&lt;', '<').replace('&gt;', '>')  # Deshacer escape

    # Dividir la descripción en párrafos
    parrafos = descripcion.split('\n')  # Dividir en líneas

    # Crear el HTML para la descripción
    descripcion_html = ''.join(f'<p>{p}</p>' for p in parrafos if p.strip())  # Crear párrafos HTML

    imagenes = [entry.get() for entry in imagen_entries]

    # Generar un ID adecuado para el carrusel basado en el nombre, pero simplificado
    nombre_id = nombre.split()[-1]  # Tomar solo la última parte del nombre, ej. "B-38"

    # Crear el comentario correctamente sin anidar los signos
    comentario = Comment(f" Categoria: {categoria} - Producto: {nombre_completo_producto} ")

    # Crear el contenedor del producto
    nuevo_producto = soup.new_tag('div', **{'class': 'producto', 'data-categoria': categoria})
    nuevo_producto.append('\n')

    # Crear el carrusel de imágenes
    carousel = soup.new_tag('div', **{'class': 'carousel', 'id': f'carousel-{nombre_id}'})
    carousel_images = soup.new_tag('div', **{'class': 'carousel-images'})

    # Añadir las imágenes al carrusel, cada una con su enlace <a> para Fancybox
    for index, imagen in enumerate(imagenes):
        a_tag = soup.new_tag('a', href=imagen, **{
            'data-fancybox': f"gallery-{nombre_completo_producto}",
            'data-caption': nombre_completo_producto
        })
        
        img_tag = soup.new_tag('img', src=imagen, alt=nombre_completo_producto)
        
        if index == 0:
            img_tag['class'] = 'active'

        a_tag.append(img_tag)
        carousel_images.append(a_tag)

    btn_prev = soup.new_tag('button', **{'class': 'carousel-button prev', 'onclick': f"changeImage(-1, 'carousel-{nombre_id}')"})
    btn_prev.string = '❮'
    btn_next = soup.new_tag('button', **{'class': 'carousel-button next', 'onclick': f"changeImage(1, 'carousel-{nombre_id}')"})
    btn_next.string = '❯'

    carousel.append(carousel_images)
    carousel.append(btn_prev)
    carousel.append(btn_next)
    nuevo_producto.append(carousel)
    nuevo_producto.append('\n')

    # Actualizar el título del producto con el tipo de artículo y nombre
    titulo = soup.new_tag('h3', **{'class': 'titulo-producto'})
    titulo.string = nombre_completo_producto
    nuevo_producto.append(titulo)
    nuevo_producto.append('\n')

    # Guardar la descripción como HTML
    descripcion_tag = soup.new_tag('div')  # Crear un contenedor para los párrafos
    descripcion_tag.append(BeautifulSoup(descripcion_html, 'html.parser'))  # Añadir los párrafos como HTML
    nuevo_producto.append(descripcion_tag)
    nuevo_producto.append('\n')

    # Añadir el precio del producto
    precio_tag = soup.new_tag('p', **{'class': 'precio'})
    precio_tag.string = f"${precio}"  # Guardar el precio tal cual se ingresó
    nuevo_producto.append(precio_tag)
    nuevo_producto.append('\n')

    # Añadir el botón para agregar al carrito
    boton = soup.new_tag('button', **{'class': 'button', 'onclick': f"agregarAlCarrito('{nombre_completo_producto}', {precio})"})
    boton.string = '¡Agregar al Carrito!'
    nuevo_producto.append(boton)

    # Insertar el comentario y el producto en el lugar correcto
    catalogo = soup.find('main', {'class': 'catalogo'})
    
    comentario_categoria = catalogo.find(string=lambda text: isinstance(text, Comment) and f"Categoria: {categoria}" in text)

    if comentario_categoria:
        comentario_categoria.insert_before(comentario)
        comentario.insert_after('\n')
        comentario.insert_after(nuevo_producto)
    else:
        catalogo.append(comentario)
        comentario.insert_after('\n')
        comentario.insert_after(nuevo_producto)

    # Recargar los productos para reflejar el cambio
    cargar_productos()
    mostrar_notificacion("Producto agregado correctamente.")  # Mostrar notificación en lugar de alerta



# Función para seleccionar imágenes del producto y permitir la edición/eliminación de la ruta
def seleccionar_imagenes():
    global imagen_entries
    imagenes_paths = filedialog.askopenfilenames(title="Seleccionar Imágenes", filetypes=[("Image files", "*.jpg;*.jpeg;*.png")])
    if imagenes_paths:
        for path in imagenes_paths:
            ruta_relativa = os.path.relpath(path, os.getcwd())
            frame_imagen = tk.Frame(center_frame)  # Crear un marco para la imagen y el botón de eliminar
            frame_imagen.pack(anchor='w', pady=2)

            entry = tk.Entry(frame_imagen, width=30)
            entry.insert(0, ruta_relativa)
            entry.pack(side=tk.LEFT, padx=(0, 10))  # Añadir espaciado a la derecha del campo de entrada
            imagen_entries.append(entry)

            # Botón para eliminar la imagen seleccionada
            eliminar_btn = tk.Button(frame_imagen, text="Eliminar", command=lambda e=entry, f=frame_imagen: eliminar_imagen(e, f))
            eliminar_btn.pack(side=tk.LEFT, padx=5)  # Añadir espaciado a la izquierda del botón
        
        imagenes_label.config(text=f"{len(imagen_entries)} imagen(es) seleccionada(s)")

# Función para eliminar una imagen seleccionada
def eliminar_imagen(entry, frame_imagen):
    frame_imagen.pack_forget()  # Ocultar el frame que contiene la imagen y el botón
    imagen_entries.remove(entry)  # Eliminar la entrada de la lista


# Función para editar el producto seleccionado
def editar_producto():
    seleccionado = productos_listbox.curselection()
    if not seleccionado:
        messagebox.showwarning("Advertencia", "Seleccione un producto para editar.")
        return

    nombre_producto = productos_listbox.get(seleccionado).strip()
    if nombre_producto.startswith("--"):
        messagebox.showwarning("Advertencia", "Seleccione un producto, no una categoría.")
        return

    producto_html = obtener_producto_por_nombre(nombre_producto)
    if producto_html:
        editar_producto_ventana(producto_html)
    else:
        producto_html = obtener_producto_oculto_por_nombre(nombre_producto)
        if producto_html:
            editar_producto_ventana(producto_html)

# Función auxiliar para obtener un producto HTML por su nombre
def obtener_producto_por_nombre(nombre_producto):
    productos = soup.find_all('h3', {'class': 'titulo-producto'})
    for producto in productos:
        if producto.text.strip() == nombre_producto:
            return producto.parent
    return None

# Función para obtener un producto oculto por su nombre
def obtener_producto_oculto_por_nombre(nombre_producto):
    comentarios = soup.find_all(string=lambda text: isinstance(text, Comment))
    for comentario in comentarios:
        producto_html = BeautifulSoup(str(comentario), 'html.parser')
        try:
            nombre = producto_html.find('h3', class_='titulo-producto').text
            if nombre.strip() == nombre_producto:
                return comentario
        except:
            continue
    return None

# Función para eliminar un producto
def eliminar_producto():
    seleccionado = productos_listbox.curselection()
    if not seleccionado:
        messagebox.showwarning("Advertencia", "Seleccione un producto para eliminar.")
        return

    nombre_producto = productos_listbox.get(seleccionado).strip()
    if nombre_producto.startswith("--"):
        messagebox.showwarning("Advertencia", "Seleccione un producto, no una categoría.")
        return

    respuesta = messagebox.askyesno("Confirmar Eliminación", f"¿Estás seguro de que deseas eliminar el producto '{nombre_producto}'?")
    if not respuesta:
        return

    # Obtener el producto HTML por nombre
    producto_html = obtener_producto_por_nombre(nombre_producto)
    if producto_html:
        # Encontrar el comentario que precede al producto
        comentario_precedente = producto_html.find_previous(string=lambda text: isinstance(text, Comment))

        # Eliminar el producto y su comentario correspondiente
        if comentario_precedente:
            comentario_precedente.extract()
        producto_html.decompose()
    else:
        # Si el producto está oculto en un comentario, eliminar el comentario completo
        producto_html = obtener_producto_oculto_por_nombre(nombre_producto)
        if producto_html:
            producto_html.extract()

    # Guardar en el archivo actualmente cargado
    guardar_html(soup)
    cargar_productos()
    mostrar_notificacion("Producto eliminado correctamente.")  # Mostrar notificación en lugar de alerta

# Función para abrir una ventana de edición con los datos del producto seleccionado

def editar_producto_ventana(producto_html):
    # Obtener el tamaño y posición de la ventana principal
    ventana.update_idletasks()  # Actualizar el estado de la ventana
    alto_ventana_principal = ventana.winfo_height()  # Obtener la altura de la ventana principal
    ancho_ventana_principal = ventana.winfo_width()  # Obtener el ancho de la ventana principal
    x_ventana_principal = ventana.winfo_x()  # Obtener la posición X de la ventana principal
    y_ventana_principal = ventana.winfo_y()  # Obtener la posición Y de la ventana principal

    # Crear la ventana de edición
    ventana_edicion = tk.Toplevel(ventana)
    ventana_edicion.title("Editar Producto")
    ventana_edicion.geometry(f"450x{alto_ventana_principal}+{x_ventana_principal + ancho_ventana_principal}+{y_ventana_principal}")
    ventana_edicion.configure(bg='#000000')

    # Crear un canvas para hacer scroll cuando el contenido sea extenso
    canvas = tk.Canvas(ventana_edicion, bg='#000000')
    canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

    # Añadir un scrollbar al canvas
    scrollbar = tk.Scrollbar(ventana_edicion, orient=tk.VERTICAL, command=canvas.yview)
    scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    canvas.configure(yscrollcommand=scrollbar.set)

    # Crear un frame dentro del canvas
    frame_contenido = tk.Frame(canvas, bg='#000000')

    # Crear un window dentro del canvas que contenga el frame_contenido
    canvas.create_window((0, 0), window=frame_contenido, anchor='nw')

    # Función para ajustar el tamaño del canvas a medida que cambia el contenido
    def ajustar_canvas(event):
        canvas.configure(scrollregion=canvas.bbox("all"))

    # Vincular el ajuste del canvas al tamaño del contenido
    frame_contenido.bind("<Configure>", ajustar_canvas)

    # Extraer los datos del producto
    nombre_producto = producto_html.find('h3', class_='titulo-producto').text.strip()
    precio_producto = producto_html.find('p', class_='precio').text.strip().replace('$', '')

    # Extraer todos los párrafos del producto
    parrafos = producto_html.find_all('p')
    descripcion_texto = '\n'.join([p.get_text() for p in parrafos if 'precio' not in p.get('class', [])])

    # Widgets en la ventana de edición
    tk.Label(frame_contenido, text="Nombre del Producto:", bg='#000000', fg='#FFFF66').pack(anchor='w', padx=10, pady=5)
    nombre_entry_edicion = tk.Entry(frame_contenido, width=30)
    nombre_entry_edicion.pack(anchor='w', padx=10)
    nombre_entry_edicion.insert(0, nombre_producto)

    tk.Label(frame_contenido, text="Precio:", bg='#000000', fg='#FFFF66').pack(anchor='w', padx=10, pady=5)
    precio_entry_edicion = tk.Entry(frame_contenido, width=30)
    precio_entry_edicion.pack(anchor='w', padx=10)
    precio_entry_edicion.insert(0, precio_producto)

    tk.Label(frame_contenido, text="Descripción:", bg='#000000', fg='#FFFF66').pack(anchor='w', padx=10, pady=5)
    descripcion_entry_edicion = scrolledtext.ScrolledText(frame_contenido, width=50, height=10, wrap=tk.WORD)
    descripcion_entry_edicion.pack(anchor='w', padx=10, pady=5)

    # Insertar la descripción con separaciones entre párrafos
    for linea in descripcion_texto.split('\n'):
        descripcion_entry_edicion.insert(tk.END, linea + '\n\n')

    imagenes_label_edicion = tk.Label(frame_contenido, text="Imágenes del Producto:", bg='#000000', fg='#FFFF66')
    imagenes_label_edicion.pack(anchor='w', padx=10, pady=5)

    # Frame para las imágenes
    frame_imagenes = tk.Frame(frame_contenido, bg='#000000')
    frame_imagenes.pack(anchor='w', padx=10, pady=5)

    # Mostrar las imágenes actuales
    imagen_entries_edicion = []
    carousel = producto_html.find('div', class_='carousel')
    if carousel:
        imagen_tags = carousel.find_all('img')
        for img_tag in imagen_tags:
            ruta_imagen = img_tag['src']
            frame_imagen = tk.Frame(frame_imagenes, bg='#000000')
            frame_imagen.pack(anchor='w', pady=2)
            entry = tk.Entry(frame_imagen, width=30)
            entry.insert(0, ruta_imagen)
            entry.pack(side=tk.LEFT, padx=5)
            imagen_entries_edicion.append(entry)

            # Botón para eliminar la imagen seleccionada
            eliminar_btn = tk.Button(frame_imagen, text="Eliminar", command=lambda e=entry, f=frame_imagen: eliminar_imagen(e, f, imagen_entries_edicion))
            eliminar_btn.pack(side=tk.LEFT, padx=5)

    # Función para eliminar una imagen seleccionada en la ventana de edición
    def eliminar_imagen(entry, frame_imagen, imagen_entries_edicion):
        frame_imagen.pack_forget()  # Ocultar el frame que contiene la imagen y el botón
        if entry in imagen_entries_edicion:  # Verificar si el entry está en la lista
            imagen_entries_edicion.remove(entry)  # Eliminar la entrada de la lista

    # Botón para añadir nuevas imágenes
    def seleccionar_nuevas_imagenes():
        imagenes_paths = filedialog.askopenfilenames(title="Seleccionar Imágenes", filetypes=[("Image files", "*.jpg;*.jpeg;*.png")])
        if imagenes_paths:
            for path in imagenes_paths:
                ruta_relativa = os.path.relpath(path, os.getcwd())
                frame_imagen = tk.Frame(frame_imagenes, bg='#000000')
                frame_imagen.pack(anchor='w', pady=2)

                entry = tk.Entry(frame_imagen, width=30)
                entry.insert(0, ruta_relativa)
                entry.pack(side=tk.LEFT, padx=5)
                imagen_entries_edicion.append(entry)

                eliminar_btn = tk.Button(frame_imagen, text="Eliminar", command=lambda e=entry, f=frame_imagen: eliminar_imagen(e, f, imagen_entries_edicion))
                eliminar_btn.pack(side=tk.LEFT, padx=5)

    tk.Button(frame_contenido, text="Añadir Nuevas Imágenes", command=seleccionar_nuevas_imagenes, bg='#4CAF50', fg='white').pack(anchor='w', padx=10, pady=5)

    # Función para mostrar una notificación que se oculta automáticamente
    def mostrar_notificacion(texto, ventana_padre):
        # Crear una ventana emergente tipo notificación
        notificacion = tk.Toplevel(ventana_padre)
        notificacion.overrideredirect(True)  # Remover bordes y barra de título
        notificacion.geometry(f"300x50+{ventana_padre.winfo_x() + 100}+{ventana_padre.winfo_y() + 100}")
        notificacion.configure(bg='#4CAF50')

        # Crear un mensaje en la notificación
        mensaje = tk.Label(notificacion, text=texto, bg='#4CAF50', fg='white')
        mensaje.pack(fill=tk.BOTH, expand=True)

        # Cerrar automáticamente la notificación después de 3 segundos (3000 ms)
        notificacion.after(3000, notificacion.destroy)


    # Botón para guardar los cambios
    import re

    def guardar_ediciones():
        nuevo_nombre = nombre_entry_edicion.get()
        nuevo_precio = precio_entry_edicion.get()
        nueva_descripcion = descripcion_entry_edicion.get("1.0", tk.END).strip()

        # Asegurarse de que el nuevo precio esté en el formato correcto (con punto decimal)
        nuevo_precio = nuevo_precio.replace(',', '.').strip()

        # Actualizar el nombre del producto
        producto_html.find('h3', class_='titulo-producto').string = nuevo_nombre

        # Actualizar el precio en el elemento <p class="precio">
        producto_html.find('p', class_='precio').string = f"${nuevo_precio}"

        # Actualizar el precio en el botón "Agregar al Carrito" (atributo 'onclick')
        button = producto_html.find('button', class_='button')
        if button:
            onclick_text = button['onclick']
            
            # Utilizar expresión regular para actualizar el precio en la función 'agregarAlCarrito'
            nuevo_onclick_text = re.sub(
                r"\(\'.*\'\,\s*\d+(\.\d+)?\)",  # Expresión regular para capturar el precio con punto decimal
                f"('{nuevo_nombre}', {nuevo_precio})",
                onclick_text
            )
            button['onclick'] = nuevo_onclick_text

        # Actualizar la descripción del producto
        descripcion_html = ''.join(f'<p>{p}</p>' for p in nueva_descripcion.split('\n') if p.strip())
        descripcion_div = producto_html.find_all('p')[0].parent
        descripcion_div.clear()
        descripcion_div.append(BeautifulSoup(descripcion_html, 'html.parser'))

        # Actualizar las imágenes del carrusel
        carousel_images = producto_html.find('div', class_='carousel-images')
        if carousel_images:
            carousel_images.clear()
            for index, entry in enumerate(imagen_entries_edicion):
                nueva_ruta_imagen = entry.get()
                a_tag = soup.new_tag('a', href=nueva_ruta_imagen, **{
                    'data-fancybox': f"gallery-{nuevo_nombre}",
                    'data-caption': nuevo_nombre
                })
                img_tag = soup.new_tag('img', src=nueva_ruta_imagen, alt=nuevo_nombre)
                
                if index == 0:
                    img_tag['class'] = 'active'
                
                a_tag.append(img_tag)
                carousel_images.append(a_tag)

        # Guardar el HTML actualizado y recargar los productos
        guardar_html(soup)
        cargar_productos()

        # Mostrar una notificación que se cierra automáticamente
        mostrar_notificacion("Producto editado correctamente.", ventana_edicion)

        # Cerrar la ventana después de que se muestre la notificación
        ventana_edicion.after(500, ventana_edicion.destroy)

    tk.Button(frame_contenido, text="Guardar Cambios", command=guardar_ediciones, bg='#FF9800', fg='white').pack(anchor='w', padx=10, pady=10)


# Función para mostrar notificaciones temporales en la interfaz
def mostrar_notificacion(mensaje, tipo="info"):
    # Crear un contenedor para la notificación
    notificacion = tk.Label(ventana, text=mensaje, bg="#4CAF50", fg="white", font=("Arial", 12), padx=10, pady=5)

    # Cambiar colores según el tipo
    if tipo == "error":
        notificacion.config(bg="#F44336")  # Rojo para errores
    elif tipo == "info":
        notificacion.config(bg="#4CAF50")  # Verde para éxito

    # Colocar la notificación en la parte superior de la ventana
    notificacion.place(relx=0.5, rely=0.1, anchor="center")

    # Ocultar la notificación automáticamente después de 3 segundos
    ventana.after(3000, notificacion.destroy)

    # Botón para guardar los cambios
    def guardar_ediciones():
        nuevo_nombre = nombre_entry_edicion.get()
        nuevo_precio = precio_entry_edicion.get()
        nueva_descripcion = descripcion_entry_edicion.get("1.0", tk.END).strip()

        # Actualizar el nombre, precio y descripción en el HTML
        producto_html.find('h3', class_='titulo-producto').string = nuevo_nombre
        producto_html.find('p', class_='precio').string = f"${nuevo_precio}"
        
        # Actualizar la descripción
        descripcion_html = ''.join(f'<p>{p}</p>' for p in nueva_descripcion.split('\n') if p.strip())
        descripcion_div = producto_html.find_all('p')[0].parent
        descripcion_div.clear()
        descripcion_div.append(BeautifulSoup(descripcion_html, 'html.parser'))

        # Actualizar las imágenes del carrusel manteniendo los botones de navegación
        carousel_images = producto_html.find('div', class_='carousel-images')
        if carousel_images:
            carousel_images.clear()  # Limpiar las imágenes actuales
            for index, entry in enumerate(imagen_entries_edicion):
                nueva_ruta_imagen = entry.get()
                a_tag = soup.new_tag('a', href=nueva_ruta_imagen, **{
                    'data-fancybox': f"gallery-{nuevo_nombre}",
                    'data-caption': nuevo_nombre
                })
                img_tag = soup.new_tag('img', src=nueva_ruta_imagen, alt=nuevo_nombre)
                
                if index == 0:
                    img_tag['class'] = 'active'  # La primera imagen es la activa
                
                a_tag.append(img_tag)
                carousel_images.append(a_tag)

        # Guardar el HTML actualizado y recargar los productos
        guardar_html(soup)
        cargar_productos()

        # Mostrar una notificación que se cierra automáticamente
        mostrar_notificacion("Producto editado correctamente.", ventana_edicion)

        # Cerrar la ventana después de que se muestre la notificación
        ventana_edicion.after(500, ventana_edicion.destroy)

    tk.Button(frame_contenido, text="Guardar Cambios", command=guardar_ediciones, bg='#FF9800', fg='white').pack(anchor='w', padx=10, pady=10)


# Función para seleccionar una nueva imagen y actualizar la entrada correspondiente
def seleccionar_nueva_imagen(entry):
    nueva_ruta = filedialog.askopenfilename(filetypes=[("Image files", "*.jpg;*.jpeg;*.png")])
    if nueva_ruta:
        ruta_relativa = os.path.relpath(nueva_ruta, os.getcwd())
        entry.delete(0, tk.END)
        entry.insert(0, ruta_relativa)
        
        

# Función para ocultar el producto seleccionado comentándolo
def ocultar_producto():
    seleccionado = productos_listbox.curselection()
    if not seleccionado:
        messagebox.showwarning("Advertencia", "Seleccione un producto para ocultar.")
        return

    nombre_producto = productos_listbox.get(seleccionado).strip()
    producto_html = obtener_producto_por_nombre(nombre_producto)
    if producto_html:
        comentario = Comment(str(producto_html))
        producto_html.insert_before(comentario)
        producto_html.decompose()
        cargar_productos()
        messagebox.showinfo("Éxito", "Producto ocultado correctamente.")

# Función para mostrar el producto descomentándolo
def mostrar_producto():
    seleccionado = productos_listbox.curselection()
    if not seleccionado:
        messagebox.showwarning("Advertencia", "Seleccione un producto para mostrar.")
        return

    nombre_producto = productos_listbox.get(seleccionado).strip()
    comentario = obtener_producto_oculto_por_nombre(nombre_producto)
    if comentario:
        producto_html = BeautifulSoup(str(comentario), 'html.parser')
        comentario.insert_after(producto_html)
        comentario.extract()
        cargar_productos()
        messagebox.showinfo("Éxito", "Producto mostrado correctamente.")


# Función para guardar los cambios realizados en el archivo HTML
def guardar_cambios():
    global ruta_archivo_actual

    # Guardar los cambios en el archivo HTML
    guardar_html(soup)  # Usa la función existente para guardar el archivo

    # Leer el contenido del archivo actualizado
    if ruta_archivo_actual:
        with open(ruta_archivo_actual, 'r', encoding='utf-8') as file:
            contenido = file.read()

        # Copiar el contenido al portapapeles
        pyperclip.copy(contenido)

        # Mostrar una notificación de que se ha copiado
        mostrar_notificacion("Cambios guardados y copiados al portapapeles.")
    else:
        messagebox.showerror("Error", "No se ha cargado ningún archivo.")


# Función para seleccionar el archivo HTML si se desea cargar otro
def seleccionar_archivo():
    global soup
    ruta_html = filedialog.askopenfilename(filetypes=[("HTML files", "*.html")])
    if ruta_html:
        soup = cargar_html(ruta_html)
        cargar_productos()
        messagebox.showinfo("Archivo Cargado", f"Archivo {ruta_html} cargado correctamente.")

# Función para boton limpiar
def limpiar_campos():
    # Mantener el prefijo "Berakhah B-" y limpiar solo la parte del número
    nombre_entry.delete(0, tk.END)
    nombre_entry.insert(0, "Berakhah B-")  # Deja el prefijo intacto

    precio_entry.delete(0, tk.END)  # Limpiar campo de precio
    descripcion_entry.delete("1.0", tk.END)  # Limpiar campo de descripción

    # Limpiar las entradas de imágenes
    for entry in imagen_entries:
        entry.master.pack_forget()  # Ocultar el frame del campo de imagen y botón
        entry.delete(0, tk.END)  # Limpiar la entrada de la imagen
    
    imagen_entries.clear()  # Vaciar la lista de entradas de imágenes
    imagenes_label.config(text="No hay imágenes seleccionadas.")  # Actualizar etiqueta de imágenes

def mostrar_notificacion(mensaje, duracion=2000):
    # Crear una ventana Toplevel para la notificación
    notificacion = tk.Toplevel(ventana)
    notificacion.overrideredirect(True)  # Sin bordes ni barra de título
    notificacion.configure(bg='#333333')  # Color de fondo

    # Colocar el mensaje en la ventana de notificación
    etiqueta = tk.Label(notificacion, text=mensaje, bg='#333333', fg='#FFFF00', font=("Arial", 12))
    etiqueta.pack(padx=10, pady=5)

    # Obtener la posición de la ventana principal y ubicar la notificación en el centro de la pantalla
    ventana_x = ventana.winfo_x()
    ventana_y = ventana.winfo_y()
    ventana_ancho = ventana.winfo_width()
    ventana_alto = ventana.winfo_height()
    notificacion.geometry(f"+{ventana_x + ventana_ancho//2 - 100}+{ventana_y + ventana_alto//2}")

    # Cerrar la notificación después de la duración especificada (en milisegundos)
    ventana.after(duracion, notificacion.destroy)

# Crear la ventana principal
ventana = tk.Tk()
ventana.title("Editor de Productos")
ventana.geometry("1087x560+100+100")
ventana.configure(bg='#000000')

# Marco principal
frame = tk.Frame(ventana, padx=20, pady=20, bg='#000000')
frame.pack(fill=tk.BOTH, expand=True)

# Panel izquierdo para botones más grandes
left_frame = tk.Frame(frame, bg='#000000')
left_frame.grid(row=0, column=0, sticky="ns")

# Crear la variable BooleanVar para habilitar/deshabilitar reordenar
reordenar_activo = tk.BooleanVar(value=False)  # Inicialmente desactivado
from tkinter import font  # Importar la clase de fuentes

# Crear una fuente en negrita para los botones
bold_font = font.Font(weight="bold", size=10)  # Cambia '12' al tamaño deseado

# Botones de acciones en el panel izquierdo con fondo negro
tk.Button(left_frame, text="Cargar Archivo HTML", command=seleccionar_archivo, width=20, height=2, bg='#111111', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Agregar Producto", command=agregar_producto, width=20, height=2, bg='#111111', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Eliminar Producto", command=eliminar_producto, width=20, height=2, bg='#F44336', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Ocultar Producto", command=ocultar_producto, width=20, height=2, bg='#FF7043', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Mostrar Producto", command=mostrar_producto, width=20, height=2, bg='#111111', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Comprimir", command=Comprimir.iniciar_ventana_comprimir, width=20, height=2, bg="#111111", fg="white", font=bold_font).pack(pady=3)
tk.Button(left_frame, text="ExporteRappi", command=abrir_exporte_rappi, width=20, height=2, bg='#111111', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Git and Page", command=open_web_page, width=20, height=2, bg='#111111', fg='white', font=bold_font).pack(pady=3)
tk.Button(left_frame, text="Guardar Cambios", command=guardar_cambios, width=20, height=2, bg='#111111', fg='white', font=bold_font).pack(pady=3)

# Checkbutton para habilitar/deshabilitar reordenar con estilo oscuro
tk.Checkbutton(
    left_frame,
    text="Habilitar Reordenar",
    variable=reordenar_activo,
    bg='#111111',  # Fondo negro
    fg='white',  # Texto blanco
    selectcolor='#333333',  # Color oscuro para área seleccionada
    width=17,
    height=2,
    font=bold_font
).pack(pady=3)

# Panel central para campos de entrada
center_frame = tk.Frame(frame, bg='#000000')
center_frame.grid(row=0, column=1, padx=20, sticky="n")

# Campo para la categoría
tk.Label(center_frame, text="Categoría:", bg='#000000', fg='#FFFF66').pack(anchor='w')
categoria_combobox = ttk.Combobox(center_frame, values=['collares', 'pulseras', 'anillos', 'zarcillos', 'caballeros'], state="readonly", width=66)
categoria_combobox.pack(anchor='w', pady=5)
categoria_combobox.set("collares")  # Preselecciona "collares"


# Crear un Frame para colocar el tipo de artículo y el nombre del producto en la misma fila
nombre_frame = tk.Frame(center_frame, bg='#000000')
nombre_frame.pack(anchor='w', pady=5)

# Etiquetas arriba de los campos
tk.Label(nombre_frame, text="Tipo de Artículo:", bg='#000000', fg='#FFFF66').grid(row=0, column=0, padx=5)
tk.Label(nombre_frame, text="Nombre del Producto:", bg='#000000', fg='#FFFF66').grid(row=0, column=1, padx=10)

# Agregar el campo de selección de tipo de artículo (Collar, Zarcillo, Pulsera, Anillo)
tipo_articulo_combobox = ttk.Combobox(nombre_frame, values=['Collar', 'Zarcillo', 'Pulsera', 'Anillo'], state="readonly", width=15)
tipo_articulo_combobox.grid(row=1, column=0, padx=5)
tipo_articulo_combobox.set("Collar")  # Preselecciona "Collar"

# Mantener el campo para el nombre del producto al lado del tipo de artículo
nombre_entry = tk.Entry(nombre_frame, width=47)
nombre_entry.insert(0, "Berakhah B-")
nombre_entry.grid(row=1, column=1, padx=10)

# Campo para el precio
tk.Label(center_frame, text="Precio:", bg='#000000', fg='#FFFF66').pack(anchor='w')
precio_entry = tk.Entry(center_frame, width=69)
precio_entry.pack(anchor='w', pady=5)

# Campo para la descripción
tk.Label(center_frame, text="Descripción:", bg='#000000', fg='#FFFF66').pack(anchor='w')
descripcion_entry = scrolledtext.ScrolledText(center_frame, width=50, height=5, bg='#ffffff', fg='#000000', wrap=tk.WORD)  # Ajustar el wrap a WORD
descripcion_entry.pack(anchor='w', pady=5)

# Botón para seleccionar imágenes debajo de la descripción
imagenes_label = tk.Label(center_frame, text="No hay imágenes seleccionadas.", bg='#000000', fg='#FFFF66')
imagenes_label.pack(anchor='w', pady=3)

# Crear un Frame para los botones Seleccionar Imágenes y Limpiar Campos
boton_frame = tk.Frame(center_frame, bg='#000000')
boton_frame.pack(anchor='w', pady=5)

# Botón para seleccionar imágenes
tk.Button(boton_frame, text="Seleccionar Imágenes", command=seleccionar_imagenes,bg='#111111', fg='white', font=bold_font).pack(side=tk.LEFT, padx=5)
# Botón para limpiar campos al lado del botón seleccionar imágenes
tk.Button(boton_frame, text="Limpiar Campos", command=limpiar_campos,bg='#111111', fg='white', font=bold_font).pack(side=tk.LEFT, padx=5)


# Panel derecho para la lista de productos y vista previa de imágenes
right_frame = tk.Frame(frame, bg='#000000')
right_frame.grid(row=0, column=2, padx=20, sticky="n")

# Sub-paneles dentro del panel derecho
productos_frame = tk.Frame(right_frame, bg='#000000')
productos_frame.pack(side='left', fill='both', expand=True)

imagen_frame = tk.Frame(right_frame, bg='#000000')
imagen_frame.pack(side='left', fill='both', padx=10, pady=10)

# Campo de búsqueda (se coloca justo arriba de la lista de productos)
tk.Label(productos_frame, text="Buscar Producto:", bg='#000000', fg='#FFFF99').pack(anchor='w')
search_entry = tk.Entry(productos_frame, width=40)  # Puedes ajustar el ancho si es necesario
search_entry.pack(anchor='w', pady=5)

# Función para manejar la búsqueda
def buscar_producto(event):
    termino_busqueda = search_entry.get().lower()  # Obtener el término de búsqueda en minúsculas
    productos_listbox.delete(0, tk.END)  # Limpiar el listbox
    
    # Filtrar productos por coincidencias parciales
    for categoria, productos in productos_por_categoria.items():
        coincidencias = [producto for producto in productos if termino_busqueda in producto.lower()]
        
        if coincidencias:
            productos_listbox.insert(tk.END, f"-- {categoria.upper()} --")
            for producto in coincidencias:
                productos_listbox.insert(tk.END, f"  {producto}")

# Vincular la búsqueda con la entrada de texto
search_entry.bind("<KeyRelease>", buscar_producto)

# Lista de productos en el sub-panel izquierdo
productos_listbox = tk.Listbox(productos_frame, width=40, height=30)
productos_listbox.pack(pady=2)
productos_listbox.bind('<<ListboxSelect>>', lambda event: mostrar_imagen_producto())
productos_listbox.bind("<Button-1>", iniciar_arrastre)  # Al hacer clic, iniciar arrastre
productos_listbox.bind("<B1-Motion>", lambda event: None)  # Habilitar movimiento (sin acción)
productos_listbox.bind("<ButtonRelease-1>", finalizar_arrastre)  # Al soltar, finalizar arrastre


# Vincular el evento de doble clic para abrir la ventana de edición
productos_listbox.bind("<Double-1>", on_double_click_producto)

# Vincular la selección para mostrar la imagen del producto en el sub-panel de vista previa
productos_listbox.bind('<<ListboxSelect>>', lambda event: mostrar_imagen_producto())

# Vista previa de la imagen en el sub-panel derecho
imagen_label = tk.Label(imagen_frame, bg='#000000', fg='#FFFF99', text="Vista Previa de Imagen")
imagen_label.pack(pady=10)

# Cargar productos si el archivo por defecto está cargado
if os.path.exists(default_html_path):
    soup = cargar_html(default_html_path)
    cargar_productos()

ventana.mainloop()