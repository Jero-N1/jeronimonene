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
      var onLight = heroBottom < 60;
      floatingNav.classList.toggle('on-light', onLight);
    }

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

    /* ---- Carrusel de proyectos: loop infinito + escala + drag + rueda + teclado + autoscroll ---- */
    var carousels = document.querySelectorAll('.carousel[data-carousel]');

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
        if (box.width === 0) return;
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
        if (carousel.getBoundingClientRect().width === 0) return;
        var firstReal = track.children[n];
        var firstAny = track.children[0];
        setWidth = firstReal.offsetLeft - firstAny.offsetLeft;
        carousel.scrollLeft = setWidth;
        updateScale();
      }
      initLoopPosition();
      setTimeout(initLoopPosition, 300);

      // Chequeo de loop inmediato (las cajas ya no cambian de tamaño, así que es seguro
      // hacerlo en cada evento de scroll sin esperar a que se detenga).
      carousel.addEventListener('scroll', function () {
        updateScale();
        if (setWidth === 0) return;
        if (carousel.scrollLeft < setWidth * 0.5) {
          carousel.scrollLeft += setWidth;
        } else if (carousel.scrollLeft > setWidth * 1.5) {
          carousel.scrollLeft -= setWidth;
        }
      }, { passive: true });

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
        if (moved) { e.preventDefault(); e.stopPropagation(); return; }
        // Si se hizo clic en una tarjeta que NO es la del centro, la centramos
        // en vez de navegar. La del centro sigue su link normalmente.
        var item = e.target.closest ? e.target.closest('.c-item') : null;
        if (item && !item.classList.contains('is-center')) {
          e.preventDefault();
          var carouselRect = carousel.getBoundingClientRect();
          var itemRect = item.getBoundingClientRect();
          var delta = (itemRect.left + itemRect.width / 2) - (carouselRect.left + carouselRect.width / 2);
          carousel.scrollBy({ left: delta, behavior: 'smooth' });
        }
      }, true);

      // Flechas del teclado y botones prev/next — la caja de cada tarjeta
      // es SIEMPRE del mismo ancho, así que el "paso" es siempre confiable.
      var stepSize = track.children[0].offsetWidth;
      function step(dir) {
        carousel.scrollBy({ left: dir * stepSize, behavior: 'smooth' });
      }
      carousel.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        step(e.key === 'ArrowRight' ? 1 : -1);
      });

      var wrapEl = carousel.closest('.carousel-wrap');
      if (wrapEl) {
        wrapEl.querySelectorAll('.carousel-arrow').forEach(function (btn) {
          btn.addEventListener('click', function () {
            step(parseInt(btn.getAttribute('data-dir'), 10));
          });
        });
      }

      // Autoscroll lento (solo si el carrusel lo pide) — se pausa con cualquier interacción
      if (carousel.hasAttribute('data-autoscroll')) {
        var paused = false;
        var resumeTimeout;
        function pause() {
          paused = true;
          clearTimeout(resumeTimeout);
        }
        function scheduleResume() {
          clearTimeout(resumeTimeout);
          resumeTimeout = setTimeout(function () { paused = false; }, 1800);
        }
        carousel.addEventListener('pointerdown', pause);
        carousel.addEventListener('pointerup', scheduleResume);
        carousel.addEventListener('pointercancel', scheduleResume);
        carousel.addEventListener('wheel', function () { pause(); scheduleResume(); }, { passive: true });
        carousel.addEventListener('mouseenter', pause);
        carousel.addEventListener('mouseleave', scheduleResume);
        carousel.addEventListener('touchstart', pause, { passive: true });
        carousel.addEventListener('touchend', scheduleResume);
        carousel.addEventListener('keydown', function () { pause(); scheduleResume(); });

        var lastTime = null;
        function autoTick(t) {
          if (lastTime === null) lastTime = t;
          var dt = t - lastTime;
          lastTime = t;
          if (!paused && setWidth > 0) {
            carousel.scrollLeft += dt * 0.028; // px por ms — lento y constante
          }
          window.requestAnimationFrame(autoTick);
        }
        window.requestAnimationFrame(autoTick);
      }

      window.addEventListener('resize', function () {
        initLoopPosition();
        updateScale();
        stepSize = track.children[0].offsetWidth;
      });
    });
  }

});
