// =======================================================================
// === INICIO DE LA LÓGICA PARA LA PROMOCIÓN DEL 8 DE NOVIEMBRE ===
// =======================================================================

// Se ejecuta cuando el contenido de la página ha cargado.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener la fecha actual.
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.getMonth(); // getMonth() devuelve 0 para enero, 1 para febrero, etc.

    // 2. Comprobar si hoy es 8 de noviembre (el mes 10 en base cero).
    if (dia === 8 && mes === 10) {
        // 3. Si es la fecha de la promoción, mostrar un mensaje de bienvenida con SweetAlert2.
        Swal.fire({
            title: '¡Promoción Especial de Hoy!',
            text: 'Todos los productos que agregues al carrito hoy, 8 de noviembre, tendrán un precio especial de $37.999.',
            icon: 'info',
            confirmButtonText: '¡Entendido!',
            background: '#333333',
            color: '#D4AF37'
        });
    }
});

// =======================================================================
// === FIN DE LA LÓGICA DE PROMOCIÓN ===
// =======================================================================


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
      if (contenedor) {
        contenedor.innerHTML = '';
      }
  
      // Determinar el array de productos a usar (mezclado u original)
      const productosAMostrar = categoria === 'todo' ? productosAleatorios : productosOriginales;
  
      // Filtrar y agregar productos según la categoría seleccionada
      productosAMostrar.forEach(producto => {
          if (categoria === 'todo' || producto.getAttribute('data-categoria') === categoria) {
              producto.style.display = 'block';
              if (contenedor) {
                contenedor.appendChild(producto); // Agregar producto al contenedor
              }
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
    const btnPedir = document.getElementById('btn-pedir');
    if (btnPedir) {
        btnPedir.addEventListener('click', enviarPedido);
    }
});

// Función para mostrar el carrito y actualizar el contador
function mostrarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let listaCarrito = document.getElementById('lista-carrito');
    let totalCarrito = 0;
    if (!listaCarrito) return; // Salir si el elemento no existe
    
    listaCarrito.innerHTML = '';

    carrito.forEach((producto, index) => {
        totalCarrito += parseFloat(producto.precio);
        let li = document.createElement('li');
        
        let nombreModificado = producto.nombre.replace(/Berakhah\s/, '');
        // El formateo del precio se hace aquí, tomando el valor guardado en el carrito.
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
    if (totalCarritoElemento) {
        totalCarritoElemento.innerHTML = `
            <p class="total"><strong>Total: $${totalCarritoFormateado}</strong></p>`;
    }
    
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
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 360,
            origin: { x: 0.5, y: 0.5 } // Explota desde el centro de la pantalla
        });
    }
}


// =======================================================================
// === FUNCIÓN MODIFICADA PARA LA PROMOCIÓN ===
// =======================================================================
function agregarAlCarrito(nombre, precio) {
    // 1. Definir el precio especial y verificar si la promoción está activa.
    const precioEspecial = 37999;
    const hoy = new Date();
    const esDiaDePromocion = hoy.getDate() === 8 && hoy.getMonth() === 10; // 8 de Noviembre

    // 2. Determinar el precio final del producto.
    // Si es día de promoción, usar el precio especial. Si no, usar el precio original.
    const precioFinal = esDiaDePromocion ? precioEspecial : precio;

    // 3. Encuentra el elemento de la imagen del producto.
    const imagenProducto = document.querySelector(`img[alt='${nombre}']`);
    const urlCompletaImagen = imagenProducto ? imagenProducto.src : '';

    // 4. Obtener el carrito actual.
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 5. Agregar el nuevo producto al carrito con el PRECIO FINAL determinado.
    carrito.push({ nombre, precio: precioFinal, imagen: urlCompletaImagen });

    // 6. Guardar el carrito actualizado.
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // 7. Actualizar la vista del carrito.
    mostrarCarrito();

    // 8. Mostrar la notificación y lanzar confeti.
    mostrarNotificacion(nombre);
    lanzarConfeti();
}
// =======================================================================
// === FIN DE LA FUNCIÓN MODIFICADA ===
// =======================================================================


// Función para eliminar un producto del carrito y actualizar el contador
function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        contador.textContent = carrito.length;
    }
}


