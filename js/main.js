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

  /* ---------- Reveal on scroll: aparición fluida de bloques al bajar ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

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

    /* ---- Selector genérico con indicador deslizante (Trabajo y Proyectos) ---- */
    function setupPillTabs(opts) {
      var wrap = document.getElementById(opts.wrapId);
      var indicatorEl = document.getElementById(opts.indicatorId);
      if (!wrap) return;
      var tabEls = wrap.querySelectorAll(opts.tabSelector);
      var panelEls = document.querySelectorAll(opts.panelSelector);

      function moveTo(tab) {
        if (!indicatorEl || !tab) return;
        indicatorEl.style.width = tab.offsetWidth + 'px';
        indicatorEl.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
      }

      tabEls.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute(opts.dataAttr);
          tabEls.forEach(function (t) {
            t.classList.toggle('active', t === tab);
            t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
          });
          panelEls.forEach(function (p) {
            p.classList.toggle('active', p.getAttribute(opts.panelAttr) === target);
          });
          moveTo(tab);
          if (opts.onSwitch) opts.onSwitch(target);
        });
      });

      var current = wrap.querySelector(opts.tabSelector + '.active');
      moveTo(current);
      setTimeout(function () { moveTo(current); }, 250);
      window.addEventListener('resize', function () {
        var active = wrap.querySelector(opts.tabSelector + '.active');
        moveTo(active);
      });
    }

    setupPillTabs({
      wrapId: 'projectTabs',
      indicatorId: 'tabIndicator',
      tabSelector: '.tab',
      panelSelector: '.tab-panel',
      dataAttr: 'data-tab',
      panelAttr: 'data-panel'
    });

    setupPillTabs({
      wrapId: 'workTabs',
      indicatorId: 'workTabIndicator',
      tabSelector: '.wt-tab',
      panelSelector: '.work-panel',
      dataAttr: 'data-work',
      panelAttr: 'data-work-panel',
      onSwitch: function () {
        // recalcular carruseles del panel recién mostrado (puede tener otro ancho/posición)
        setTimeout(function () {
          document.querySelectorAll('.work-panel.active .carousel').forEach(function (c) {
            if (c._refreshCarousel) c._refreshCarousel();
          });
        }, 50);
      }
    });

    /* ---- Carruseles: loop infinito + escala + drag con mouse + rueda + teclado (sin bugs de snap) ---- */
    var carousels = document.querySelectorAll('.carousel');

    carousels.forEach(function (carousel) {
      var track = carousel.querySelector('[data-track]');
      if (!track) return;

      var originalItems = Array.prototype.slice.call(track.children);
      var n = originalItems.length;
      if (n === 0) return;

      var beforeClones = originalItems.map(function (item) { return item.cloneNode(true); });
      beforeClones.slice().reverse().forEach(function (clone) { track.insertBefore(clone, track.firstChild); });

      var afterClones = originalItems.map(function (item) { return item.cloneNode(true); });
      afterClones.forEach(function (clone) { track.appendChild(clone); });

      function allItems() { return track.querySelectorAll('.c-item'); }

      function updateScale() {
        var box = carousel.getBoundingClientRect();
        if (box.width === 0) return; // panel oculto
        var center = box.left + box.width / 2;
        allItems().forEach(function (item) {
          var r = item.getBoundingClientRect();
          var itemCenter = r.left + r.width / 2;
          var dist = Math.abs(center - itemCenter);
          item.classList.toggle('is-center', dist < r.width / 2.4);
        });
      }

      var setWidth = 0;
      function initLoopPosition() {
        if (carousel.getBoundingClientRect().width === 0) return; // panel oculto, reintentar luego
        var firstReal = track.children[n];
        var firstAny = track.children[0];
        setWidth = firstReal.offsetLeft - firstAny.offsetLeft;
        carousel.scrollLeft = setWidth;
        updateScale();
      }
      initLoopPosition();
      setTimeout(initLoopPosition, 300);

      // Reposiciona el loop solo cuando el scroll está QUIETO (evita el "rebote" visual)
      var loopTimeout;
      carousel.addEventListener('scroll', function () {
        updateScale();
        clearTimeout(loopTimeout);
        loopTimeout = setTimeout(function () {
          if (setWidth === 0) return;
          var prevBehavior = carousel.style.scrollBehavior;
          if (carousel.scrollLeft < setWidth * 0.5) {
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft += setWidth;
            carousel.style.scrollBehavior = prevBehavior || '';
          } else if (carousel.scrollLeft > setWidth * 1.5) {
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft -= setWidth;
            carousel.style.scrollBehavior = prevBehavior || '';
          }
        }, 120);
      }, { passive: true });

      // Rueda del mouse: NO se intercepta — así el scroll normal de la página
      // sigue funcionando con el mouse encima del carrusel. El trackpad ya
      // mueve el carrusel horizontal de forma nativa (deltaX).

      // Arrastrar con mouse
      var isDown = false, startX = 0, startScroll = 0, moved = false;
      carousel.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
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
      function endDrag() { isDown = false; carousel.classList.remove('dragging'); }
      carousel.addEventListener('pointerup', endDrag);
      carousel.addEventListener('pointercancel', endDrag);
      carousel.addEventListener('pointerleave', endDrag);
      carousel.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);

      // Flechas del teclado: paso controlado de un elemento completo (evita el bug de scroll nativo + snap)
      carousel.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var refItem = track.querySelector('.c-item.is-center') || allItems()[0];
        var step = refItem.offsetWidth;
        carousel.scrollBy({ left: e.key === 'ArrowRight' ? step : -step, behavior: 'smooth' });
      });

      carousel._refreshCarousel = function () {
        initLoopPosition();
        updateScale();
      };

      window.addEventListener('resize', function () {
        initLoopPosition();
        updateScale();
      });
    });
  }

});
