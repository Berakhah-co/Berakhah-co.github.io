// Obtener todos los productos al cargar la página en el orden original.
const productosOriginales = Array.from(document.querySelectorAll('.producto'));

/* =============================================================
        === BLOQUE PROMO (AGRUPADO PARA FACIL REVERTIR) ==========

        Qué contiene: funciones y llamadas que aplican la promoción
        (cambiar visual y forzar precio en carrito).

        Cómo revertir (3 opciones):
         1) Comentar o eliminar TODO el bloque entre
                 "=== INICIO BLOQUE PROMO ===" y
                 "=== FIN BLOQUE PROMO ===" (inclusive).
         2) O cambiar la constante `PROMO_ENABLED` a `false`.
         3) Para eliminar solamente la lógica del carrito, comentar
                 el bloque marcado dentro de `agregarAlCarrito` entre
                 las marcas "/* PROMO-CARRITO START *\/" y
                 "/* PROMO-CARRITO END *\/".

        Nota: esto deja el código comentado o toggleable para revertir
        fácilmente sin modificar `index.html`.
    ============================================================= */

// Toggle rápido: poner a `false` para desactivar la promo sin borrar código
const PROMO_ENABLED = true;
// Valor fijo (moneda local sin separador de miles): ejemplo 38999
const PROMO_PRICE = 37999;
// Porcentaje de descuento para la promoción porcentual (ej: 10 = 10%)
const PROMO_DISCOUNT_PERCENT = 0;
// Habilitar/deshabilitar tipos de promoción por separado
// - `PROMO_FIXED_ENABLED`: activa la promoción que fija un precio en PROMO_PRICE
// - `PROMO_PERCENT_ENABLED`: activa la promoción por porcentaje (PROMO_DISCOUNT_PERCENT%)
const PROMO_FIXED_ENABLED = false; // poner false para desactivar la promoción fija
const PROMO_PERCENT_ENABLED = true; // poner false para desactivar la promoción por %
// Umbral: solo se aplica la promoción a productos con precio ORIGINAL menor que este valor
// Cambia a Infinity si quieres aplicarlo a todos los productos.
const PROMO_THRESHOLD = 56000;

// Helper: formatea un número entero en formato $xx.xxx
function formatPrecioPts(n) {
    if (isNaN(n)) return '$0';
    return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Helper: parsea un texto de precio mostrado en la UI a un número en unidades
// Maneja formatos comunes como "$47.999,000", "$47.999" o "$47,999.000"
function parsePrecioTexto(text) {
    if (!text) return NaN;
    // Quitar caracteres distintos de dígitos, punto y coma/coma
    let s = String(text).trim();
    // Eliminar símbolo de moneda y espacios
    s = s.replace(/[^0-9.,-]/g, '');
    if (s === '') return NaN;

    // Si contiene tanto '.' como ',', decidir cuál es decimal.
    if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
        // Asumir formato español: '.' miles, ',' decimales -> eliminar puntos y convertir coma a punto
        s = s.replace(/\./g, '');
        s = s.replace(/,/g, '.');
    } else if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
        // Solo coma: podría ser separator de miles o decimales. Si tiene 3 dígitos después de la coma,
        // probablemente sean decimales mostrados a 3 cifras; convertimos coma a punto.
        if (/,[0-9]{3}$/.test(s)) {
            s = s.replace(/,/g, '.');
        } else {
            // Sino, asumimos coma como separador de miles -> eliminar
            s = s.replace(/,/g, '');
        }
    } else {
        // Solo puntos presentes. Si termina en '.000' probablemente son decimales mostrados; convertir a punto decimal
        if (/\.\d{3}$/.test(s)) {
            // mantener como está (ej. 47999.000)
        } else {
            // Sino, asumir puntos como separador de miles y removerlos
            s = s.replace(/\./g, '');
        }
    }

    const num = parseFloat(s);
    return isNaN(num) ? NaN : num;
}

