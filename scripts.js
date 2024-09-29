// Función para mostrar productos por categoría
function mostrarCategoria(categoria) {
    const productos = document.querySelectorAll('.producto');
    productos.forEach(producto => {
        if (categoria === 'todo' || producto.getAttribute('data-categoria') === categoria) {
            producto.style.display = 'block';
        } else {
            producto.style.display = 'none';
        }
    });
}

// Mostrar todos los productos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCategoria('todo');
    mostrarCarrito();
    document.getElementById('btn-pedir').addEventListener('click', enviarPedido);
});

// Función para mostrar el carrito y actualizar el contador
function mostrarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let listaCarrito = document.getElementById('lista-carrito');
    let totalCarrito = 0;
    listaCarrito.innerHTML = '';

    carrito.forEach((producto, index) => {
        // Convertir el precio a una cadena para evitar la eliminación de ceros significativos
        totalCarrito += parseFloat(producto.precio);
        let li = document.createElement('li');
        li.innerHTML = `
            ${producto.nombre} - $${producto.precio.toFixed(3)}
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
    });

    // Mostrar el total correctamente con los ceros significativos
    document.getElementById('total-carrito').textContent = totalCarrito.toFixed(3);
    actualizarContadorCarrito();
}

// Función para mostrar una notificación con SweetAlert2
function mostrarNotificacion(mensaje) {
    // Mostrar alerta usando SweetAlert2
    Swal.fire({
        title: '¡Producto Agregado!',
        text: mensaje,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000, // Duración de la notificación en milisegundos
        position: 'center', // Mostrar en el centro de la pantalla
        background: '#28a745', // Color de fondo para personalizar la alerta
        color: '#ffffff', // Color del texto
    });
}

// Función para lanzar confeti desde el centro de la pantalla
function lanzarConfeti() {
    confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: { x: 0.5, y: 0.5 } // Explota desde el centro de la pantalla
    });
}

// Función para agregar productos al carrito y mostrar la notificación con confeti
function agregarAlCarrito(nombre, precio) {
    // Selecciona la primera imagen del producto usando el atributo alt que coincide con el nombre del producto
    const imagenProducto = document.querySelector(`[alt='${nombre}']`)?.src || '';
    
    // Si la ruta de la imagen es válida, extraer la parte relevante para formar la URL completa
    const rutaImagen = imagenProducto.split('/').slice(-2).join('/');
    const urlCompletaImagen = `https://berakhah.site/${rutaImagen}`;

    // Obtiene el carrito del localStorage o crea uno nuevo si no existe
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push({ nombre, precio, imagen: urlCompletaImagen }); // Añade el nombre, precio y la URL de la imagen
    localStorage.setItem('carrito', JSON.stringify(carrito));

    mostrarCarrito();
    mostrarNotificacion(`${nombre} ha sido añadido al carrito.`); // Mostrar notificación con SweetAlert2
    lanzarConfeti(); // Lanza confeti cuando se agrega el producto
}


// Función para eliminar un producto del carrito y actualizar el contador
function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}


// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    document.getElementById('contador-carrito').textContent = carrito.length;
}


function enviarPedido() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    let mensaje = '🛒 *Pedido Realizado:*\n\n';
    let total = 0;

    carrito.forEach((producto, index) => {
        let precioFormateado = parseFloat(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 3 });
        mensaje += `${index + 1}. *${producto.nombre}* - $${precioFormateado}\n`;
        
        // Incluye el enlace de la imagen con un emoji para hacerlo más atractivo
        if (producto.imagen) {
            mensaje += `🔗 Imagen: ${producto.imagen}\n`;
        }

        total += parseFloat(producto.precio);
    });

    let totalFormateado = total.toLocaleString('es-CO', { minimumFractionDigits: 3 });
    mensaje += `\n🧾 *Total:* $${totalFormateado}`;

    const numeroWhatsApp = "+573184818218";
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    mostrarCarrito();
}




function vaciarCarrito() {
    localStorage.removeItem('carrito');
    mostrarCarrito(); // Actualiza el carrito después de vaciarlo
}

