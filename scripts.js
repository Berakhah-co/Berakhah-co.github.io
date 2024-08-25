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
        totalCarrito += producto.precio;
        let li = document.createElement('li');
        li.innerHTML = `
            ${producto.nombre} - $${producto.precio}
            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        `;
        listaCarrito.appendChild(li);
    });

    document.getElementById('total-carrito').textContent = totalCarrito.toFixed(3);
    
    actualizarContadorCarrito();
}


// Función para agregar productos al carrito y actualizar el contador
function agregarAlCarrito(nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.push({ nombre, precio });
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
    alert(`${nombre} ha sido añadido al carrito.`);
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


// Función para enviar el pedido por WhatsApp
function enviarPedido() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        alert('El carrito está vacío.');
        return;
    }

    let mensaje = 'Pedido:';
    let total = 0;

    carrito.forEach(producto => {
        mensaje += `\n- ${producto.nombre}: $${producto.precio}`;
        total += producto.precio;
    });

    mensaje += `\nTotal: $${total}`;
    const numeroWhatsApp = "+573184818218"; // Reemplaza con tu número de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    localStorage.removeItem('carrito');
    mostrarCarrito();
}

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