// ======= Configuración de la NOTIFICACIÓN DE INICIO (customizable) =======
// Habilitar/deshabilitar solo la notificación (independiente de la promo)
const PROMO_ANNOUNCE_ENABLED = true; // poner false para desactivar solo el modal
// Si quieres reemplazar totalmente el contenido del modal, asigna HTML aquí.
// Ejemplo: '<div><h2>Oferta</h2><p>Mensaje personalizado</p></div>'
const PROMO_ANNOUNCE_CUSTOM_HTML = '';
// Si no se usa custom HTML, se usa este título y texto pequeño
const PROMO_ANNOUNCE_TITLE = 'En este 2026 regala Amor';
// Texto grande personalizable que aparece en el modal (si definido se usa tal cual)
const PROMO_ANNOUNCE_LARGE_TEXT = '¡Regala Berakhah!'; // Ej: 'Todos nuestros productos por debajo de $60.000 tendrán un precio especial de $38.999.'
const PROMO_ANNOUNCE_SMALL_TEXT = '';
// ========================================================================

/* === INICIO BLOQUE PROMO === */

// =======================================================================
// === Reorganizar estructura de productos para truncación de texto ===
// =======================================================================

function reorganizarProductos() {
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach(producto => {
        // Verificar si ya ha sido reorganizado
        if (producto.querySelector('.producto-descripcion')) {
            return; // Ya está reorganizado, saltar
        }
        
        // Obtener el título
        const titulo = producto.querySelector('.titulo-producto');
        if (!titulo) return;
        
        // Obtener todos los párrafos que no sean precio
        const paragrafos = Array.from(producto.querySelectorAll('p')).filter(p => !p.classList.contains('precio'));
        
        // Combinar todo el texto de los párrafos
        let textoCompleto = paragrafos.map(p => p.textContent).join(' ').trim();
        
        // Guardar el texto completo en un atributo de datos
        const contenedor = document.createElement('div');
        contenedor.className = 'producto-descripcion';
        contenedor.setAttribute('data-texto-completo', textoCompleto);
        
        // Crear párrafo truncado a 400 caracteres
        const parrafoTruncado = document.createElement('p');
        parrafoTruncado.className = 'texto-truncado';
        const textoMostrar = textoCompleto.length > 150 
            ? textoCompleto.substring(0, 150) + '...' 
            : textoCompleto;
        parrafoTruncado.textContent = textoMostrar;
        contenedor.appendChild(parrafoTruncado);
        
        // Crear párrafo con texto completo (oculto inicialmente)
        const parrafoCompleto = document.createElement('p');
        parrafoCompleto.className = 'texto-completo';
        parrafoCompleto.textContent = textoCompleto;
        parrafoCompleto.style.display = 'none';
        contenedor.appendChild(parrafoCompleto);
        
        // (Inline truncation removed so CSS `.producto.expanded` controls expansion)
        
        // Remover los párrafos originales
        paragrafos.forEach(p => p.remove());
        
        // Crear botón de expandir
        const expandButton = document.createElement('button');
        expandButton.className = 'expand-button';
        expandButton.setAttribute('data-truncated', 'true');
        // Muestra "Ver más" si el texto es largo, sino, lo deja vacío.
        expandButton.textContent = textoCompleto.length > 150 ? 'Ver más' : '';
        expandButton.setAttribute('type', 'button');
        
        // Si el texto no es mayor a 400 caracteres, ocultar el botón
        if (textoCompleto.length <= 150) {
            expandButton.style.display = 'none';
        }
        
        // Insertar la descripción y el botón después del título
        titulo.insertAdjacentElement('afterend', contenedor);
        contenedor.insertAdjacentElement('afterend', expandButton);
    });
}

