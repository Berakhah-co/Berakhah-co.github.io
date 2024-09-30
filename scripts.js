// Movimiento automático en el carrusel
document.addEventListener('DOMContentLoaded', function () {
    const carousels = document.querySelectorAll('.carousel-images');
    let intervalTime = 7000; // Tiempo en milisegundos (7 segundos)
    let pauseTime = 20000; // Pausar por 20 segundos si el usuario interactúa
    let intervalID; // Variable para almacenar el ID del intervalo

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

    // Función para pausar el ciclo automático por 20 segundos
    function pauseCarousel() {
        stopCarousel(); // Detenemos el ciclo automático
        setTimeout(() => {
            startCarousel(); // Reiniciamos el ciclo automático después de 20 segundos
        }, pauseTime);
    }

    // Inicia el carrusel automáticamente
    startCarousel();

    // Detectar cuando el usuario cambia las imágenes manualmente
    carousels.forEach(carousel => {
        const prevButton = carousel.parentElement.querySelector('.carousel-button.prev');
        const nextButton = carousel.parentElement.querySelector('.carousel-button.next');

        // Pausar el carrusel si el usuario hace clic en los botones
        prevButton.addEventListener('click', () => {
            pauseCarousel();
        });

        nextButton.addEventListener('click', () => {
            pauseCarousel();
        });

        // Pausar también si el usuario desliza imágenes (en dispositivos táctiles)
        carousel.addEventListener('touchstart', () => {
            pauseCarousel();
        });
    });
});
