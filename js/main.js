// ============================================
// Portafolio — JS Limpio con Swiper
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Menú móvil (páginas internas: .main-nav) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ============================================
     LANDING INMERSIVO (solo index.html)
     ============================================ */
  var floatingNav = document.getElementById('floatingNav');
  if (floatingNav) {
    var fnToggle = document.getElementById('fnToggle');
    var fnLinks = document.getElementById('fnLinks');
    if (fnToggle && fnLinks) {
      fnToggle.addEventListener('click', function () {
        fnLinks.classList.toggle('open');
      });
    }

    var hero = document.getElementById('inicio');
    function updateNavVisibility() {
      if (!hero) return;
      var heroBottom = hero.getBoundingClientRect().bottom;
      floatingNav.classList.toggle('visible', heroBottom < 80);
      var onLight = heroBottom < 60;
      floatingNav.classList.toggle('on-light', onLight);
    }

    var fnLinkEls = document.querySelectorAll('.fn-link[data-section]');
    var indicator = document.getElementById('fnIndicator');
    var sections = ['inicio', 'trabajo', 'proyectos', 'flipbook']
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function moveIndicator(link) {
      if (!indicator || !link) return;
      indicator.style.width = link.offsetWidth + 'px';
      indicator.style.transform = 'translateX(' + link.offsetLeft + 'px)';
    }

    function updateActiveSection() {
      var scrollPos = window.scrollY + window.innerHeight * 0.4;
      var currentId = sections[0] ? sections[0].id : 'inicio';
      sections.forEach(function (sec) {
        if (sec.offsetTop <= scrollPos) currentId = sec.id;
      });
      fnLinkEls.forEach(function (link) {
        var isActive = link.getAttribute('data-section') === currentId;
        link.classList.toggle('active', isActive);
        if (isActive) moveIndicator(link);
      });
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateNavVisibility();
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    setTimeout(onScroll, 200);
  }

  /* ============================================
     INICIALIZAR SWIPER CAROUSEL 3D
     ============================================ */
  if (document.querySelector('.swiper')) {
    const swiper = new Swiper('.swiper', {
      effect: "coverflow",
      grabCursor: true, // ¡Hace que se vea la manita para arrastrar!
      centeredSlides: true,
      slidesPerView: "auto", // ¡Clave para que el Coverflow funcione con medidas en CSS!
      initialSlide: 1,
      roundLengths: true,
      slideToClickedSlide: true,
      loop: true,
      coverflowEffect: {
        rotate: 130,
        stretch: 120,
        depth: 320,
        scale: 0.55,
        modifier: 0.5,
        slideShadows: true // Le da sombreado 3D a las tarjetas laterales
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
      },
      pagination: {
        el: ".swiper-pagination",
        dynamicBullets: true,
        dynamicMainBullets: 3,
        clickable: true // Permite hacer clic en los puntos
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false // No se detiene permanentemente si el usuario toca
      },
      keyboard: true
    });
  }

});