// ================================
// Promo: aplicar precio decembrino
// ================================
function aplicarPromocionPrecios() {
    if (!PROMO_ENABLED) return; // No hacer nada si la promo está desactivada
    const elementosPrecio = document.querySelectorAll('p.precio');
    elementosPrecio.forEach(p => {
        const texto = (p.textContent || '').trim();
        // Parsear el texto mostrado a número en unidades (considera puntos y comas)
        const valorParsed = parsePrecioTexto(texto);
        const valor = isNaN(valorParsed) ? NaN : Math.round(valorParsed);
        if (isNaN(valor)) return;
        if (valor < PROMO_THRESHOLD) {
            // Guardar siempre el precio original en el DOM para uso del carrito
            p.setAttribute('data-precio-original', String(valor));

            // Si la promoción fija está habilitada, mostrar el precio fijo en la UI
            if (PROMO_FIXED_ENABLED) {
                const nuevoPrecio = PROMO_PRICE;
                p.textContent = formatPrecioPts(nuevoPrecio);
                p.setAttribute('data-promocion', 'true');
                p.setAttribute('data-precio-promocional', String(nuevoPrecio));
            } else if (PROMO_PERCENT_ENABLED) {
                // En promoción porcentual NO cambiamos el precio mostrado por producto.
                // El descuento por porcentaje se aplica únicamente en el cálculo del carrito.
                // Solo guardamos los atributos para referencia
                p.removeAttribute('data-precio-promocional');
            }
        }
    });
}

function mostrarAnuncioDecembrino() {
    // No mostrar si la promo o la notificación están desactivadas
    if (!PROMO_ENABLED || !PROMO_ANNOUNCE_ENABLED) return;
    try {
        // Mostrar solo una vez por sesión
        if (sessionStorage.getItem('anuncioDecembrinoMostrado')) return;
        // Si el usuario definió HTML personalizado, usarlo exactamente.
        let html;
        if (PROMO_ANNOUNCE_CUSTOM_HTML && PROMO_ANNOUNCE_CUSTOM_HTML.trim() !== '') {
            html = PROMO_ANNOUNCE_CUSTOM_HTML;
        } else {
            // Si el usuario definió un texto grande personalizado, usarlo tal cual
            if (PROMO_ANNOUNCE_LARGE_TEXT && PROMO_ANNOUNCE_LARGE_TEXT.trim() !== '') {
                html = `
                    <div style="text-align:center">
                        <div style="font-size:18px; font-weight:700; color:#222">${PROMO_ANNOUNCE_TITLE}</div>
                        <div style="margin-top:8px; font-size:20px; font-weight:800; color:#b12704">${PROMO_ANNOUNCE_LARGE_TEXT}</div>
                        <div style="margin-top:6px; font-size:11px; color:#666">${PROMO_ANNOUNCE_SMALL_TEXT}</div>
                    </div>
                `;
            } else {
                // Construir contenido del anuncio según las promociones habilitadas
                let contenidoPromocion = '';
                if (PROMO_FIXED_ENABLED) {
                    contenidoPromocion = `Todos nuestros productos por debajo de ${formatPrecioPts(PROMO_THRESHOLD)} tendrán un precio especial de <span style=\"font-size:24px\">${formatPrecioPts(PROMO_PRICE)}</span>`;
                } else if (PROMO_PERCENT_ENABLED) {
                    contenidoPromocion = `¡${PROMO_DISCOUNT_PERCENT}% de descuento en productos por debajo de ${formatPrecioPts(PROMO_THRESHOLD)}!`;
                } else {
                    contenidoPromocion = '';
                }

                html = `
                    <div style="text-align:center">
                        <div style="font-size:18px; font-weight:700; color:#222">${PROMO_ANNOUNCE_TITLE}</div>
                        <div style="margin-top:8px; font-size:20px; font-weight:800; color:#b12704">${contenidoPromocion}</div>
                        <div style="margin-top:6px; font-size:11px; color:#666">${PROMO_ANNOUNCE_SMALL_TEXT}</div>
                    </div>
                `;
            }
        }

        if (typeof Swal === 'function') {
            Swal.fire({
                title: '',
                html: html,
                icon: 'none',
                confirmButtonText: 'Ver Catálogo',
                background: '#f8f5f1',
                color: '#1a2332',
                confirmButtonColor: '#c9a961',
                customClass: {
                    popup: 'modal-promo-custom',
                    title: 'modal-promo-title',
                    htmlContainer: 'modal-promo-content'
                },
                width: '480px',
                padding: '2rem',
                borderRadius: '16px',
                backdrop: 'rgba(26, 35, 50, 0.5)',
                showCloseButton: true
            });
        } 

        sessionStorage.setItem('anuncioDecembrinoMostrado', '1');
    } catch (e) {
        console.error('Error mostrando anuncio decembrino', e);
    }
}

