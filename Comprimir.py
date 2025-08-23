import os
import threading
import tkinter as tk
from tkinter import filedialog, ttk
from PIL import Image

def iniciar_ventana_comprimir(parent_window=None):
    # Crear ventana principal
    ventana = tk.Toplevel(parent_window) if parent_window else tk.Tk()
    ventana.title("Compresor de imágenes Berakhah")

    # Función para seleccionar las imágenes
    def seleccionar_imagenes():
        rutas_imagenes = filedialog.askopenfilenames(
            title="Seleccionar imágenes",
            filetypes=[("Imágenes", ".jpg .jpeg .png .gif .bmp")]
        )
        entrada_entrada.delete(0, tk.END)
        entrada_entrada.insert(0, ', '.join(rutas_imagenes))

    # Función para comprimir imágenes
    def comprimir_imagenes():
        carpeta_salida = entrada_salida.get()
        calidad = int(entrada_calidad.get())
        texto_log.delete(1.0, tk.END)
        barra_progreso['value'] = 0

        rutas_imagenes = entrada_entrada.get().split(', ')

        total_imagenes = len(rutas_imagenes)
        contador = 0
        nombre_base = entrada_nombre.get() if opcion_nombre.get() else None

        for ruta_imagen in rutas_imagenes:
            try:
                imagen = Image.open(ruta_imagen)
                nombre_archivo = os.path.basename(ruta_imagen)
                if nombre_base:
                    nombre_salida = f"{nombre_base}{'-' + str(contador) if contador > 0 else ''}{os.path.splitext(nombre_archivo)[1]}"
                else:
                    nombre_salida = nombre_archivo
                nombre_salida = os.path.join(carpeta_salida, nombre_salida)
                imagen.save(nombre_salida, optimize=True, quality=calidad)
                texto_log.insert(tk.END, f"Imagen comprimida guardada en: {nombre_salida}\n")
                contador += 1
                barra_progreso['value'] = (contador / total_imagenes) * 100
                ventana.update_idletasks()
            except Exception as e:
                texto_log.insert(tk.END, f"Error al comprimir la imagen {ruta_imagen}: {e}\n")

        texto_log.insert(tk.END, "Compresión finalizada\n")

    # Función para iniciar la compresión en un hilo separado
    def iniciar_compresion():
        thread = threading.Thread(target=comprimir_imagenes)
        thread.start()

    # Entrada de la carpeta/archivos
    frame_entrada = tk.Frame(ventana)
    frame_entrada.pack()
    tk.Label(frame_entrada, text="Imagen:").pack(side=tk.LEFT)
    entrada_entrada = tk.Entry(frame_entrada, width=50)
    entrada_entrada.pack(side=tk.LEFT)
    tk.Button(frame_entrada, text="Seleccionar", command=seleccionar_imagenes).pack(side=tk.LEFT)

    # Carpeta de salida
    frame_salida = tk.Frame(ventana)
    frame_salida.pack()
    tk.Label(frame_salida, text="Salida   :").pack(side=tk.LEFT)
    entrada_salida = tk.Entry(frame_salida, width=50)
    entrada_salida.pack(side=tk.LEFT)
    tk.Button(
        frame_salida, text="Seleccionar",
        command=lambda: entrada_salida.delete(0, tk.END) or entrada_salida.insert(0, filedialog.askdirectory(title="Seleccionar carpeta"))
    ).pack(side=tk.LEFT)

    # Calidad de las imágenes
    frame_calidad = tk.Frame(ventana)
    frame_calidad.pack()
    tk.Label(frame_calidad, text="Calidad (1-100):").pack(side=tk.LEFT)
    entrada_calidad = tk.Entry(frame_calidad, width=10)
    entrada_calidad.pack(side=tk.LEFT)

    # Nombre personalizado
    frame_nombre = tk.Frame(ventana)
    frame_nombre.pack()
    tk.Label(frame_nombre, text="Nombre personalizado:").pack(side=tk.LEFT)
    entrada_nombre = tk.Entry(frame_nombre, width=20)
    entrada_nombre.pack(side=tk.LEFT)
    opcion_nombre = tk.BooleanVar()
    tk.Checkbutton(frame_nombre, text="Agregar nombre", variable=opcion_nombre).pack(side=tk.LEFT)

    # Botón para comprimir imágenes
    tk.Button(ventana, text="Comprimir imágenes", command=iniciar_compresion).pack()

    # Barra de progreso
    barra_progreso = ttk.Progressbar(ventana, orient="horizontal", length=200, mode="determinate")
    barra_progreso.pack()

    # Log de actividad
    frame_log = tk.Frame(ventana)
    frame_log.pack()
    texto_log = tk.Text(frame_log, width=60, height=10)
    texto_log.pack()

    ventana.mainloop()

# Comprobar si el archivo se ejecuta directamente
if __name__ == "__main__":
    iniciar_ventana_comprimir()
