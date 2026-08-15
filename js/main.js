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

  /* ---------- Hotspots interactivos (pin: dot -> línea -> burbuja) ----------
     En desktop, el hover ya lo resuelve el CSS (.pin:hover). El click/tap
     sirve para togglear en touch y para no perder el estado al hacer scroll. */
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

    /* ---- Mostrar la isla al salir del hero + modo claro/oscuro según lo que hay debajo ---- */
    var hero = document.getElementById('inicio');
    var proyectos = document.getElementById('proyectos');
    var modelFrame = document.querySelector('.model-frame.full');

    function updateNavVisibility() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      floatingNav.classList.toggle('visible', heroBottom < 80);

      // Fondo claro de "Proyectos" -> nav en modo oscuro (on-light).
      // Pero si justo pasa sobre la foto de las maquetas (oscura), vuelve a modo claro.
      var onLight = false;
      if (proyectos) {
        var pRect = proyectos.getBoundingClientRect();
        if (pRect.top < 60 && pRect.bottom > 60) {
          onLight = true;
          if (modelFrame) {
            var fRect = modelFrame.getBoundingClientRect();
            if (fRect.top < 60 && fRect.bottom > 60) onLight = false;
          }
        }
      }
      floatingNav.classList.toggle('on-light', onLight);
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
    setTimeout(onScroll, 200);

    /* ---- Pestañas Arquitectura / Urbanismo / Flipbook (con indicador deslizante) ---- */
    var tabsWrap = document.getElementById('projectTabs');
    var tabIndicator = document.getElementById('tabIndicator');
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.tab-panel');

    function moveTabIndicator(tab) {
      if (!tabIndicator || !tab) return;
      tabIndicator.style.width = tab.offsetWidth + 'px';
      tabIndicator.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
    }

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
        moveTabIndicator(tab);
      });
    });
    var activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      moveTabIndicator(activeTab);
      setTimeout(function () { moveTabIndicator(activeTab); }, 250);
    }
    window.addEventListener('resize', function () {
      var current = document.querySelector('.tab.active');
      moveTabIndicator(current);
    });

    /* ---- Carruseles: loop infinito + escala del centro + drag con mouse + rueda ---- */
    var carousels = document.querySelectorAll('.carousel');

    carousels.forEach(function (carousel) {
      var track = carousel.querySelector('[data-track]');
      if (!track) return;

      var originalItems = Array.prototype.slice.call(track.children);
      var n = originalItems.length;
      if (n === 0) return;

      // Clonar un set completo antes y después, para loop infinito
      var beforeClones = originalItems.map(function (item) { return item.cloneNode(true); });
      beforeClones.slice().reverse().forEach(function (clone) { track.insertBefore(clone, track.firstChild); });

      var afterClones = originalItems.map(function (item) { return item.cloneNode(true); });
      afterClones.forEach(function (clone) { track.appendChild(clone); });

      var allItems = function () { return track.querySelectorAll('.c-item'); };

      function updateScale() {
        var box = carousel.getBoundingClientRect();
        var center = box.left + box.width / 2;
        allItems().forEach(function (item) {
          var r = item.getBoundingClientRect();
          var itemCenter = r.left + r.width / 2;
          var dist = Math.abs(center - itemCenter);
          item.classList.toggle('is-center', dist < r.width / 2.4);
        });
      }

      // Posicionar el scroll inicial sobre el primer elemento "real" (después de los clones)
      var setWidth = 0;
      function initLoopPosition() {
        var firstReal = track.children[n];
        var firstAny = track.children[0];
        setWidth = firstReal.offsetLeft - firstAny.offsetLeft;
        carousel.scrollLeft = setWidth;
      }
      initLoopPosition();
      setTimeout(initLoopPosition, 250);

      var loopLock = false;
      var cTicking = false;
      carousel.addEventListener('scroll', function () {
        if (!cTicking) {
          window.requestAnimationFrame(function () {
            updateScale();
            cTicking = false;
          });
          cTicking = true;
        }
        if (loopLock || setWidth === 0) return;
        if (carousel.scrollLeft < setWidth * 0.5) {
          loopLock = true;
          carousel.scrollLeft += setWidth;
          requestAnimationFrame(function () { loopLock = false; });
        } else if (carousel.scrollLeft > setWidth * 1.5) {
          loopLock = true;
          carousel.scrollLeft -= setWidth;
          requestAnimationFrame(function () { loopLock = false; });
        }
      }, { passive: true });

      updateScale();

      // Rueda del mouse (vertical) -> desplazamiento horizontal
      carousel.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          carousel.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });

      // Arrastrar con mouse (click + drag)
      var isDown = false, startX = 0, startScroll = 0, moved = false;
      carousel.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return; // el touch ya funciona nativo
        isDown = true;
        moved = false;
        carousel.classList.add('dragging');
        startX = e.clientX;
        startScroll = carousel.scrollLeft;
        carousel.setPointerCapture(e.pointerId);
      });
      carousel.addEventListener('pointermove', function (e) {
        if (!isDown) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        carousel.scrollLeft = startScroll - dx;
      });
      function endDrag() {
        isDown = false;
        carousel.classList.remove('dragging');
      }
      carousel.addEventListener('pointerup', endDrag);
      carousel.addEventListener('pointercancel', endDrag);
      carousel.addEventListener('pointerleave', endDrag);
      // Evitar que un drag dispare el click de la imagen
      carousel.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);

      window.addEventListener('resize', function () {
        initLoopPosition();
        updateScale();
      });
    });
  }

});
