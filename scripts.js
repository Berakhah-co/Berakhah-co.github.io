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

    let bodyClass = document.body.classList.contains('en') ? 'en' : 'es';

    carrito.forEach((producto, index) => {
        totalCarrito += parseFloat(producto.precio);
        let li = document.createElement('li');
        
        let precioFormateado = bodyClass === 'en' 
            ? parseFloat(producto.precio).toLocaleString('en-US', { minimumFractionDigits: 0 }) 
            : parseFloat(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 3 });

        li.innerHTML = `
            ${producto.nombre} - $${precioFormateado}
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
    });

    let totalFormateado = bodyClass === 'en' 
        ? totalCarrito.toLocaleString('en-US', { minimumFractionDigits: 0 })
        : totalCarrito.toLocaleString('es-CO', { minimumFractionDigits: 3 });

    document.getElementById('total-carrito').textContent = totalFormateado;
    actualizarContadorCarrito();
}


// Función para mostrar una notificación con SweetAlert2
function mostrarNotificacion(nombre) {
    // Detectar el idioma basado en la clase del body ('en' para inglés, 'es' para español)
    const bodyClass = document.body.classList.contains('en') ? 'en' : 'es';

    // Establecer el título y el mensaje dependiendo del idioma
    const title = bodyClass === 'en' ? 'Product Added!' : '¡Producto Agregado!';
    const message = bodyClass === 'en'
        ? `${nombre} has been added to the cart.`
        : `${nombre} ha sido añadido al carrito.`;

    // Mostrar alerta usando SweetAlert2 con el mensaje correcto en un solo idioma
    Swal.fire({
        title: title,
        text: message,  // El mensaje correcto solo en el idioma correspondiente
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,  // Duración de la notificación en milisegundos
        position: 'center',
        background: '#28a745',
        color: '#ffffff'
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
    const imagenProducto = document.querySelector(`[alt='${nombre}']`)?.src || '';
    const rutaImagen = imagenProducto.split('/').slice(-2).join('/');
    const urlCompletaImagen = `https://berakhah.site/${rutaImagen}`;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push({ nombre, precio, imagen: urlCompletaImagen });
    localStorage.setItem('carrito', JSON.stringify(carrito));

    mostrarCarrito();
    mostrarNotificacion(nombre);  // Solo pasar el nombre, sin texto añadido
    lanzarConfeti();
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
        Swal.fire('El carrito está vacío.');
        return;
    }

    // Detectar el idioma basado en la clase del body ('en' para inglés, 'es' para español)
    const bodyClass = document.body.classList.contains('en') ? 'en' : 'es';

    let mensaje = '🛒 *Pedido Realizado:*\n\n';
    let total = 0;

    carrito.forEach((producto, index) => {
        // Redondear si el precio no tiene decimales
        let precioFormateado;

        if (bodyClass === 'en') {
            // Para inglés, sin decimales si es un número entero
            precioFormateado = Number.isInteger(parseFloat(producto.precio)) 
                ? parseFloat(producto.precio).toLocaleString('en-US', { minimumFractionDigits: 0 }) 
                : parseFloat(producto.precio).toLocaleString('en-US', { minimumFractionDigits: 2 });
        } else {
            // Para español, usar 3 decimales en Colombia
            precioFormateado = parseFloat(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 3 });
        }

        mensaje += `${index + 1}. *${producto.nombre}* - $${precioFormateado}\n`;

        // Incluir el enlace de la imagen con un emoji
        if (producto.imagen) {
            mensaje += `🔗 Imagen: ${producto.imagen}\n`;
        }

        total += parseFloat(producto.precio);
    });

    // Formatear el total de manera similar
    let totalFormateado;
    
    if (bodyClass === 'en') {
        totalFormateado = Number.isInteger(total)
            ? total.toLocaleString('en-US', { minimumFractionDigits: 0 })
            : total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
        totalFormateado = total.toLocaleString('es-CO', { minimumFractionDigits: 3 });
    }

    mensaje += `\n🧾 *Total:* $${totalFormateado}`;

    const numeroWhatsApp = "+573184818218";
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');

    // Mostrar SweetAlert2 con confetti para indicar que se ha enviado el pedido
    Swal.fire({
        title: bodyClass === 'en' ? 'Order Sent!' : '¡Pedido Enviado!',
        text: bodyClass === 'en' ? 'Thank you for your purchase. Do you want to empty the cart?' : 'Gracias por tu compra. ¿Deseas vaciar el carrito?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: bodyClass === 'en' ? 'Yes, empty cart' : 'Sí, vaciar carrito',
        cancelButtonText: bodyClass === 'en' ? 'No, keep cart' : 'No, mantener carrito',
        background: '#ffffff',
        color: '#000000',
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito(); // Llamar a la función para vaciar el carrito
        }
    });

    // Lanza confeti después de que se muestra el SweetAlert
    confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: { x: 0.5, y: 0.5 }
    });
}

