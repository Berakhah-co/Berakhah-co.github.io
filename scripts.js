// Mostrar mensaje al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar mensaje de descuento con SweetAlert2
    const swalWithTimer = Swal.fire({
        title: '🎅 ¡Promoción Navideña! 🎄',
        text: 'Estas Navidades, disfruta de un 10% de descuento en el total de tu carrito.',
        icon: 'success',
        confirmButtonText: '¡Entendido!',
        background: '#007f00', // Verde navideño
        color: '#ffffff', // Letras blancas
        customClass: {
            popup: 'swal2-popup-navidad' // Clase personalizada (por si deseas añadir más estilos)
        },
        timer: 4000, // Tiempo en milisegundos
        timerProgressBar: true, // Mostrar barra de progreso
        didOpen: () => {
            // Lanza confeti con colores navideños después de que el usuario cierre el mensaje
            Swal.showLoading();
            const timerInterval = setInterval(() => {
                Swal.getTimerLeft();
            }, 100);
        },
        willClose: () => {
            // Lanza confeti al cerrar el mensaje automáticamente
            confetti({
                particleCount: 150,
                spread: 360, // Distribución completa
                colors: ['#ff0000', '#00ff00', '#ffffff'], // Colores rojo, verde y blanco
                origin: { x: 0.5, y: 0.5 }, // Explota desde el centro
                scalar: 1.2 // Tamaño de las partículas
            });
        }
    });
});

// Iniciar la nieve al cargar la página
document.addEventListener('DOMContentLoaded', iniciarNieve);

function iniciarNieve() {
    const cantidadCopos = 50; // Número de copos de nieve
    const coposContainer = document.createElement('div');
    coposContainer.classList.add('nieve-contenedor');
    document.body.appendChild(coposContainer);

    for (let i = 0; i < cantidadCopos; i++) {
        const copo = document.createElement('div');
        copo.classList.add('copo-nieve');
        copo.style.left = Math.random() * 100 + 'vw'; // Posición horizontal aleatoria
        copo.style.animationDuration = Math.random() * 8 + 5 + 's'; // Duración de la caída
        copo.style.opacity = Math.random(); // Transparencia aleatoria
        coposContainer.appendChild(copo);
    }
}


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
        let subtotalProducto = parseFloat(producto.precio) * producto.cantidad;
        totalCarrito += subtotalProducto;

        // Obtener el nombre desde "Berakhah" en adelante
        let nombreReducido = producto.nombre.split("Berakhah")[1]?.trim() || producto.nombre;

        let li = document.createElement('li');
        let precioFormateado = subtotalProducto.toLocaleString('es-CO', { minimumFractionDigits: 3 });

        li.innerHTML = `
            Berakhah ${nombreReducido} - 
            <button onclick="cambiarCantidad(${index}, -1)">-</button>
            x${producto.cantidad}
            <button onclick="cambiarCantidad(${index}, 1)">+</button> 
            $${precioFormateado}
        `;
        listaCarrito.appendChild(li);
    });

    // Calcular el descuento del 10%
    let descuento = totalCarrito * 0.10;
    let totalConDescuento = totalCarrito - descuento;

    // Formatear los valores
    let subtotalFormateado = totalCarrito.toLocaleString('es-CO', { minimumFractionDigits: 3 });
    let descuentoFormateado = descuento.toLocaleString('es-CO', { minimumFractionDigits: 3 });
    let totalConDescuentoFormateado = totalConDescuento.toLocaleString('es-CO', { minimumFractionDigits: 3 });

    // Mostrar subtotal, descuento y total
    const totalCarritoElemento = document.getElementById('total-carrito');
    totalCarritoElemento.innerHTML = `
        <p>Subtotal: $${subtotalFormateado}</p>
        <p>Descuento (10%): -$${descuentoFormateado}</p>
        <p><strong>Total con descuento: $${totalConDescuentoFormateado}</strong></p>
    `;

    actualizarContadorCarrito();
}


function cambiarCantidad(index, cambio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Cambiar la cantidad del producto
    carrito[index].cantidad += cambio;

    // Si la cantidad llega a 0, eliminar el producto
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }

    // Guardar el carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // Actualizar la vista del carrito
    mostrarCarrito();
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

    // Verificar si el producto ya está en el carrito
    let productoExistente = carrito.find(producto => producto.nombre === nombre);

    if (productoExistente) {
        // Incrementar la cantidad si ya existe
        productoExistente.cantidad += 1;
    } else {
        // Agregar un nuevo producto con cantidad 1
        carrito.push({ nombre, precio, imagen: urlCompletaImagen, cantidad: 1 });
    }

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
    let subtotalTotal = 0;
    let descuentoTotal = 0;

    // Iterar sobre el carrito
    carrito.forEach((producto, index) => {
        // Obtener el nombre completo del producto (asegúrate de que el nombre completo esté almacenado)
        let nombreProducto = producto.nombre;  // Asegúrate de que 'producto.nombre' tenga el nombre completo

        // Obtener la URL de la primera imagen del producto
        let imagenProducto = producto.imagen || ''; // Asegúrate de que la propiedad 'imagen' esté bien definida en los productos
        let subtotalProducto = parseFloat(producto.precio) * producto.cantidad;
        subtotalTotal += subtotalProducto;

        // Calcular el precio formateado
        let precioFormateado = parseFloat(producto.precio).toLocaleString('es-CO', { minimumFractionDigits: 3 });
        let subtotalFormateado = subtotalProducto.toLocaleString('es-CO', { minimumFractionDigits: 3 });

        // Añadir el producto al mensaje (nombre completo, cantidad, subtotal y link de la primera imagen)
        mensaje += `🌟 *${nombreProducto}* - x${producto.cantidad}  *$${subtotalFormateado}*  
                    🖼️ Imagen: ${imagenProducto}\n`;
        total += subtotalProducto;
    });

    // Calcular el descuento
    let descuento = subtotalTotal * 0.10;
    let totalConDescuento = subtotalTotal - descuento;

    // Formatear el total y el descuento
    let subtotalTotalFormateado = subtotalTotal.toLocaleString('es-CO', { minimumFractionDigits: 3 });
    let descuentoFormateado = descuento.toLocaleString('es-CO', { minimumFractionDigits: 3 });
    let totalConDescuentoFormateado = totalConDescuento.toLocaleString('es-CO', { minimumFractionDigits: 3 });

    // Añadir subtotales, descuento y total
    mensaje += `\n💰 *Subtotal:* $${subtotalTotalFormateado}\n`;
    mensaje += `🎁 *Descuento aplicado (10%):* -$${descuentoFormateado}\n`;
    mensaje += `✨ *Total con descuento:* $${totalConDescuentoFormateado}`;

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

    // Cerrar el carrito antes de mostrar la alerta
    document.getElementById('carrito').style.display = 'none';

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
        } else {
            // Si el usuario cancela, puedes volver a mostrar el carrito si es necesario
            document.getElementById('carrito').style.display = 'block';
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



