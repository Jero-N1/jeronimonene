// ============================================
// Portafolio — interactividad compartida
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

  /* ---------- Hotspots interactivos (si existen en la página) ---------- */
  var hotspots = document.querySelectorAll('.hotspot');
  var bubbles = document.querySelectorAll('.bubble');
  if (hotspots.length) {
    function closeAllBubbles() {
      hotspots.forEach(function (h) { h.classList.remove('active'); });
      bubbles.forEach(function (b) { b.classList.remove('show'); });
    }
    hotspots.forEach(function (hotspot) {
      hotspot.addEventListener('click', function (e) {
        e.stopPropagation();
        var targetId = hotspot.getAttribute('data-bubble');
        var bubble = document.getElementById(targetId);
        var isOpen = bubble && bubble.classList.contains('show');
        closeAllBubbles();
        if (bubble && !isOpen) {
          bubble.classList.add('show');
          hotspot.classList.add('active');
        }
      });
    });
    document.addEventListener('click', closeAllBubbles);
    bubbles.forEach(function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); });
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

      // En cuanto salimos del hero oscuro, ponemos la barra en modo claro (texto oscuro)
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

  } // <-- Este es el cierre clave que faltaba en tu versión

  /* ============================================
     CARRUSEL DE PROYECTOS (Infinito, Drag, Autoscroll)
     ============================================ */
  var carousels = document.querySelectorAll('.carousel[data-carousel]');

  carousels.forEach(function (carousel) {
    var track = carousel.querySelector('[data-track]');
    if (!track) return;

    var originalItems = Array.prototype.slice.call(track.children);
    var n = originalItems.length;
    if (n === 0) return;

    // Clones para que sea infinito
    var beforeClones = originalItems.map(function (item) { return item.cloneNode(true); });
    beforeClones.slice().reverse().forEach(function (clone) { track.insertBefore(clone, track.firstChild); });
    var afterClones = originalItems.map(function (item) { return item.cloneNode(true); });
    afterClones.forEach(function (clone) { track.appendChild(clone); });

    function allItems() { return track.querySelectorAll('.c-item'); }

    function updateScale() {
      var box = carousel.getBoundingClientRect();
      var center = box.left + box.width / 2;
      allItems().forEach(function (item) {
        var r = item.getBoundingClientRect();
        var itemCenter = r.left + r.width / 2;
        var dist = Math.abs(center - itemCenter);
        if (dist < r.width / 2) {
          item.classList.add('is-center');
        } else {
          item.classList.remove('is-center');
        }
      });
    }

    var itemWidth = track.children[0].offsetWidth;
    var setWidth = itemWidth * n;

    function initLoopPosition() {
      carousel.style.scrollSnapType = 'none';
      carousel.scrollLeft = setWidth;
      updateScale();
      setTimeout(function() { carousel.style.scrollSnapType = 'x mandatory'; }, 100);
    }
    
    setTimeout(initLoopPosition, 300);
    
    // Recalcular al cambiar el tamaño de la ventana
    window.addEventListener('resize', function() {
        itemWidth = track.children[0].offsetWidth;
        setWidth = itemWidth * n;
        initLoopPosition();
    });

    // Arreglo del Loop al hacer scroll (para que no salte)
    carousel.addEventListener('scroll', function () {
      updateScale();
      if (carousel.scrollLeft <= itemWidth * 0.5) {
        carousel.style.scrollSnapType = 'none';
        carousel.scrollLeft += setWidth;
        setTimeout(function() { carousel.style.scrollSnapType = 'x mandatory'; }, 10);
      } else if (carousel.scrollLeft >= setWidth * 2 - itemWidth * 0.5) {
        carousel.style.scrollSnapType = 'none';
        carousel.scrollLeft -= setWidth;
        setTimeout(function() { carousel.style.scrollSnapType = 'x mandatory'; }, 10);
      }
    });

    // Flechas (clics)
    var wrapEl = carousel.closest('.carousel-wrap');
    if (wrapEl) {
      wrapEl.querySelectorAll('.carousel-arrow').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var dir = parseInt(btn.getAttribute('data-dir'), 10);
          carousel.scrollBy({ left: dir * itemWidth, behavior: 'smooth' });
        });
      });
    }

    // Drag con el mouse
    var isDragging = false;
    var startX, startScrollLeft;
    carousel.addEventListener('mousedown', function(e) {
      isDragging = true;
      carousel.classList.add('dragging');
      startX = e.pageX - carousel.offsetLeft;
      startScrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('mouseleave', function() { isDragging = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mouseup', function() { isDragging = false; carousel.classList.remove('dragging'); });
    carousel.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      e.preventDefault();
      var x = e.pageX - carousel.offsetLeft;
      var walk = (x - startX) * 2;
      carousel.scrollLeft = startScrollLeft - walk;
    });

    // Click en imagenes para centrar
    carousel.addEventListener('click', function (e) {
      var item = e.target.closest('.c-item');
      if (item && !item.classList.contains('is-center')) {
        e.preventDefault();
        var carouselRect = carousel.getBoundingClientRect();
        var itemRect = item.getBoundingClientRect();
        var delta = (itemRect.left + itemRect.width / 2) - (carouselRect.left + carouselRect.width / 2);
        carousel.scrollBy({ left: delta, behavior: 'smooth' });
      }
    });

    // Auto-scroll (Avanza solo, se pausa si pones el mouse y vuelve a arrancar)
    var autoScrollInterval = setInterval(function() {
      if (!isDragging) {
        carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }, 3000);
    
    carousel.addEventListener('mouseenter', function() { clearInterval(autoScrollInterval); });
    carousel.addEventListener('mouseleave', function() { 
      autoScrollInterval = setInterval(function() {
        if (!isDragging) {
          carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }, 3000);
    });

  });
const swiper = new Swiper('.swiper', {
  slidesOffsetBefore: 200,
  slidesOffsetAfter: 200,
  initialSlide: 1,
  centeredSlides: true,
  centerInsufficientSlides: true,
  roundLengths: true,
  slideToClickedSlide: true,
  loop: true,
  effect: "coverflow",
  coverflowEffect: {
    rotate: 130,
    stretch: 120,
    depth: 320,
    scale: 0.55,
    modifier: 0.5
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  pagination: {
    el: ".swiper-pagination",
    dynamicBullets: true,
    dynamicMainBullets: 3,
    hideOnClick: true
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: true
  },
  keyboard: true
});
}); // <-- CIERRE FINAL (Fin del archivo)