function enviarPedido() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        Swal.fire('El carrito está vacío.');
        return;
    }

    // Obtener datos del cliente
    let nombreCliente = document.getElementById("nombre-cliente").value.trim();
    let correoCliente = document.getElementById("correo-cliente").value.trim();
    let direccionCliente = document.getElementById("direccion-cliente").value.trim();
    let telefonoCliente = document.getElementById("telefono-cliente").value.trim();


    if (!nombreCliente || !correoCliente || !direccionCliente || !telefonoCliente) {
        Swal.fire("Por favor, completa todos los datos de envío.");
        return;
    }

    // Guardar los datos del cliente en localStorage
    localStorage.setItem('datosCliente', JSON.stringify({
        nombre: nombreCliente,
        correo: correoCliente,
        direccion: direccionCliente,
        telefono: telefonoCliente
    }));

    let mensaje = '🎉🛍️ *¡Tu Pedido Está Listo!*\n\n';
    mensaje += `👤 *Cliente:* ${nombreCliente}\n`;
    mensaje += `📩 *Correo:* ${correoCliente}\n`;
    mensaje += `📍 *Dirección:* ${direccionCliente}\n`;
    mensaje += `📞 *Teléfono:* ${telefonoCliente}\n`;


    let total = 0;
    let datosPedido = {
        nombre: nombreCliente,
        correo: correoCliente,
        direccion: direccionCliente,
        telefono: telefonoCliente,
        productos: []
    };

    carrito.forEach((producto) => {
        let subtotalProducto = parseFloat(producto.precio);
        let precioFormateado = subtotalProducto.toLocaleString(undefined, { minimumFractionDigits: 3 });

        mensaje += `🌟 ${producto.nombre}: *$${precioFormateado}*\n🖼️ ${producto.imagen || 'Sin imagen'}\n--------------------------------------------------------\n`;
        total += subtotalProducto;

        // Agregar producto al JSON para el correo
        datosPedido.productos.push({
            nombre: producto.nombre,
            precio: subtotalProducto,
            imagen: producto.imagen || ''
        });
    });

    let totalFormateado = total.toLocaleString(undefined, { minimumFractionDigits: 3 });
    mensaje += `\n✨ *Total:* $${totalFormateado}`;

    // ** Enviar pedido por correo usando Google Apps Script **
    let urlAppScript = "https://script.google.com/macros/s/AKfycbzG8kTUDQQU51D_yzOr23v8KNnx5lR4Cixv3bnYz5kOoIEmdtQek8X3ZJQ5_u59kxE/exec"; 
    fetch(urlAppScript, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosPedido)
    }).then(() => console.log("Correo enviado con éxito")).catch(error => console.log("Error:", error));

    // ** Enviar pedido por WhatsApp **
    const numeroWhatsApp = "+573208042101";
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');

    // SweetAlert para confirmar
    Swal.fire({
        title: '🎉 ¡Pedido Enviado! 🎉',
        text: 'Gracias por tu compra. ¿Deseas vaciar el carrito?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar carrito',
        cancelButtonText: 'No, mantener carrito',
        background: '#333333',
        color: '#D4AF37',
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito();
        }
    });

    if (document.getElementById('carrito')) {
        document.getElementById('carrito').style.display = 'none';
    }
    lanzarConfeti();
}

function cargarDatosCliente() {
    let datosGuardados = JSON.parse(localStorage.getItem('datosCliente'));
    if (datosGuardados) {
        if(document.getElementById("nombre-cliente")) document.getElementById("nombre-cliente").value = datosGuardados.nombre || "";
        if(document.getElementById("correo-cliente")) document.getElementById("correo-cliente").value = datosGuardados.correo || "";
        if(document.getElementById("direccion-cliente")) document.getElementById("direccion-cliente").value = datosGuardados.direccion || "";
        if(document.getElementById("telefono-cliente")) document.getElementById("telefono-cliente").value = datosGuardados.telefono || "";
    }
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarDatosCliente);


// Función para vaciar el carrito
function vaciarCarrito() {
    const carritoContenedor = document.getElementById('lista-carrito');
    localStorage.removeItem('carrito');
    mostrarCarrito();

    if (carritoContenedor) {
        carritoContenedor.classList.add('animacion-existente');
        setTimeout(() => {
            carritoContenedor.classList.remove('animacion-existente');
        }, 500); // Duración de la animación
    }

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
const btnVaciar = document.getElementById('btn-vaciar-carrito');
if (btnVaciar) {
    btnVaciar.addEventListener('click', () => {
        
        // Cerrar el carrito antes de mostrar la alerta
        if (document.getElementById('carrito')) {
            document.getElementById('carrito').style.display = 'none';
        }

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
                if (document.getElementById('carrito')) {
                    document.getElementById('carrito').style.display = 'block';
                }
            }
        });
    });
}

// Selecciona el contenedor del carrito
const carritoContenedor = document.getElementById('carrito');
const productos = document.querySelectorAll('.producto'); // Selecciona todos los contenedores de productos

// Función para mostrar u ocultar el carrito
function toggleCarrito() {
    let carrito = document.getElementById('carrito');
    if (carrito) {
        carrito.style.display = carrito.style.display === 'none' || carrito.style.display === '' ? 'block' : 'none';
    }
}
// evento para mostrar u ocultar el carrito con la X
const cerrarCarritoBtn = document.getElementById('cerrar-carrito');
if (cerrarCarritoBtn) {
    cerrarCarritoBtn.addEventListener('click', toggleCarrito);
}

