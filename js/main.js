// ============================================
// Portafolio — interactividad compartida
// ============================================

// Menú móvil (hamburguesa)
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // ---- Hotspots interactivos sobre el render de maquetas ----
  var hotspots = document.querySelectorAll('.hotspot');
  var bubbles = document.querySelectorAll('.bubble');

  function closeAll() {
    hotspots.forEach(function (h) { h.classList.remove('active'); });
    bubbles.forEach(function (b) { b.classList.remove('show'); });
  }

  hotspots.forEach(function (hotspot) {
    hotspot.addEventListener('click', function (e) {
      e.stopPropagation();
      var targetId = hotspot.getAttribute('data-bubble');
      var bubble = document.getElementById(targetId);
      var isOpen = bubble && bubble.classList.contains('show');
      closeAll();
      if (bubble && !isOpen) {
        bubble.classList.add('show');
        hotspot.classList.add('active');
      }
    });
  });

  document.addEventListener('click', closeAll);
  document.querySelectorAll('.bubble').forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); });
  });
});