/* === FIN BLOQUE PROMO === */

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
      
      // Re-ejecutar reorganización después de mostrar productos
      setTimeout(() => {
          reorganizarProductos();
      }, 50);
  }
  
// Evento para cargar todos los productos al inicio
document.addEventListener('DOMContentLoaded', () => {
    reorganizarProductos();
    mostrarCategoria('todo');
    mostrarCarrito();
    const btnPedir = document.getElementById('btn-pedir');
    if (btnPedir) {
        btnPedir.addEventListener('click', enviarPedido);
    }

    // === BLOQUE PROMO: llamadas agrupadas ===
    // Para revertir: comentar o eliminar este bloque (ver encabezado del bloque promocional arriba)
    if (PROMO_ENABLED) {
        aplicarPromocionPrecios();
        mostrarAnuncioDecembrino();
    }

    // ===============================================================
    // === NUEVO: listener delegado para botones 'Ver más' en el catálogo ===
    // ===============================================================
    const catalogo = document.querySelector('.catalogo');
    if (catalogo) {
        catalogo.addEventListener('click', function(event) {
            const target = event.target;
            if (target && target.classList && target.classList.contains('expand-button')) {
                toggleExpandText(target);
            }
        });
    }
    // ===============================================================
});

// Función para mostrar el carrito y actualizar el contador
function mostrarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let listaCarrito = document.getElementById('lista-carrito');
    let subtotal = 0;
    let eligibleSubtotal = 0; // suma de artículos elegibles para descuento porcentual
    if (!listaCarrito) return; // Salir si el elemento no existe
    
    listaCarrito.innerHTML = '';
    carrito.forEach((producto, index) => {
        const unitPrice = !isNaN(parseFloat(producto.precio)) ? parseFloat(producto.precio) : 0;
        subtotal += unitPrice;

        // Determinar precio original para evaluar elegibilidad al descuento porcentual
        const orig = (!isNaN(parseFloat(producto.precio_original)) ? parseFloat(producto.precio_original) : unitPrice);
        if (PROMO_ENABLED && PROMO_PERCENT_ENABLED && orig < PROMO_THRESHOLD) {
            eligibleSubtotal += orig;
        }

        let li = document.createElement('li');
        let nombreModificado = producto.nombre.replace(/Berakhah\s/, '');
        // Mostrar el precio de la unidad tal como se guardó en el carrito (precio_final o original)
        let precioFormateado = formatPrecioPts(Math.round(unitPrice));

        li.innerHTML = `
            <img src="${producto.imagen}" alt="${nombreModificado}" style="width: 50px; height: 50px; margin-right: 10px;" onclick="abrirImagenEnNuevaVentana('${producto.imagen}')">
            ${nombreModificado} - ${precioFormateado}
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
    });

    // Calcular descuento y total
    let descuento = 0;
    if (PROMO_ENABLED && PROMO_PERCENT_ENABLED) {
        descuento = Math.round(eligibleSubtotal * PROMO_DISCOUNT_PERCENT / 100);
    }
    const total = Math.round(subtotal - descuento);

    const subtotalFmt = formatPrecioPts(Math.round(subtotal));
    const descuentoFmt = formatPrecioPts(Math.round(descuento));
    const totalFmt = formatPrecioPts(Math.round(total));

    const totalCarritoElemento = document.getElementById('total-carrito');
    if (totalCarritoElemento) {
        // Mostrar desglose (Subtotal / Descuento / Total) solo cuando la promoción
        // por porcentaje esté habilitada. En caso contrario, mostrar únicamente el Total.
        if (PROMO_ENABLED && PROMO_PERCENT_ENABLED) {
            totalCarritoElemento.innerHTML = `
                <p class="subtotal">Subtotal: <strong>${subtotalFmt}</strong></p>
                <p class="descuento">Descuento (${PROMO_DISCOUNT_PERCENT}%): <strong>- ${descuentoFmt}</strong></p>
                <p class="total"><strong>Total: ${totalFmt}</strong></p>`;
        } else {
            totalCarritoElemento.innerHTML = `
                <p class="total"><strong>Total: ${totalFmt}</strong></p>`;
        }
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
// === FUNCIÓN CORREGIDA ===
// =======================================================================
function agregarAlCarrito(nombre, precio) {
     /* /* PROMO-CARRITO START: lógica de promoción en carrito
         Para revertir: comentar o eliminar todo desde 'PROMO-CARRITO START' hasta
         'PROMO-CARRITO END' (inclusive). Alternativamente ponga
         `PROMO_ENABLED = false` arriba.
     */
    // Nota: no aplicamos descuento porcentual al almacenar el producto.
    // El descuento por porcentaje se calcula a nivel de carrito (subtotal -> descuento -> total).
    // Aquí solo normalizamos y permitimos sobreescribir por la promo FIXED si aplica.
    let precioNum = Number(precio);
    if (isNaN(precioNum)) {
        const dig = String(precio).replace(/\D/g, '');
        precioNum = dig ? parseInt(dig, 10) : NaN;
    }
    // Si PROMO FIXED aplica y está habilitada, la usaremos más abajo para almacenar el precio final.
    /* PROMO-CARRITO END */

    // 1. Encuentra el elemento de la imagen del producto en la página.
    //    Usamos el atributo 'alt', que debe coincidir con el nombre del producto.
    const imagenProducto = document.querySelector(`img[alt='${nombre}']`);
    // 2. Obtenemos la URL COMPLETA y CORRECTA directamente del atributo 'src'.
    //    Si por alguna razón la imagen no se encuentra, usamos una cadena vacía como respaldo.
    const urlCompletaImagen = imagenProducto ? imagenProducto.src : '';

    // 2b. Intentar obtener el precio ya calculado/mostrado en la tarjeta del producto.
    // Si la UI ya aplicó la promoción (por ejemplo modo 'percent'), la tarjeta
    // contendrá `data-precio-promocional` y lo preferimos para asegurar que el
    // carrito y el total coincidan con lo que ve el usuario.
    try {
        const productoElemento = imagenProducto ? imagenProducto.closest('.producto') : null;
        if (productoElemento) {
            const precioEl = productoElemento.querySelector('p.precio');
            if (precioEl) {
                // Si la promoción fija está habilitada, preferimos el precio promocional mostrado
                if (PROMO_FIXED_ENABLED) {
                    const promoAttr = precioEl.getAttribute('data-precio-promocional') || precioEl.dataset.precioPromocional;
                    if (promoAttr && !isNaN(Number(promoAttr))) {
                        precio = Number(promoAttr);
                    }
                }

                // Si no tomamos precio promocional (o no existe), usar siempre el precio original mostrado
                if ((precio === undefined || precio === null || isNaN(precio)) && precioEl) {
                    const origAttr = precioEl.getAttribute('data-precio-original') || precioEl.dataset.precioOriginal;
                    if (origAttr && !isNaN(Number(origAttr))) {
                        precio = Number(origAttr);
                    } else {
                        const txt = (precioEl.textContent || '').trim();
                        const parsed = parsePrecioTexto(txt);
                        if (!isNaN(parsed)) precio = Math.round(parsed);
                    }
                }
            }
        }
    } catch (e) {
        // No interrumpir el flujo si algo falla al leer el DOM del producto
        console.warn('No se pudo leer precio desde la tarjeta del producto:', e);
    }

    // 3. Determinar precio_original y precio_final a almacenar
    let precio_original = !isNaN(precioNum) ? precioNum : (isNaN(Number(precio)) ? NaN : Number(precio));
    // Si no logramos leer precio_original aún, intentar usar 'precio' variable
    if (isNaN(precio_original) && !isNaN(Number(precio))) precio_original = Number(precio);

    // Precio final por unidad que se guarda en el carrito:
    let precio_final = precio_original;
    if (PROMO_ENABLED && PROMO_FIXED_ENABLED && !isNaN(precio_original) && precio_original < PROMO_THRESHOLD) {
        precio_final = PROMO_PRICE;
    }

    // 4. Obtenemos el carrito actual desde el almacenamiento local.
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 5. Agregamos el nuevo producto al carrito con la URL de imagen correcta y precios explícitos.
    carrito.push({ nombre, precio: precio_final, precio_original: precio_original, imagen: urlCompletaImagen });

    // 5. Guardamos el carrito actualizado de vuelta en el almacenamiento local.
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // 6. Actualizamos la vista del carrito en la página.
    mostrarCarrito();

    // 7. Mostramos la notificación de éxito.
    mostrarNotificacion(nombre);

    // 8. Lanzamos el confeti.
    lanzarConfeti();
}
// =======================================================================
// === FIN DE LA FUNCIÓN CORREGIDA ===
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
        // Remover clases de animación y active de la imagen actual
        images[currentIndex].classList.remove('active', 'slide-left', 'slide-right');
        
        currentIndex = (currentIndex + step + images.length) % images.length;
        
        // Agregar clase de animación según la dirección
        const animationClass = step > 0 ? 'slide-right' : 'slide-left';
        images[currentIndex].classList.add('active', animationClass);
        
        // Limpiar la clase de animación después de que termine
        setTimeout(() => {
            images[currentIndex].classList.remove('slide-left', 'slide-right');
        }, 500);
    }
}

// Movimiento automático en el carrusel - DESACTIVADO
// El carrusel ahora solo funciona con controles manuales (botones prev/next)

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
// === Funcionalidad de Expandir/Contraer Texto en Tarjetas ===
// =======================================================================

function toggleExpandText(button) {
    const producto = button.closest('.producto');
    if (!producto) return;
    
    const descripcion = producto.querySelector('.producto-descripcion');
    if (!descripcion) return;
    
    const textoTruncado = descripcion.querySelector('.texto-truncado');
    const textoCompleto = descripcion.querySelector('.texto-completo');
    
    if (!textoTruncado || !textoCompleto) return;
    
    producto.classList.toggle('expanded');
    
    if (producto.classList.contains('expanded')) {
        // Mostrar texto completo: eliminar restricciones inline para que CSS pueda expandir
        textoTruncado.style.display = 'none';
        textoCompleto.style.display = 'block';
        // Quitar estilos inline de truncado para que el contenido pueda crecer
        descripcion.style.maxHeight = 'none';
        descripcion.style.minHeight = 'auto';
        descripcion.style.overflow = 'visible';
        button.textContent = 'Ver menos';
        button.classList.add('expanded');
    } else {
        // Mostrar texto truncado: restaurar estilos inline solo si el texto supera el umbral
        textoTruncado.style.display = 'block';
        textoCompleto.style.display = 'none';
        // Sólo volver a aplicar el truncado si el contenido original es largo
        const textoCompletoStr = descripcion.getAttribute('data-texto-completo') || (textoCompleto.textContent || '');
        if (textoCompletoStr.length > 150) {
            descripcion.style.maxHeight = '70px';
            descripcion.style.minHeight = '70px';
            descripcion.style.overflow = 'hidden';
        } else {
            // Si no es largo, limpiar cualquier estilo inline
            descripcion.style.maxHeight = '';
            descripcion.style.minHeight = '';
            descripcion.style.overflow = '';
        }
        button.textContent = 'Ver más';
        button.classList.remove('expanded');
    }
}

// NOTE: initialization of individual expand buttons removed in favor of a delegated listener


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