document.getElementById('btn-vaciar-carrito').addEventListener('click', vaciarCarrito);

// Función para mostrar u ocultar el carrito
function toggleCarrito() {
    let carrito = document.getElementById('carrito');
    carrito.style.display = carrito.style.display === 'none' ? 'block' : 'none';
}

// Cargar el contador al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCarrito();
    document.getElementById('btn-pedir').addEventListener('click', enviarPedido);
});

// Función para filtrar productos por categoría
function filtrarCategoria(categoria) {
    let productos = document.querySelectorAll('.producto');
    productos.forEach(producto => {
        producto.style.display = categoria === 'Todo' || producto.getAttribute('data-categoria') === categoria ? 'block' : 'none';
    });
}

// Función para filtrar productos por nombre
function buscarProducto() {
    const terminoBusqueda = document.getElementById('campo-busqueda').value.toLowerCase();
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach(producto => {
        const nombreProducto = producto.querySelector('.titulo-producto').textContent.toLowerCase();
        if (nombreProducto.includes(terminoBusqueda)) {
            producto.style.display = 'block'; // Mostrar el producto si coincide
        } else {
            producto.style.display = 'none'; // Ocultar el producto si no coincide
        }
    });
}

// Añadir el evento al botón de búsqueda
document.getElementById('btn-buscar').addEventListener('click', buscarProducto);

// Opcional: permitir búsqueda al presionar "Enter" en el campo de búsqueda
document.getElementById('campo-busqueda').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        buscarProducto();
    }
});

// JavaScript para cambiar las imágenes del carrusel de forma independiente
function changeImage(step, carouselId) {
    const carousel = document.getElementById(carouselId);
    const images = carousel.querySelectorAll('.carousel-images img');
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    
    images[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + step + images.length) % images.length;
    images[currentIndex].classList.add('active');
}

// Movimiento automatico en el carrusel
document.addEventListener('DOMContentLoaded', function () {
    // Selecciona todos los carruseles en la página
    const carousels = document.querySelectorAll('.carousel-images');
    const intervalTime = 7000; // Tiempo en milisegundos (7 segundos)

    // Función para mostrar la siguiente imagen en cada carrusel
    function showNextImage(carousel) {
        const images = carousel.querySelectorAll('img');
        let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));

        // Remueve la clase 'active' de la imagen actual
        images[currentIndex].classList.remove('active');

        // Incrementa el índice de la imagen, volviendo a 0 si llega al final
        currentIndex = (currentIndex + 1) % images.length;

        // Añade la clase 'active' a la nueva imagen
        images[currentIndex].classList.add('active');
    }

    // Configura el intervalo para cambiar las imágenes automáticamente en todos los carruseles
    setInterval(() => {
        carousels.forEach(carousel => showNextImage(carousel));
    }, intervalTime);
});

document.addEventListener('DOMContentLoaded', function () {
    const productos = document.querySelectorAll('.producto');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    productos.forEach(producto => {
        observer.observe(producto);
    });
});

window.addEventListener('scroll', function () {
    const scrollButton = document.getElementById('btn-volver-inicio');
    const rrssIcons = document.querySelector('.rrss-icons');

    if (window.scrollY > 300) {
        // Mostrar la flecha y ocultar los iconos de redes sociales
        scrollButton.classList.add('show');
        rrssIcons.classList.add('hide');
    } else {
        // Mostrar los iconos de redes sociales y ocultar la flecha
        scrollButton.classList.remove('show');
        rrssIcons.classList.remove('hide');
    }
});

// Desplazar suavemente al inicio de la página al hacer clic en el botón
document.getElementById('btn-volver-inicio').addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Mostrar la barra de carga al iniciar la página
window.addEventListener('load', function () {
    // Simula una pequeña demora para la carga, ajusta según sea necesario
    setTimeout(function() {
        document.getElementById('barra-carga').style.display = 'none'; // Oculta la barra de carga
    }, 3000); // Ajusta el tiempo de la animación al mismo que el CSS o según la carga real
});
