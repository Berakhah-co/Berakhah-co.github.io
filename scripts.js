// Obtener todos los productos al cargar la página en el orden original
const productosOriginales = Array.from(document.querySelectorAll('.producto'));
// Array que usaremos para aleatorizar en la categoría "Todos"
let productosAleatorios = [...productosOriginales];

// Función para mezclar el array usando Fisher-Yates
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Intercambiar elementos
    }
    return array;
  }
  
  // Función para mostrar productos por categoría
  function mostrarCategoria(categoria) {
      const contenedor = document.querySelector('.catalogo'); // Contenedor del catálogo
  
      // Si es la categoría "Todos", mezclar el array de productos usando Fisher-Yates
      if (categoria === 'todo') {
          productosAleatorios = [...productosOriginales]; // Resetear el orden a original antes de mezclar
          mezclarArray(productosAleatorios); // Mezclar el array
      }
  
      // Limpiar el contenedor del catálogo para evitar duplicados
      contenedor.innerHTML = '';
  
      // Determinar el array de productos a usar (mezclado u original)
      const productosAMostrar = categoria === 'todo' ? productosAleatorios : productosOriginales;
  
      // Filtrar y agregar productos según la categoría seleccionada
      productosAMostrar.forEach(producto => {
          if (categoria === 'todo' || producto.getAttribute('data-categoria') === categoria) {
              producto.style.display = 'block';
              contenedor.appendChild(producto); // Agregar producto al contenedor
          } else {
              producto.style.display = 'none';
          }
      });
  }
  
// Evento para cargar todos los productos al inicio en la categoría "Todos"
document.addEventListener('DOMContentLoaded', () => {
    mostrarCategoria('todo');
});

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
        totalCarrito += parseFloat(producto.precio);
        let li = document.createElement('li');
        
        let nombreModificado = producto.nombre.replace(/Berakhah\s/, '');
        let precioFormateado = parseFloat(producto.precio).toLocaleString(undefined, { minimumFractionDigits: 3 });

        li.innerHTML = `
            <img src="${producto.imagen}" alt="${nombreModificado}" style="width: 50px; height: 50px; margin-right: 10px;" onclick="abrirImagenEnNuevaVentana('${producto.imagen}')">
            ${nombreModificado} - $${precioFormateado}
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
    });

    let totalCarritoFormateado = totalCarrito.toLocaleString(undefined, { minimumFractionDigits: 3 });

    const totalCarritoElemento = document.getElementById('total-carrito');
    totalCarritoElemento.innerHTML = `
        <p class="total"><strong>Total: $${totalCarritoFormateado}</strong></p>`;
    
    actualizarContadorCarrito();
}

// Función para abrir la imagen en una nueva ventana
function abrirImagenEnNuevaVentana(url) {
    window.open(url, '_blank');
}



// Función para mostrar una notificación con SweetAlert2
function mostrarNotificacion(nombre) {
    // Establecer el título y el mensaje en un solo idioma (español)
    const title = '¡Producto Agregado!';
    const message = `${nombre} ha sido añadido al carrito.`;

    // Mostrar alerta usando SweetAlert2 con el mensaje en español
    Swal.fire({
        title: title,
        text: message,
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
function agregarAlCarrito(nombre, precio, imagenURL) {
    const imagenProducto = document.querySelector(`[alt='${nombre}']`)?.src || '';
    const rutaImagen = imagenProducto.split('/').slice(-2).join('/');
    const urlCompletaImagen = `https://berakhah.site/${rutaImagen}`;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Agregar el producto al carrito sin verificar si ya existe
    carrito.push({ nombre, precio, imagen: urlCompletaImagen });

    // Guardar el carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar la vista del carrito
    mostrarCarrito();

    // Mostrar notificación
    mostrarNotificacion(nombre);

    // Lanzar confeti
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

    let mensaje = '🎉🛍️ *¡Tu Pedido Está Listo!*\n\n';
    let total = 0;

    // Iterar sobre el carrito
    carrito.forEach((producto, index) => {
        // Obtener el nombre completo del producto
        let nombreProducto = producto.nombre;

        // Obtener la URL de la primera imagen del producto
        let imagenProducto = producto.imagen || '';
        let subtotalProducto = parseFloat(producto.precio);

        // Calcular el precio formateado
        let precioFormateado = subtotalProducto.toLocaleString(undefined, { minimumFractionDigits: 3 });

        // Añadir el producto al mensaje (nombre completo y link de la primera imagen)
        mensaje += `🌟${nombreProducto}: *$${precioFormateado}*  \n🖼️${imagenProducto}\n--------------------------------------------------------\n`;
        total += subtotalProducto;
    });

    // Formatear el total
    let totalFormateado = total.toLocaleString(undefined, { minimumFractionDigits: 3 });

    // Añadir el total al mensaje
    mensaje += `\n✨ *Total:* $${totalFormateado}`;

    // Enviar mensaje por WhatsApp
    const numeroWhatsApp = "+573184818218";
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');

    // Mostrar SweetAlert2 con confetti para indicar que se ha enviado el pedido
    Swal.fire({
        title: '🎉 ¡Pedido Enviado! 🎉',
        text: 'Gracias por tu compra. ¿Deseas vaciar el carrito?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar carrito',
        cancelButtonText: 'No, mantener carrito',
        background: '#333333', // Color oscuro de fondo
        color: '#D4AF37', // Color dorado para el texto
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito(); // Llamar a la función para vaciar el carrito
        }
    });

    document.getElementById('carrito').style.display = 'none'; // cierra el carrito 

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

    Swal.fire({
        title: '¡Carrito Vacío!',
        text: 'Has vaciado tu carrito.',
        icon: 'info',
        background: '#333333', // Color oscuro de fondo
        color: '#D4AF37', // Color dorado para el texto
        timer: 2000,
        showConfirmButton: false
    });

    lanzarConfeti(); // Lanza confeti al vaciar el carrito
}


