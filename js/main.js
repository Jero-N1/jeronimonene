document.addEventListener('DOMContentLoaded', function () {

  /* --- 1. MENÚ MÓVIL --- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  /* --- 2. REVEAL ON SCROLL (Animaciones al bajar) --- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* --- 3. NAVEGACIÓN FLOTANTE (Solo en Home) --- */
  const floatingNav = document.getElementById('floatingNav');
  if (floatingNav) {
    const fnToggle = document.getElementById('fnToggle');
    const fnLinks = document.getElementById('fnLinks');
    if (fnToggle && fnLinks) {
      fnToggle.addEventListener('click', () => fnLinks.classList.toggle('open'));
    }

    const hero = document.getElementById('inicio');
    function handleScroll() {
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      // Muestra la barra si el hero ya pasó
      floatingNav.classList.toggle('visible', heroBottom < 80);
      // Cambia los colores si está sobre fondo claro
      floatingNav.classList.toggle('on-light', heroBottom < 60);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* --- 4. SWIPER CAROUSEL --- */
  // Verificamos que exista el contenedor antes de iniciarlo para evitar errores
  const swiperContainer = document.querySelector('.swiper');
  if (swiperContainer && typeof Swiper !== 'undefined') {
    const swiper = new Swiper('.swiper', {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto", // Crucial para que respete el tamaño del CSS
      initialSlide: 1,
      loop: true,
      coverflowEffect: {
        rotate: 30, // Reduje un poco la rotación para que no se vea tan caótico
        stretch: 0,
        depth: 200,
        modifier: 1,
        slideShadows: true
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      },
      pagination: {
        el: ".swiper-pagination",
        dynamicBullets: true,
        clickable: true
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false
      }
    });
  }

});
