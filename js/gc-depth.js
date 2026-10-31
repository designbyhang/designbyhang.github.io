/* GoatCounter scroll-depth events: one per section per page load, plus "finished". No DOM/visual changes. */
(function () {
  try {
    if (!('IntersectionObserver' in window)) return;
    var h = location.hostname;
    if (!h || h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || /\.local$/.test(h)) { if (!window.__gcDepthTest) return; }
    try { if (localStorage.getItem('skipgc') === 't') return; } catch (e) {}
    var m = location.pathname.match(/\/projects\/([a-z0-9-]+)(?:\.html)?\/?$/i);
    if (!m) return;
    var slug = m[1].toLowerCase();
    var queue = [], tries = 0, timer = null;
    function flush() {
      var gc = window.goatcounter;
      if (gc && typeof gc.count === 'function') {
        while (queue.length) { try { gc.count(queue.shift()); } catch (e) {} }
        timer = null; return;
      }
      if (++tries > 120) { queue.length = 0; timer = null; return; } // ~60s, then give up (blocked)
      timer = setTimeout(flush, 500);
    }
    function send(path, title) {
      queue.push({ path: path, title: title, event: true });
      if (!timer) flush();
    }
    function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
    function init() {
      var secs = document.querySelectorAll('section.sec[id]');
      var items = [];
      for (var i = 0; i < secs.length; i++) {
        var s = secs[i], n = (i + 1 < 10 ? '0' : '') + (i + 1);
        var name = slugify(s.getAttribute('data-title') || s.id) || slugify(s.id);
        items.push({ el: s, path: slug + '/section/' + n + '-' + name, title: slug + ': ' + (s.getAttribute('data-title') || s.id) });
      }
      var next = document.querySelector('.next');
      if (next) items.push({ el: next, path: slug + '/finished', title: slug + ': finished' });
      if (!items.length) return;
      var done = new Set();
      function fire(it) { if (done.has(it)) return; done.add(it); send(it.path, it.title); }
      var byEl = new Map(); items.forEach(function (it) { byEl.set(it.el, it); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var it = byEl.get(e.target); if (!it || !e.isIntersecting) return;
          var vh = window.innerHeight || document.documentElement.clientHeight;
          // fire at 25% visible, or (tall sections) once top passes 60% of viewport
          if (e.intersectionRatio >= 0.25 || e.boundingClientRect.top <= vh * 0.6) { fire(it); io.unobserve(e.target); }
        });
      }, { threshold: [0, 0.05, 0.1, 0.25, 0.5] });
      items.forEach(function (it) { io.observe(it.el); });
      // scroll fallback for tall sections whose ratio never changes threshold
      var raf = 0;
      window.addEventListener('scroll', function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0; var vh = window.innerHeight;
          items.forEach(function (it) {
            if (done.has(it)) return;
            var r = it.el.getBoundingClientRect();
            if (r.top <= vh * 0.6 && r.bottom > 0) { fire(it); io.unobserve(it.el); }
          });
        });
      }, { passive: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  } catch (e) {}
})();