// Añadir el evento al botón de vaciar carrito
document.getElementById('btn-vaciar-carrito').addEventListener('click', () => {
    
    // Cerrar el carrito antes de mostrar la alerta
    document.getElementById('carrito').style.display = 'none';

    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Estás a punto de vaciar tu carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'No, mantener',
        background: '#333333', // Color oscuro de fondo
        color: '#D4AF37', // Color dorado para el texto
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito(); // Llama a la función de vaciar el carrito si el usuario confirma
        } else {
            // Si el usuario cancela, puedes volver a mostrar el carrito si es necesario
            document.getElementById('carrito').style.display = 'block';
        }
    });
});

// Selecciona el contenedor del carrito
const carritoContenedor = document.getElementById('carrito');
const productos = document.querySelectorAll('.producto'); // Selecciona todos los contenedores de productos
const btnCerrarCarrito = document.getElementById('cerrar-carrito');

// Función para mostrar u ocultar el carrito
function toggleCarrito() {
    let carrito = document.getElementById('carrito');
    carrito.style.display = carrito.style.display === 'none' ? 'block' : 'none';
    
}
// evento para mostrar u ocultar el carrito con la X
document.getElementById('cerrar-carrito').addEventListener('click', toggleCarrito);

// Función para verificar si el carrito está abierto
function isCarritoAbierto() {
    return carritoContenedor.style.display === 'block';
}

// Evento para cerrar el carrito al hacer clic en cualquier contenedor de producto
productos.forEach(producto => {
    producto.addEventListener('click', (event) => {
        if (isCarritoAbierto()) {
            carritoContenedor.style.display = 'none'; // Cierra el carrito
        }
    });
});

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
    let intervalTime = 15000; // Tiempo en milisegundos (15 segundos)
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


// Desplazar suavemente al inicio de la página al hacer clic en el botón
document.getElementById('btn-volver-inicio').addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