// Función para vaciar el carrito

function vaciarCarrito() {
    const carritoContenedor = document.getElementById('lista-carrito');
    localStorage.removeItem('carrito');
    mostrarCarrito();

    carritoContenedor.classList.add('animacion-existente');
    setTimeout(() => {
        carritoContenedor.classList.remove('animacion-existente');
    }, 500); // Duración de la animación

    const bodyClass = document.body.classList.contains('en') ? 'en' : 'es';
    Swal.fire({
        title: bodyClass === 'en' ? 'Cart emptied!' : '¡Carrito Vacío!',
        text: bodyClass === 'en' ? 'Your cart has been emptied.' : 'Has vaciado tu carrito.',
        icon: 'info',
        background: '#dc3545',
        color: '#ffffff',
        timer: 2000,
        showConfirmButton: false
    });

    lanzarConfeti(); // Lanza confeti al vaciar el carrito
}






// Añadir el evento al botón de vaciar carrito
document.getElementById('btn-vaciar-carrito').addEventListener('click', () => {
    const bodyClass = document.body.classList.contains('en') ? 'en' : 'es';

    Swal.fire({
        title: bodyClass === 'en' ? 'Are you sure?' : '¿Estás seguro?',
        text: bodyClass === 'en' ? 'You are about to empty your cart.' : 'Estás a punto de vaciar tu carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: bodyClass === 'en' ? 'Yes, empty it' : 'Sí, vaciar',
        cancelButtonText: bodyClass === 'en' ? 'No, keep it' : 'No, mantener',
        background: '#dc3545',
        color: '#ffffff',
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito(); // Llama a la función de vaciar el carrito si el usuario confirma
        }
    });
});


// Función para mostrar u ocultar el carrito
function toggleCarrito() {
    let carrito = document.getElementById('carrito');
    carrito.style.display = carrito.style.display === 'none' ? 'block' : 'none';
    
}
// evento para mostrar u ocultar el carrito con la X
document.getElementById('cerrar-carrito').addEventListener('click', toggleCarrito);
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

// Movimiento automático en el carrusel
document.addEventListener('DOMContentLoaded', function () {
    const carousels = document.querySelectorAll('.carousel-images');
    let intervalTime = 7000; // Tiempo en milisegundos (7 segundos)
    let intervalID; // Variable para almacenar el ID del intervalo

    // Función para mostrar la siguiente imagen en cada carousel
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

    // Función para iniciar el ciclo automático de cambio de imágenes
    function startCarousel() {
        intervalID = setInterval(() => {
            carousels.forEach(carousel => showNextImage(carousel));
        }, intervalTime);
    }

    // Función para detener el ciclo automático
    function stopCarousel() {
        clearInterval(intervalID);
    }

    // Inicia el carrusel automáticamente
    startCarousel();

    // Detectar cuando el usuario cambia las imágenes manualmente
    carousels.forEach(carousel => {
        const prevButton = carousel.parentElement.querySelector('.carousel-button.prev');
        const nextButton = carousel.parentElement.querySelector('.carousel-button.next');

        // Detener el carrusel si el usuario hace clic en los botones
        prevButton.addEventListener('click', () => {
            stopCarousel(); // Detener el cambio automático
        });

        nextButton.addEventListener('click', () => {
            stopCarousel(); // Detener el cambio automático
        });

        // Detener también si el usuario desliza imágenes (en dispositivos táctiles)
        carousel.addEventListener('touchstart', () => {
            stopCarousel(); // Detener el cambio automático
        });
    });
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
    }, 2000); // Ajusta el tiempo de la animación al mismo que el CSS o según la carga real
});



