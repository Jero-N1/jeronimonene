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

  /* ---------- Hotspots interactivos (pin: dot -> línea -> burbuja) ---------- */
  var hotspots = document.querySelectorAll('.hotspot');
  var bubbles = document.querySelectorAll('.bubble');

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

  /* ============================================
     LANDING INMERSIVO (solo index.html)
     ============================================ */

  var floatingNav = document.getElementById('floatingNav');
  if (floatingNav) {

    /* ---- Toggle menú móvil de la isla ---- */
    var fnToggle = document.getElementById('fnToggle');
    var fnLinks = document.getElementById('fnLinks');
    if (fnToggle && fnLinks) {
      fnToggle.addEventListener('click', function () {
        fnLinks.classList.toggle('open');
      });
    }

    /* ---- Mostrar la isla al salir del hero + cambiar a modo claro sobre fondo claro ---- */
    var hero = document.getElementById('inicio');
    var proyectos = document.getElementById('proyectos');

    function updateNavVisibility() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom < 80) {
        floatingNav.classList.add('visible');
      } else {
        floatingNav.classList.remove('visible');
      }

      // Sobre la sección de proyectos (fondo claro), pasa a modo "on-light"
      var pRect = proyectos.getBoundingClientRect();
      if (pRect.top < 60 && pRect.bottom > 60) {
        floatingNav.classList.add('on-light');
      } else {
        floatingNav.classList.remove('on-light');
      }
    }

    /* ---- Indicador deslizante + sección activa ---- */
    var fnLinkEls = document.querySelectorAll('.fn-link[data-section]');
    var indicator = document.getElementById('fnIndicator');
    var sections = ['inicio', 'trabajo', 'proyectos']
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
    // aseguramos posición correcta del indicador tras el layout inicial
    setTimeout(onScroll, 200);

    /* ---- Carruseles: escala el elemento más cercano al centro ---- */
    var carousels = document.querySelectorAll('.carousel');
    carousels.forEach(function (carousel) {
      var items = carousel.querySelectorAll('.c-item');

      function updateScale() {
        var box = carousel.getBoundingClientRect();
        var center = box.left + box.width / 2;
        items.forEach(function (item) {
          var r = item.getBoundingClientRect();
          var itemCenter = r.left + r.width / 2;
          var dist = Math.abs(center - itemCenter);
          item.classList.toggle('is-center', dist < r.width / 2);
        });
      }

      var cTicking = false;
      carousel.addEventListener('scroll', function () {
        if (!cTicking) {
          window.requestAnimationFrame(function () {
            updateScale();
            cTicking = false;
          });
          cTicking = true;
        }
      }, { passive: true });

      updateScale();
      setTimeout(updateScale, 250);
      window.addEventListener('resize', updateScale);
    });

    /* ---- Pestañas Arquitectura / Urbanismo / Flipbook ---- */
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === target);
        });
      });
    });
  }

});
