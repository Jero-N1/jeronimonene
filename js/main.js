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

    function updateNavVisibility() {
      if (!heroEl) { floatingNav.classList.add('visible'); return; }
      var heroBottom = heroEl.getBoundingClientRect().bottom;
      floatingNav.classList.toggle('visible', alwaysVisible || heroBottom < 80);
      // Solo mientras la barra está encima del hero (foto oscura) usamos vidrio oscuro;
      // en cuanto se pasa, vuelve al vidrio claro consistente del resto del sitio.
      floatingNav.classList.toggle('on-dark', heroBottom > 60);
    }

    var fnLinkEls = document.querySelectorAll('.fn-link[data-section]');
    var indicator = document.getElementById('fnIndicator');
    var sections = ['inicio', 'servicios', 'proyectos', 'flipbook']
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

    // El enlace del menú debe llevar directamente al visor, no al inicio
    // de la sección. Así el libro queda centrado en la ventana sin reducir
    // el tamaño de la sección ni alterar el layout.
    var flipbookNavLink = document.querySelector('.fn-link[data-section=\"flipbook\"]');
    var flipbookSection = document.getElementById('flipbook');
    var flipbookBookTarget = document.getElementById('flipbookBook');
    if (flipbookNavLink && flipbookSection && flipbookBookTarget) {
      flipbookNavLink.addEventListener('click', function (e) {
        e.preventDefault();
        flipbookBookTarget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        if (history.pushState) history.pushState(null, '', '#flipbook');
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
      var speed = parseFloat(track.dataset.speed) || 0.6;
      var autoplay = true;
      var isDown = false;
      var startX = 0, startScroll = 0, dragged = false;
      var resumeTimer = null;
      // scrollLeft se redondea a píxel entero en el navegador: si solo sumáramos
      // el valor fraccionario a track.scrollLeft, cada cuadro se redondearía de
      // vuelta al mismo entero y el carrusel nunca se movería. Por eso llevamos
      // la posición exacta en esta variable y solo escribimos el valor redondeado.
      var pos = track.scrollLeft;

      function half() { return track.scrollWidth / 2; }

      function pause() { autoplay = false; }
      function resumeLater() {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
          pos = track.scrollLeft;
          autoplay = true;
        }, 1800);
      }

      function tick() {
        if (autoplay && !isDown) {
          pos += speed;
          var h = half();
          if (h > 0 && pos >= h) pos -= h;
          track.scrollLeft = Math.round(pos);
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      var pointerId = null;

      track.addEventListener('pointerdown', function (e) {
        isDown = true;
        dragged = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
        pointerId = e.pointerId;
        pause();
      });

      track.addEventListener('pointermove', function (e) {
        if (!isDown) return;
        var dx = e.clientX - startX;
        if (!dragged && Math.abs(dx) > 4) {
          dragged = true;
          track.classList.add('dragging');
          // Capturamos el puntero SOLO al confirmar que es un arrastre real.
          // Si se captura desde el pointerdown, el navegador reasigna hasta
          // el "click" sintético al elemento capturador y el enlace nunca navega,
          // aunque el usuario solo haya hecho clic sin mover el mouse.
          try { track.setPointerCapture(pointerId); } catch (err) {}
        }
        if (dragged) track.scrollLeft = startScroll - dx;
      });

      function endDrag() {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('dragging');
        if (dragged && pointerId != null) {
          try { track.releasePointerCapture(pointerId); } catch (err) {}
        }
        var h = half();
        if (h > 0) {
          if (track.scrollLeft < 0) track.scrollLeft += h;
          if (track.scrollLeft >= h) track.scrollLeft -= h;
        }
        pos = track.scrollLeft;
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

  /* ============================================
     LIGHTBOX — zoom semi-completo (solo carruseles .work-carousel)
     ============================================ */
  var lb = document.getElementById('lightbox');
  var wcItems = document.querySelectorAll('.work-carousel .pd-item, .work-carousel .wg-img');
  if (lb && wcItems.length) {
    var lbImg = document.getElementById('lightboxImg');
    wcItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var img = item.querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lb.classList.add('active');
      });
    });
    lb.addEventListener('click', function () { lb.classList.remove('active'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lb.classList.remove('active');
    });
  }

  /* ============================================
     FLIPBOOK — motor StPageFlip
     El motor gestiona el giro 3D, drag/touch y el retorno.
     Los controles y la interfaz siguen siendo propios.
     ============================================ */
  var fbEl = document.getElementById('flipbookBook');
  if (fbEl && window.St && window.St.PageFlip) {
    var fbTotal = 52;
    var fbPageWidth = 560;
    var fbPageHeight = 560;
    var fbImages = [];
    for (var i = 1; i <= fbTotal; i++) {
      fbImages.push('img/flipbook/page-' + String(i).padStart(2,'0') + '.jpg');
    }

    var pageFlip = new St.PageFlip(fbEl, {
      width: fbPageWidth,
      height: fbPageHeight,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 560,
      minHeight: 280,
      maxHeight: 560,
      showCover: true,
      usePortrait: true,
      startPage: 0,
      drawShadow: true,
      maxShadowOpacity: 0.32,
      flippingTime: 720,
      mobileScrollSupport: true,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 24,
      showPageCorners: true,
      disableFlipByClick: false
    });

    pageFlip.loadFromImages(fbImages);

    var fbIndicator = document.getElementById('fbIndicator');
    var fbProgress = document.getElementById('fbProgress');
    var fbHomeBtn = document.getElementById('fbHome');
    var fbEndBtn = document.getElementById('fbEnd');
    var fbSidePrev = document.getElementById('fbSidePrev');
    var fbSideNext = document.getElementById('fbSideNext');
    var fbFullscreen = document.getElementById('fbFullscreen');
    var fbProgressTrack = document.querySelector('.fb-progress-track');
    var fbProgressFill = document.querySelector('.fb-progress-fill');
    var fbProgressThumb = document.querySelector('.fb-progress-thumb');

    function fbPageIndex() { return pageFlip.getCurrentPageIndex(); }

    // 52 imágenes forman 27 estados visuales: portada + 25 dobles páginas + contraportada.
    function fbSpreadIndex(pageIndex) {
      if (pageIndex <= 0) return 0;
      if (pageIndex >= fbTotal - 1) return 26;
      return Math.ceil(pageIndex / 2);
    }

    function fbSpreadPageIndex(spreadIndex) {
      if (spreadIndex <= 0) return 0;
      if (spreadIndex >= 26) return fbTotal - 1;
      return spreadIndex * 2;
    }

    function fbUpdateUI() {
      var current = fbPageIndex();
      var spread = fbSpreadIndex(current);
      var progressMax = 26;
      var percent = (spread / progressMax) * 100;

      if (fbIndicator) fbIndicator.textContent = (spread + 1) + ' / 27';
      if (fbProgress) fbProgress.value = spread;
      if (fbProgressFill) fbProgressFill.style.width = percent + '%';
      if (fbProgressThumb) fbProgressThumb.style.left = percent + '%';

      var atStart = spread <= 0;
      var atEnd = spread >= progressMax;
      [fbSidePrev, fbHomeBtn].forEach(function(b){ if(b) b.disabled = atStart; });
      [fbSideNext, fbEndBtn].forEach(function(b){ if(b) b.disabled = atEnd; });
    }

    pageFlip.on('flip', function(e) {
      var current = typeof e.data === 'number' ? e.data : fbPageIndex();
      if (fbIndicator) fbIndicator.textContent = (current + 1) + ' / ' + fbTotal;
      if (fbProgress) fbProgress.value = current;
      fbUpdateUI();
    });

    pageFlip.on('init', fbUpdateUI);
    pageFlip.on('changeOrientation', function(){
      requestAnimationFrame(fbUpdateUI);
    });

    function fbNext() { pageFlip.flipNext('top'); }
    function fbPrev() { pageFlip.flipPrev('top'); }
    function fbHome() { pageFlip.turnToPage(0); fbUpdateUI(); }
    function fbEnd() { pageFlip.turnToPage(fbTotal - 1); fbUpdateUI(); }

    if (fbSidePrev) fbSidePrev.addEventListener('click', fbPrev);
    if (fbSideNext) fbSideNext.addEventListener('click', fbNext);
    if (fbHomeBtn) fbHomeBtn.addEventListener('click', fbHome);
    if (fbEndBtn) fbEndBtn.addEventListener('click', fbEnd);

    if (fbProgress) {
      fbProgress.max = 26;
      fbProgress.value = 0;
      fbProgress.addEventListener('input', function() {
        var spread = Number(this.value);
        pageFlip.turnToPage(fbSpreadPageIndex(spread));
        fbUpdateUI();
      });
    }

    document.addEventListener('keydown', function(e) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      var rect = fbEl.getBoundingClientRect();
      var visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!visible) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); fbNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); fbPrev(); }
      if (e.key === 'Home') { e.preventDefault(); fbHome(); }
      if (e.key === 'End') { e.preventDefault(); fbEnd(); }
    });

    if (fbFullscreen) {
      fbFullscreen.addEventListener('click', function(){
        var wrapper = fbEl.closest('.fb-book-row') || fbEl;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        } else {
          wrapper.classList.toggle('fb-fullscreen');
        }
      });
    }

    fbUpdateUI();
  }

});



