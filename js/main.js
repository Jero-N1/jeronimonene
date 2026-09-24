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
        fnToggle.setAttribute('aria-expanded', fnLinks.classList.contains('open') ? 'true' : 'false');
      });
    }

    var subnavPanel = document.getElementById('fnSubnav');
    var subnavTriggers = floatingNav.querySelectorAll('[data-subnav]');
    var subnavLists = subnavPanel ? subnavPanel.querySelectorAll('[data-subnav-list]') : [];

    var activeSubnavTrigger = null;

    function positionSubnav(trigger) {
      if (!subnavPanel || !trigger) return;
      var triggerRect = trigger.getBoundingClientRect();
      var panelWidth = subnavPanel.getBoundingClientRect().width || 240;
      var minCenter = Math.min(window.innerWidth / 2, 16 + panelWidth / 2);
      var maxCenter = Math.max(window.innerWidth / 2, window.innerWidth - 16 - panelWidth / 2);
      var center = Math.max(minCenter, Math.min(maxCenter, triggerRect.left + triggerRect.width / 2));
      subnavPanel.style.left = center + 'px';
      subnavPanel.style.right = 'auto';
      subnavPanel.style.top = Math.max(12, triggerRect.bottom + 8) + 'px';
      subnavPanel.style.transform = 'translateX(-50%)';
    }

    function closeSubnav() {
      if (!subnavPanel) return;
      subnavPanel.hidden = true;
      activeSubnavTrigger = null;
      subnavTriggers.forEach(function (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      });
      subnavLists.forEach(function (list) { list.hidden = true; });
    }

    subnavTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        if (!subnavPanel) return;
        var group = trigger.getAttribute('data-subnav');
        var wasOpen = trigger.getAttribute('aria-expanded') === 'true';
        closeSubnav();
        if (wasOpen) return;

        activeSubnavTrigger = trigger;
        subnavPanel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        subnavLists.forEach(function (list) {
          list.hidden = list.getAttribute('data-subnav-list') !== group;
        });
        positionSubnav(trigger);

        var mobileNav = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
        if (mobileNav && fnLinks) {
          fnLinks.classList.remove('open');
          if (fnToggle) fnToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('resize', function () {
      if (!subnavPanel || subnavPanel.hidden) return;
      if (activeSubnavTrigger && activeSubnavTrigger.getClientRects().length) positionSubnav(activeSubnavTrigger);
      else closeSubnav();
    });

    document.addEventListener('click', function (event) {
      if (subnavPanel && !subnavPanel.hidden &&
          !subnavPanel.contains(event.target) &&
          !event.target.closest('[data-subnav]')) {
        closeSubnav();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeSubnav();
    });

    // #inicio existe solo en index.html. En páginas interiores (proyecto, trabajo)
    // usamos .pd-hero si existe, y el nav queda visible desde el inicio (no oculto).
    var hero = document.getElementById('inicio');
    var heroEl = hero || document.querySelector('.pd-hero');
    var alwaysVisible = !hero;

    var navTransferItems = [];
    var navTransferClones = [];
    var navTransferWidth = 0;
    var navTransferHeight = 0;
    var navTransferEnabled = Boolean(
      hero &&
      window.matchMedia &&
      window.matchMedia('(min-width: 901px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    var navTransferDefinitions = hero ? [
      { source: hero.querySelector('.hero-nav a[href="#servicios"]'), target: document.querySelector('.fn-link[data-section="servicios"]'), delay: 0, kind: 'link' },
      { source: hero.querySelector('.hero-nav a[href="#proyectos"]'), target: document.querySelector('.fn-link[data-section="proyectos"]'), delay: 0.08, kind: 'link' },
      { source: hero.querySelector('.hero-nav a[href="#flipbook"]'), target: document.querySelector('.fn-link[data-section="flipbook"]'), delay: 0.16, kind: 'link' },
      { source: hero.querySelector('.hi-contact'), target: document.querySelector('.fn-contact'), delay: 0.22, kind: 'contact' }
    ].filter(function (item) { return item.source && item.target; }) : [];

    function clearNavTransferClones() {
      navTransferClones.forEach(function (item) {
        if (item.ghost.parentNode) item.ghost.parentNode.removeChild(item.ghost);
      });
      navTransferClones = [];
    }

    function measureNavTransfer() {
      clearNavTransferClones();
      floatingNav.classList.add('nav-transfer-measuring');
      navTransferItems = navTransferDefinitions.map(function (item) {
        var sourceRect = item.source.getBoundingClientRect();
        var targetRect = item.target.getBoundingClientRect();
        var sourceStyle = window.getComputedStyle(item.source);
        var targetStyle = window.getComputedStyle(item.target);
        var ghost = document.createElement('span');
        ghost.className = 'nav-transfer-ghost';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.textContent = item.source.textContent.trim();
        ghost.style.fontFamily = sourceStyle.fontFamily;
        ghost.style.fontSize = sourceStyle.fontSize;
        ghost.style.fontWeight = sourceStyle.fontWeight;
        ghost.style.letterSpacing = sourceStyle.letterSpacing;
        ghost.style.lineHeight = sourceStyle.lineHeight;
        ghost.style.textTransform = sourceStyle.textTransform;
        ghost.style.color = sourceStyle.color;
        ghost.style.width = sourceRect.width.toFixed(1) + 'px';
        ghost.style.height = sourceRect.height.toFixed(1) + 'px';
        ghost.style.borderRadius = item.kind === 'contact' ? '999px' : '0';
        ghost.style.background = 'transparent';
        document.body.appendChild(ghost);
        return {
          source: item.source,
          target: item.target,
          delay: item.delay,
          kind: item.kind,
          ghost: ghost,
          start: { x: sourceRect.left, y: sourceRect.top, width: sourceRect.width, height: sourceRect.height },
          end: { x: targetRect.left, y: targetRect.top, width: targetRect.width, height: targetRect.height },
          startColor: sourceStyle.color,
          endColor: targetStyle.color
        };
      });
      floatingNav.classList.remove('nav-transfer-measuring');
      navTransferWidth = window.innerWidth;
      navTransferHeight = window.innerHeight;
      navTransferClones = navTransferItems;
    }

    function updateHeroNavTransfer() {
      if (!hero) return;
      var isDesktop = window.matchMedia && window.matchMedia('(min-width: 901px)').matches;
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!isDesktop || reduceMotion || !navTransferDefinitions.length) {
        clearNavTransferClones();
        hero.classList.remove('nav-transfer-sources-hidden');
        floatingNav.classList.remove('nav-transfer-pending', 'nav-transfer-measuring');
        return;
      }

      var viewportHeight = window.innerHeight || 1;
      var transferStart = viewportHeight * 0.24;
      var transferLength = viewportHeight * 0.52;
      var rawProgress = ((window.scrollY || 0) - transferStart) / transferLength;
      var progress = Math.max(0, Math.min(1, rawProgress));

      if (progress <= 0) {
        clearNavTransferClones();
        hero.classList.remove('nav-transfer-sources-hidden');
        floatingNav.classList.add('nav-transfer-pending');
        return;
      }

      if (progress >= 1) {
        clearNavTransferClones();
        hero.classList.add('nav-transfer-sources-hidden');
        floatingNav.classList.remove('nav-transfer-pending');
        return;
      }

      hero.classList.add('nav-transfer-sources-hidden');
      floatingNav.classList.add('nav-transfer-pending');
      if (!navTransferClones.length || navTransferWidth !== window.innerWidth || navTransferHeight !== window.innerHeight) {
        measureNavTransfer();
      }

      navTransferItems.forEach(function (item) {
        var itemProgress = Math.max(0, Math.min(1, (progress - item.delay) / (1 - item.delay)));
        var start = item.start;
        var end = item.end;
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var t = itemProgress;
        var inverse = 1 - t;
        var c1x = start.x + dx * 0.16;
        var c1y = start.y - Math.min(74, Math.abs(dy) * 0.28);
        var c2x = start.x + dx * 0.82;
        var c2y = end.y + Math.min(64, Math.abs(dy) * 0.22);
        var x = inverse * inverse * inverse * start.x +
          3 * inverse * inverse * t * c1x +
          3 * inverse * t * t * c2x +
          t * t * t * end.x;
        var y = inverse * inverse * inverse * start.y +
          3 * inverse * inverse * t * c1y +
          3 * inverse * t * t * c2y +
          t * t * t * end.y;
        var scaleX = start.width ? end.width / start.width : 1;
        var scaleY = start.height ? end.height / start.height : 1;
        item.ghost.style.transform =
          'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' +
          (1 + (scaleX - 1) * t).toFixed(3) + ',' +
          (1 + (scaleY - 1) * t).toFixed(3) + ')';
        if (item.kind === 'contact') {
          item.ghost.style.color = t > 0.72 ? '#1c1b18' : item.startColor;
          item.ghost.style.background = t > 0.72
            ? 'rgba(255,255,255,' + Math.min(1, (t - 0.72) / 0.28).toFixed(3) + ')'
            : 'transparent';
        } else if (t > 0.78) {
          item.ghost.style.color = item.endColor;
        }
      });
    }

    if (navTransferEnabled) floatingNav.classList.add('nav-transfer-pending');

    function updateNavVisibility() {
      if (!heroEl) { floatingNav.classList.add('visible'); return; }
      var heroBottom = heroEl.getBoundingClientRect().bottom;
      floatingNav.classList.toggle('visible', alwaysVisible || heroBottom < 80 || window.scrollY > 40);
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

    var homeLink = document.querySelector('.fn-link[data-section="inicio"]');
    if (homeLink) {
      homeLink.addEventListener('click', function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (fnLinks) fnLinks.classList.remove('open');
      });
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
      var projectsRect = projectsSection && projectsSection.getBoundingClientRect();
      var projectsNavCover = window.matchMedia && window.matchMedia('(max-width: 760px)').matches ? 80 : 160;
      var projectsNavActive = projectsRect && projectsRect.top <= projectsNavCover && projectsRect.bottom > 0;
      floatingNav.classList.toggle('projects-section-active', Boolean(projectsNavActive));
      if (projectsSection) projectsSection.classList.toggle('projects-cover-active', Boolean(projectsNavActive));
    }

    var ticking = false;

    var servicesSection = document.getElementById('servicios');
    var serviceTiles = servicesSection && servicesSection.querySelector('.work-tiles');

    // La barra tiene posición fija y la sección se desplaza al entrar.
    // Calculamos su destino compensando el transform actual para que aterrice
    // igual desde cualquier punto de la página.
    var servicesNavLink = document.querySelector('.fn-link[data-section="servicios"]');
    if (servicesNavLink && servicesSection) {
      servicesNavLink.addEventListener('click', function (event) {
        event.preventDefault();
        var sectionRect = servicesSection.getBoundingClientRect();
        var transform = window.getComputedStyle(servicesSection).transform;
        var currentShift = transform && transform !== 'none'
          ? new DOMMatrix(transform).m42
          : 0;
        var naturalDocumentTop = window.scrollY + sectionRect.top - currentShift;
        var landingOffset = window.innerHeight * 0.14 + 64;
        var destination = Math.max(0, naturalDocumentTop - landingOffset);

        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '#servicios');
        }
        window.scrollTo({ top: destination, behavior: 'smooth' });
        if (fnLinks) fnLinks.classList.remove('open');
      });
    }

    var projectsSection = document.getElementById('proyectos');
    var projectStages = document.querySelectorAll('#proyectos .project-stage');

    function updateServicesPanel() {
      if (!servicesSection) return;
      var height = window.innerHeight || 1;
      var top = servicesSection.getBoundingClientRect().top;

      // A medida que Servicios cruza el viewport, su avance supera el scroll normal.
      var progress = (height - top) / (height * 0.75);
      progress = Math.max(0, Math.min(1, progress));
      servicesSection.style.setProperty('--panel-progress', progress.toFixed(3));
    }

    function updateProjectsPanel() {
      if (!projectsSection) return;
      var height = window.innerHeight || 1;
      var currentTop = projectsSection.getBoundingClientRect().top;
      var panelOffset = parseFloat(window.getComputedStyle(projectsSection).top) || 0;
      var naturalTop = currentTop - panelOffset;
      var progress = (height - naturalTop) / (height * 0.75);
      progress = Math.max(0, Math.min(1, progress));
      projectsSection.style.setProperty('--projects-panel-progress', progress.toFixed(3));
    }

    function updateProjectCaptions() {
      if (!projectStages.length) return;
      var height = window.innerHeight || 1;
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var mobile = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;

      if (mobile) {
        if (projectsSection) projectsSection.classList.remove('projects-motion-ready', 'project-handoff-active');
        projectStages.forEach(function (stage) {
          stage.classList.remove('project-stage-active', 'project-caption-active', 'project-image-obscured');
        });
        return;
      }

      var metrics = [];
      projectStages.forEach(function (stage, stageIndex) {
        var media = stage.querySelector('.big-media');
        var caption = stage.querySelector('.big-left');
        if (!media || !caption) return;

        var stageRect = stage.getBoundingClientRect();
        var mediaRect = media.getBoundingClientRect();
        var captionRect = caption.getBoundingClientRect();
        var stageStyle = window.getComputedStyle(stage);
        var rowInset = parseFloat(stageStyle.paddingTop) || 0;
        var rowGap = parseFloat(stageStyle.columnGap || stageStyle.gap) || 48;
        var imageWidth = mediaRect.width;
        var imageHeight = mediaRect.height;
        var captionHeight = captionRect.height;
        var captionWidth = parseFloat(window.getComputedStyle(caption).width) || 240;
        var imageTop = Math.max(76, (height - imageHeight) / 2);
        var captionTravel = Math.max(0, imageHeight - captionHeight);
        var projectGap = stageIndex < 1 ? 156 : 244;
        var duration = imageTop + imageHeight + projectGap;
        var exitDistance = Math.max(1, duration - captionTravel);
        var imageLeft = stageRect.left;
        var captionLeft = imageLeft + imageWidth + rowGap;
        var docImageTop = scrollY + stageRect.top + rowInset;

        stage.style.setProperty('--project-image-left', imageLeft.toFixed(1) + 'px');
        stage.style.setProperty('--project-image-top', imageTop.toFixed(1) + 'px');
        stage.style.setProperty('--project-image-width', imageWidth.toFixed(1) + 'px');
        stage.style.setProperty('--project-image-height', imageHeight.toFixed(1) + 'px');
        stage.style.setProperty('--project-caption-left', captionLeft.toFixed(1) + 'px');
        stage.style.setProperty('--project-caption-width', captionWidth.toFixed(1) + 'px');
        stage.style.setProperty('--project-hold-distance', duration.toFixed(1) + 'px');
        metrics.push({
          stage: stage,
          imageTop: imageTop,
          imageHeight: imageHeight,
          mediaTop: mediaRect.top,
          mediaBottom: mediaRect.bottom,
          mediaLeft: mediaRect.left,
          mediaRight: mediaRect.right,
          captionHeight: captionHeight,
          captionTravel: captionTravel,
          exitDistance: exitDistance,
          duration: duration,
          docImageTop: docImageTop,
          rowInset: rowInset
        });
      });

      if (!metrics.length) return;
      metrics[0].startY = metrics[0].docImageTop - metrics[0].imageTop;
      for (var i = 1; i < metrics.length; i++) {
        metrics[i].startY = metrics[i - 1].startY + metrics[i - 1].duration;
      }

      metrics.forEach(function (item, index) {
        var runway;
        if (index < metrics.length - 1) {
          var next = metrics[index + 1];
          var desiredDocumentGap = next.startY + next.imageTop - (item.startY + item.imageTop);
          runway = desiredDocumentGap - item.imageHeight - next.rowInset;
        } else {
          runway = item.duration - item.imageTop - item.imageHeight;
        }
        runway = Math.max(0, runway);
        item.stage.style.setProperty('--project-runway', runway.toFixed(1) + 'px');
        item.stage.style.setProperty('--project-overlap', '0px');
      });

      projectsSection.classList.add('projects-motion-ready');

      var active = null;
      metrics.forEach(function (item) {
        if (scrollY >= item.startY && scrollY < item.startY + item.duration) active = item;
      });

      projectsSection.classList.toggle('project-handoff-active', Boolean(active));
      metrics.forEach(function (item) {
        var isActive = active && active.stage === item.stage;
        item.stage.classList.toggle('project-stage-active', Boolean(isActive));
        item.stage.classList.toggle(
          'project-caption-active',
          Boolean(isActive && scrollY < item.startY + item.captionTravel)
        );
      });

      if (active) {
        var elapsed = scrollY - active.startY;
        var captionTop;
        var imageTop;
        if (elapsed < active.captionTravel) {
          captionTop = active.imageTop + elapsed;
          imageTop = active.imageTop;
        } else {
          var exitProgress = Math.min(
            1,
            (elapsed - active.captionTravel) / active.exitDistance
          );
          var exitShift = exitProgress *
            (active.captionTravel + active.exitDistance);
          imageTop = active.imageTop - exitShift;
          captionTop = imageTop + active.imageHeight - active.captionHeight;
        }
        active.stage.style.setProperty('--project-image-top-active', imageTop.toFixed(1) + 'px');
        active.stage.style.setProperty('--project-caption-top', captionTop.toFixed(1) + 'px');

        var fixedLeft = parseFloat(active.stage.style.getPropertyValue('--project-image-left')) || 0;
        var fixedRight = fixedLeft + (parseFloat(active.stage.style.getPropertyValue('--project-image-width')) || 0);
        var fixedBottom = imageTop + active.imageHeight;
        metrics.forEach(function (item) {
          if (item === active) {
            item.stage.classList.remove('project-image-obscured');
            return;
          }
          var overlapsActive =
            item.mediaLeft < fixedRight &&
            item.mediaRight > fixedLeft &&
            item.mediaTop < fixedBottom &&
            item.mediaBottom > imageTop;
          if (overlapsActive) {
            var coveredTop = Math.max(0, Math.min(item.imageHeight, imageTop + active.imageHeight - item.mediaTop));
            var coveredBottom = Math.max(0, Math.min(item.imageHeight, item.mediaBottom - imageTop));
            if (item.mediaTop < imageTop) coveredTop = 0;
            else coveredBottom = 0;
            item.stage.style.setProperty('--project-clip-top', coveredTop.toFixed(1) + 'px');
            item.stage.style.setProperty('--project-clip-bottom', coveredBottom.toFixed(1) + 'px');
            item.stage.classList.add('project-image-obscured');
          } else {
            item.stage.classList.remove('project-image-obscured');
            item.stage.style.removeProperty('--project-clip-top');
            item.stage.style.removeProperty('--project-clip-bottom');
          }
        });
      } else {
        projectStages.forEach(function (stage) {
          stage.classList.remove('project-image-obscured');
          stage.style.removeProperty('--project-clip-top');
          stage.style.removeProperty('--project-clip-bottom');
        });
      }
    }

    if (serviceTiles && 'IntersectionObserver' in window) {
      servicesSection.classList.add('cards-motion-enhanced');
      var serviceCardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          servicesSection.classList.toggle('cards-motion-visible', entry.isIntersecting);
        });
      }, { threshold: 0.08 });
      serviceCardObserver.observe(serviceTiles);
    }


    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateNavVisibility();
          updateHeroNavTransfer();
          updateActiveSection();
          updateServicesPanel();
          updateProjectsPanel();
          updateProjectCaptions();
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    setTimeout(onScroll, 200);

    // El enlace del menú lleva directo al visor (no al inicio de la sección),
    // para que el libro quede centrado en la ventana con buen zoom.
    var flipbookNavLink = document.querySelector('.fn-link[data-section="flipbook"]');
    var flipbookBookTarget = document.getElementById('flipbookBook');
    if (flipbookNavLink && flipbookBookTarget) {
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

  /* ---------- Categorías fijadas (página de Visualización) ---------- */
  var galleryCategoryBar = document.querySelector('.work-category-bar');
  var galleryStages = document.querySelectorAll('[data-gallery-stage]');
  if (galleryCategoryBar && galleryStages.length) {
    var galleryCategoryLinks = galleryCategoryBar.querySelectorAll('[data-gallery-category]');
    var galleryUpdateQueued = false;

    function updateGalleryCategory() {
      var threshold = galleryCategoryBar.getBoundingClientRect().bottom + 8;
      var activeCategory = galleryStages[0].getAttribute('data-gallery-stage');

      galleryStages.forEach(function (stage) {
        if (stage.getBoundingClientRect().top <= threshold) {
          activeCategory = stage.getAttribute('data-gallery-stage');
        }
      });

      galleryCategoryLinks.forEach(function (link) {
        var isActive = link.getAttribute('data-gallery-category') === activeCategory;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function queueGalleryCategoryUpdate() {
      if (galleryUpdateQueued) return;
      galleryUpdateQueued = true;
      window.requestAnimationFrame(function () {
        updateGalleryCategory();
        galleryUpdateQueued = false;
      });
    }

    window.addEventListener('scroll', queueGalleryCategoryUpdate, { passive: true });
    window.addEventListener('resize', queueGalleryCategoryUpdate);
    galleryCategoryLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var targetId = link.getAttribute('href');
        var target = targetId && document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          var targetTop = window.scrollY + target.getBoundingClientRect().top;
          var stickyTop = parseFloat(window.getComputedStyle(galleryCategoryBar).top) || 0;
          var landingGap = stickyTop + galleryCategoryBar.offsetHeight + 6;
          window.scrollTo({ top: Math.max(0, targetTop - landingGap), behavior: 'smooth' });
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', targetId);
          }
        }
        window.setTimeout(updateGalleryCategory, 350);
      });
    });
    updateGalleryCategory();
    window.setTimeout(updateGalleryCategory, 250);
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



