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

  /* ---------- Reveal on scroll: se repite cada vez que entra/sale de la vista ---------- */
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
    var proyectos = document.getElementById('proyectos');
    var modelFrame = document.querySelector('.proyectos-carousel');

    function updateNavVisibility() {
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

/* ---- Carrusel de proyectos ---- */
var carousels = document.querySelectorAll('.carousel[data-carousel]');

carousels.forEach(function (carousel) {
  var track = carousel.querySelector('[data-track]');
  if (!track) return;

  var originalItems = Array.prototype.slice.call(track.children);
  var n = originalItems.length;
  if (n === 0) return;

  // Clones para loop infinito
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
      // Solo le da la clase is-center a la que está justo en medio
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

  // Arreglo del Loop
  carousel.addEventListener('scroll', function () {
    updateScale();
    if (carousel.scrollLeft <= itemWidth) {
      carousel.style.scrollSnapType = 'none';
      carousel.scrollLeft += setWidth;
      setTimeout(function() { carousel.style.scrollSnapType = 'x mandatory'; }, 10);
    } else if (carousel.scrollLeft >= setWidth * 2 - itemWidth) {
      carousel.style.scrollSnapType = 'none';
      carousel.scrollLeft -= setWidth;
      setTimeout(function() { carousel.style.scrollSnapType = 'x mandatory'; }, 10);
    }
  });

  // Drag con el mouse (arrastrar)
  var isDragging = false;
  var startX, startScrollLeft;
  
  carousel.addEventListener('mousedown', function(e) {
    isDragging = true;
    carousel.classList.add('dragging');
    startX = e.pageX - carousel.offsetLeft;
    startScrollLeft = carousel.scrollLeft;
  });
  
  carousel.addEventListener('mouseleave', function() {
    isDragging = false;
    carousel.classList.remove('dragging');
  });
  
  carousel.addEventListener('mouseup', function() {
    isDragging = false;
    carousel.classList.remove('dragging');
  });
  
  carousel.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
    var x = e.pageX - carousel.offsetLeft;
    var walk = (x - startX) * 2; // Velocidad del drag
    carousel.scrollLeft = startScrollLeft - walk;
  });

  // Flechas
  var wrapEl = carousel.closest('.carousel-wrap');
  if (wrapEl) {
    wrapEl.querySelectorAll('.carousel-arrow').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.getAttribute('data-dir'), 10);
        carousel.scrollBy({ left: dir * itemWidth, behavior: 'smooth' });
      });
    });
  }
  
  // Click en imagenes pequeñas para centrarlas
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
});
});
