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
     FLIPBOOK — libro con portada/contraportada solas y el resto en pares
     ============================================ */
  var fbEl = document.getElementById('flipbookBook');
  if (fbEl) {
    var fbTotal = 52;
    var fbMaxState = 26; // 0 = portada (1), 1..25 = pares (2,3)..(50,51), 26 = contraportada (52)
    var fbState = 0;
    var fbAnimating = false;

    var slotLeft = document.getElementById('fbSlotLeft');
    var slotRight = document.getElementById('fbSlotRight');
    var leftFrontImg = document.getElementById('fbLeftFrontImg');
    var leftBackImg = document.getElementById('fbLeftBack');
    var leftFrontLayer = document.getElementById('fbLeftFront');
    var rightFrontImg = document.getElementById('fbRightFrontImg');
    var rightBackImg = document.getElementById('fbRightBack');
    var rightFrontLayer = document.getElementById('fbRightFront');
    var fbIndicator = document.getElementById('fbIndicator');

    function fbSrc(n) { return 'img/flipbook/page-' + (n < 10 ? '0' + n : n) + '.jpg'; }

    function fbPagesForState(s) {
      if (s <= 0) return { mode: 'single', page: 1 };
      if (s >= fbMaxState) return { mode: 'single', page: fbTotal };
      var left = 2 * s;
      return { mode: 'spread', left: left, right: left + 1 };
    }

    function fbUpdateIndicator() {
      if (!fbIndicator) return;
      var info = fbPagesForState(fbState);
      fbIndicator.textContent = info.mode === 'single'
        ? info.page + ' / ' + fbTotal
        : info.left + '-' + info.right + ' / ' + fbTotal;
    }

    function fbSetLeft(page) {
      leftFrontImg.src = fbSrc(page);
      leftFrontImg.alt = 'Página ' + page;
      leftBackImg.src = fbSrc(page);
    }
    function fbSetRight(page) {
      rightFrontImg.src = fbSrc(page);
      rightFrontImg.alt = 'Página ' + page;
      rightBackImg.src = fbSrc(page);
    }
    function fbResetLayer(layer) {
      layer.style.transition = 'none';
      layer.style.transform = 'rotateY(0deg)';
      void layer.offsetWidth;
    }

    // Estado inicial: portada sola
    fbEl.classList.remove('fb-book--spread');
    fbSetLeft(1);
    fbSetRight(3);
    fbUpdateIndicator();

    function fbGoNext() {
      if (fbAnimating || fbState >= fbMaxState) return;
      fbAnimating = true;
      var next = fbPagesForState(fbState + 1);

      if (next.mode === 'single') {
        // Entrando a la contraportada: la página derecha del último par gira y revela la última página sola
        rightBackImg.src = fbSrc(next.page);
        rightFrontLayer.style.transition = 'transform .65s cubic-bezier(.4,.1,.2,1)';
        rightFrontLayer.style.transform = 'rotateY(-160deg)';
        setTimeout(function () {
          fbState++;
          fbEl.classList.remove('fb-book--spread');
          fbSetLeft(next.page);
          fbResetLayer(rightFrontLayer);
          fbUpdateIndicator();
          fbAnimating = false;
        }, 650);
        return;
      }

      if (fbState === 0) {
        // Abriendo la portada: se abre revelando el primer par
        fbEl.classList.add('fb-book--spread');
        fbSetRight(next.right);
        leftBackImg.src = fbSrc(next.left);
        leftFrontLayer.style.transition = 'transform .65s cubic-bezier(.4,.1,.2,1)';
        leftFrontLayer.style.transform = 'rotateY(160deg)';
        setTimeout(function () {
          fbState = 1;
          fbSetLeft(next.left);
          fbResetLayer(leftFrontLayer);
          fbUpdateIndicator();
          fbAnimating = false;
        }, 650);
        return;
      }

      // Par -> par siguiente: la página derecha gira, la izquierda se actualiza en el mismo instante
      rightBackImg.src = fbSrc(next.right);
      rightFrontLayer.style.transition = 'transform .65s cubic-bezier(.4,.1,.2,1)';
      rightFrontLayer.style.transform = 'rotateY(-160deg)';
      setTimeout(function () {
        fbState++;
        fbSetLeft(next.left);
        rightFrontImg.src = fbSrc(next.right);
        rightFrontImg.alt = 'Página ' + next.right;
        fbResetLayer(rightFrontLayer);
        fbUpdateIndicator();
        fbAnimating = false;
      }, 650);
    }

    function fbGoPrev() {
      if (fbAnimating || fbState <= 0) return;
      fbAnimating = true;
      var prev = fbPagesForState(fbState - 1);

      if (prev.mode === 'single') {
        // Volviendo a la portada: la página izquierda del primer par gira y cierra el libro
        leftBackImg.src = fbSrc(prev.page);
        leftFrontLayer.style.transition = 'transform .65s cubic-bezier(.4,.1,.2,1)';
        leftFrontLayer.style.transform = 'rotateY(160deg)';
        setTimeout(function () {
          fbState--;
          fbEl.classList.remove('fb-book--spread');
          fbSetLeft(prev.page);
          fbResetLayer(leftFrontLayer);
          fbUpdateIndicator();
          fbAnimating = false;
        }, 650);
        return;
      }

      var curInfo = fbPagesForState(fbState);
      if (curInfo.mode === 'single') {
        // Saliendo de la contraportada: aparece el último par, la derecha gira hacia adentro
        fbEl.classList.add('fb-book--spread');
        fbSetLeft(prev.left);
        rightFrontImg.src = fbSrc(prev.right);
        rightFrontImg.alt = 'Página ' + prev.right;
        rightFrontLayer.style.transition = 'none';
        rightFrontLayer.style.transform = 'rotateY(-160deg)';
        void rightFrontLayer.offsetWidth;
        rightBackImg.src = fbSrc(prev.right);
        rightFrontLayer.style.transition = 'transform .65s cubic-bezier(.4,.1,.2,1)';
        rightFrontLayer.style.transform = 'rotateY(0deg)';
        setTimeout(function () {
          fbState--;
          fbUpdateIndicator();
          fbAnimating = false;
        }, 650);
        return;
      }

      // Par -> par anterior: la página izquierda gira desde el lado contrario, la derecha se actualiza igual
      leftFrontImg.src = fbSrc(prev.left);
      leftFrontImg.alt = 'Página ' + prev.left;
      leftFrontLayer.style.transition = 'none';
      leftFrontLayer.style.transform = 'rotateY(160deg)';
      void leftFrontLayer.offsetWidth;
      leftBackImg.src = fbSrc(prev.left);
      leftFrontLayer.style.transition = 'transform .65s cubic-bezier(.4,.1,.2,1)';
      leftFrontLayer.style.transform = 'rotateY(0deg)';
      setTimeout(function () {
        fbState--;
        fbSetRight(prev.right);
        fbUpdateIndicator();
        fbAnimating = false;
      }, 650);
    }

    var fbPrevBtn = document.getElementById('fbPrev');
    var fbNextBtn = document.getElementById('fbNext');
    if (fbPrevBtn) fbPrevBtn.addEventListener('click', fbGoPrev);
    if (fbNextBtn) fbNextBtn.addEventListener('click', fbGoNext);
  }

});