// Función para verificar si el carrito está abierto
function isCarritoAbierto() {
    return carritoContenedor && carritoContenedor.style.display === 'block';
}

// Evento para cerrar el carrito al hacer clic en cualquier contenedor de producto
productos.forEach(producto => {
    producto.addEventListener('click', (event) => {
        if (isCarritoAbierto()) {
            if (carritoContenedor) {
                carritoContenedor.style.display = 'none'; // Cierra el carrito
            }
        }
    });
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
    const campoBusqueda = document.getElementById('campo-busqueda');
    if (!campoBusqueda) return;
    
    const terminoBusqueda = campoBusqueda.value.toLowerCase();
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
const btnBuscar = document.getElementById('btn-buscar');
if (btnBuscar) {
    btnBuscar.addEventListener('click', buscarProducto);
}

// Opcional: permitir búsqueda al presionar "Enter" en el campo de búsqueda
const campoBusqueda = document.getElementById('campo-busqueda');
if (campoBusqueda) {
    campoBusqueda.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            buscarProducto();
        }
    });
}

// JavaScript para cambiar las imágenes del carrusel de forma independiente
function changeImage(step, carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const images = carousel.querySelectorAll('.carousel-images img');
    let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    
    if (currentIndex !== -1) {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + step + images.length) % images.length;
        images[currentIndex].classList.add('active');
    }
}

// Movimiento automático en el carrusel
document.addEventListener('DOMContentLoaded', function () {
    const carousels = document.querySelectorAll('.carousel-images');
    let intervalTime = 15000; // Tiempo en milisegundos (15 segundos)
    let intervalID; // Variable para almacenar el ID del intervalo

    // Función para mostrar la siguiente imagen en cada carousel
    function showNextImage(carousel) {
        const images = carousel.querySelectorAll('img');
        if (images.length === 0) return;
        let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));

        if (currentIndex !== -1) {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }
    }

    function startCarousel() {
        stopCarousel(); // Asegurarse de que no haya intervalos duplicados
        intervalID = setInterval(() => {
            carousels.forEach(carousel => showNextImage(carousel));
        }, intervalTime);
    }

    function stopCarousel() {
        clearInterval(intervalID);
    }

    startCarousel();

    carousels.forEach(carousel => {
        const prevButton = carousel.parentElement.querySelector('.carousel-button.prev');
        const nextButton = carousel.parentElement.querySelector('.carousel-button.next');
        if(prevButton) prevButton.addEventListener('click', stopCarousel);
        if(nextButton) nextButton.addEventListener('click', stopCarousel);
        carousel.addEventListener('touchstart', stopCarousel);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const productos = document.querySelectorAll('.producto');
    if ('IntersectionObserver' in window) {
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
    }
});


// Desplazar suavemente al inicio de la página al hacer clic en el botón
const btnVolverInicio = document.getElementById('btn-volver-inicio');
if (btnVolverInicio) {
    btnVolverInicio.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// =======================================================================
// === CÓDIGO PARA EL ACCESO DIRECTO SECRETO AL PANEL DE ADMINISTRACIÓN ===
// =======================================================================

(function() {
    // 1. Define tu palabra secreta y la URL de tu panel de edición.
    // ¡Puedes cambiar 'admin' por la palabra que quieras!
    const secretCode = 'admin'; 
    const adminUrl = 'https://berakhahmedellin.pythonanywhere.com/';

    // 2. Esta variable guardará las teclas que el usuario va presionando.
    let userSequence = [];

    // 3. Escucha cada vez que el usuario presiona una tecla en cualquier parte de la página.
    document.addEventListener('keydown', function(event) {
        
        // Añade la tecla presionada (en minúscula) a la secuencia del usuario.
        userSequence.push(event.key.toLowerCase());

        // 4. Mantiene la secuencia del usuario con la misma longitud que el código secreto.
        // Si el usuario escribe "holaadmin", la secuencia se irá recortando hasta quedar solo "admin".
        if (userSequence.length > secretCode.length) {
            userSequence.shift(); // Elimina la primera tecla (la más antigua)
        }

        // 5. Comprueba si la secuencia actual del usuario coincide con el código secreto.
        if (userSequence.join('') === secretCode) {
            
            // Si coincide, muestra un mensaje en la consola (opcional, para depuración)
            console.log('Acceso secreto activado. Redirigiendo al panel de administración...');

            // ¡Redirige al usuario a la página de edición!
            window.location.href = adminUrl;
        }
    });

})(); // La función se auto-ejecuta para no contaminar otras variables.

