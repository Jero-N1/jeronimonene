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

    // #inicio existe solo en index.html. En páginas interiores (proyecto, trabajo)
    // usamos .pd-hero si existe, y el nav queda visible desde el inicio (no oculto).
    var hero = document.getElementById('inicio');
    var heroEl = hero || document.querySelector('.pd-hero');
    var alwaysVisible = !hero;
    var modelFrame = document.querySelector('.proyectos-swiper');

    function updateNavVisibility() {
      if (!heroEl) { floatingNav.classList.add('visible', 'on-light'); return; }
      var heroBottom = heroEl.getBoundingClientRect().bottom;
      floatingNav.classList.toggle('visible', alwaysVisible || heroBottom < 80);

      // Claro en cuanto se pasa el hero (Trabajo, Proyectos, Flipbook son claras),
      // salvo mientras la barra queda sobre las fotos del carrusel de Proyectos.
      var onLight = heroBottom < 60;
      if (onLight && modelFrame) {
        var fRect = modelFrame.getBoundingClientRect();
        if (fRect.top < 60 && fRect.bottom > 60) onLight = false;
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

    /* ---- Carrusel de proyectos: Swiper (coverflow) ---- */
    if (window.Swiper && document.querySelector('.proyectos-swiper')) {
      new Swiper('.proyectos-swiper', {
        slidesPerView: 'auto',
        slidesOffsetBefore: 200,
        slidesOffsetAfter: 200,
        initialSlide: 1,
        centeredSlides: true,
        centerInsufficientSlides: true,
        roundLengths: true,
        slideToClickedSlide: true,
        loop: true,
        effect: 'coverflow',
        coverflowEffect: {
          rotate: 130,
          stretch: 120,
          depth: 320,
          scale: 0.55,
          modifier: 0.5
        },
        navigation: {
          nextEl: '.proyectos-swiper .swiper-button-next',
          prevEl: '.proyectos-swiper .swiper-button-prev'
        },
        pagination: {
          el: '.proyectos-swiper .swiper-pagination',
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
    }
  }

  /* ============================================
     CARRUSELES ARRASTRABLES (páginas de proyecto)
     Autoscroll + drag + click, sin tocar la rueda
     (el wheel solo pausa/reanuda, nunca hace scroll horizontal)
     ============================================ */
  var dragCarousels = document.querySelectorAll('.pd-carousel');
  if (dragCarousels.length) {
    dragCarousels.forEach(function (track) {
      var speed = parseFloat(track.dataset.speed) || 0.35;
      var autoplay = true;
      var isDown = false;
      var startX = 0, startScroll = 0, dragged = false;
      var resumeTimer = null;

      function half() { return track.scrollWidth / 2; }

      function pause() { autoplay = false; }
      function resumeLater() {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () { autoplay = true; }, 1800);
      }

      function tick() {
        if (autoplay && !isDown) {
          track.scrollLeft += speed;
          var h = half();
          if (h > 0 && track.scrollLeft >= h) track.scrollLeft -= h;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      track.addEventListener('pointerdown', function (e) {
        isDown = true;
        dragged = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
        track.classList.add('dragging');
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
        pause();
      });

      track.addEventListener('pointermove', function (e) {
        if (!isDown) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) dragged = true;
        track.scrollLeft = startScroll - dx;
      });

      function endDrag() {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('dragging');
        var h = half();
        if (h > 0) {
          if (track.scrollLeft < 0) track.scrollLeft += h;
          if (track.scrollLeft >= h) track.scrollLeft -= h;
        }
        resumeLater();
      }
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointerleave', endDrag);
      track.addEventListener('pointercancel', endDrag);

      // Evita que un drag termine navegando al enlace (pero deja pasar los clicks normales)
      track.addEventListener('click', function (e) {
        if (dragged) {
          e.preventDefault();
          e.stopPropagation();
          dragged = false;
        }
      }, true);

      // La rueda del mouse solo pausa/retoma el autoscroll; nunca se captura ni redirige a scroll horizontal
      track.addEventListener('wheel', function () {
        pause();
        resumeLater();
      }, { passive: true });

      var wrap = track.closest('.pd-carousel-wrap');
      if (wrap) {
        var prevBtn = wrap.querySelector('.pd-arrow--prev');
        var nextBtn = wrap.querySelector('.pd-arrow--next');
        if (prevBtn) prevBtn.addEventListener('click', function () {
          pause();
          track.scrollBy({ left: -track.clientWidth * 0.6, behavior: 'smooth' });
          resumeLater();
        });
        if (nextBtn) nextBtn.addEventListener('click', function () {
          pause();
          track.scrollBy({ left: track.clientWidth * 0.6, behavior: 'smooth' });
          resumeLater();
        });
      }
    });
  }

});
