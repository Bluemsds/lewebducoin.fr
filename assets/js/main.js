/* Le Web du Coin — v3 */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu téléphone */
  var burger = doc.querySelector('.burger');
  if (burger) {
    var fermer = function () { body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); };
    burger.addEventListener('click', function () {
      var ouvert = body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    doc.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', fermer); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') fermer(); });
  }

  /* Téléphones : mise à l'échelle de la démo, chargement à la demande, défilement automatique */
  function ajuste(screen) {
    var f = screen.querySelector('iframe'); if (!f) return;
    var s = screen.clientWidth / 390;
    screen.style.setProperty('--s', s);
    f.style.height = Math.ceil(screen.clientHeight / s) + 'px';
  }
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) { es.forEach(function (e) { ajuste(e.target); }); }) : null;

  function defile(f) {
    if (calme || f._defile) return;
    f._defile = true;
    var y = 0, pause = 90, sens = 1, last = 0;
    function pas(t) {
      if (!f.isConnected) return;
      if (!f._visible) { f._raf = requestAnimationFrame(pas); last = t; return; }
      var dt = Math.min(50, t - (last || t)); last = t;
      try {
        var w = f.contentWindow, d = w.document.documentElement;
        var max = d.scrollHeight - w.innerHeight;
        if (pause > 0) pause -= dt / 16;
        else {
          y += sens * dt * (sens > 0 ? 0.045 : 0.9);
          if (y >= max) { y = max; sens = -1; pause = 100; }
          if (y <= 0) { y = 0; sens = 1; pause = 120; }
        }
        w.scrollTo(0, y);
      } catch (e) { return; }
      f._raf = requestAnimationFrame(pas);
    }
    f._raf = requestAnimationFrame(pas);
  }

  function charge(f) {
    if (f.getAttribute('src') || !f.dataset.src) return;
    f.addEventListener('load', function () {
      f.classList.add('ok');
      var w = f.parentNode.querySelector('.wait'); if (w) w.hidden = true;
      f._defile = false; cancelAnimationFrame(f._raf); defile(f);
    });
    f.src = f.dataset.src;
  }

  var vu = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var f = e.target.querySelector('iframe');
      if (!f) return;
      f._visible = e.isIntersecting;
      if (e.isIntersecting) charge(f);
    });
  }, { rootMargin: '150px 0px' }) : null;

  doc.querySelectorAll('.screen').forEach(function (sc) {
    ajuste(sc);
    if (ro) ro.observe(sc);
    if (vu) vu.observe(sc); else { var f = sc.querySelector('iframe'); f._visible = true; charge(f); }
  });

  /* Accueil : choix de la démo dans le téléphone */
  var chips = doc.querySelectorAll('.chip[data-demo]');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var sc = doc.querySelector('.vitrine .screen'), f = sc.querySelector('iframe'), lien = sc.parentNode.querySelector('a.cover');
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      f.classList.remove('ok'); cancelAnimationFrame(f._raf); f._defile = false;
      f.dataset.src = c.dataset.demo; f.removeAttribute('src'); charge(f);
      if (lien) { lien.href = c.dataset.demo; lien.setAttribute('aria-label', 'Ouvrir la démo ' + c.textContent); }
    });
  });

  /* Exemples : points du carrousel */
  var rail = doc.querySelector('.demos'), points = doc.querySelectorAll('.points button');
  if (rail && points.length) {
    var items = rail.querySelectorAll('.demo');
    var maj = function () {
      var c = rail.scrollLeft + rail.clientWidth / 2, best = 0, d = 1e9;
      items.forEach(function (it, i) { var m = Math.abs(it.offsetLeft + it.offsetWidth / 2 - c); if (m < d) { d = m; best = i; } });
      points.forEach(function (p, i) { p.setAttribute('aria-current', i === best ? 'true' : 'false'); });
    };
    rail.addEventListener('scroll', function () { requestAnimationFrame(maj); }, { passive: true });
    points.forEach(function (p, i) {
      p.addEventListener('click', function () { items[i].scrollIntoView({ behavior: calme ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }); });
    });
    maj();
  }

  /* Recherche simulée */
  var serp = doc.querySelector('.serp');
  if (serp) {
    var q = serp.querySelector('.serp-q'), moi = serp.querySelector('.res.moi'), lui = serp.querySelector('.res.lui');
    var scenes = [
      ['boulangerie corbeil', 'Votre boulangerie', 'Boulangerie · Corbeil-Essonnes', 'Ouvert', ' · ferme à 19:30'],
      ['coiffeur près de moi', 'Votre salon', 'Coiffeur · Corbeil-Essonnes', 'Ouvert', ' · ferme à 19:00'],
      ['snack ouvert tard corbeil', 'Votre snack', 'Snack · Corbeil-Essonnes', 'Ouvert', ' · ferme à 2:00']
    ];
    var i = 0;
    var ecris = function (txt, k, fin) {
      q.textContent = txt.slice(0, k);
      if (k < txt.length) setTimeout(function () { ecris(txt, k + 1, fin); }, 60 + Math.random() * 60);
      else setTimeout(fin, 350);
    };
    var scene = function () {
      var s = scenes[i % scenes.length]; i++;
      serp.classList.add('flash');
      ecris(s[0], 0, function () {
        moi.querySelector('b').textContent = s[1];
        moi.querySelector('.meta').textContent = s[2];
        moi.querySelector('.open').textContent = s[3];
        moi.querySelector('.h').textContent = s[4];
        lui.querySelector('.meta').textContent = s[2];
        serp.classList.remove('flash');
        setTimeout(scene, 4200);
      });
    };
    if (calme) { q.textContent = scenes[0][0]; }
    else {
      var lance = false;
      var obs = new IntersectionObserver(function (es) { if (es[0].isIntersecting && !lance) { lance = true; scene(); } });
      obs.observe(serp);
    }
  }

  /* Automatisation : la conversation se joue quand elle arrive à l'écran, puis recommence */
  var chat = doc.querySelector('.chat');
  if (chat && !calme && 'IntersectionObserver' in window) {
    var tour;
    var joue = function () { chat.classList.remove('joue'); void chat.offsetWidth; chat.classList.add('joue'); };
    new IntersectionObserver(function (es) {
      clearInterval(tour);
      if (es[0].isIntersecting) { joue(); tour = setInterval(joue, 11000); }
    }, { threshold: .4 }).observe(chat);
  }

  /* Du pavé au pixel : mosaïque animée */
  function mosaique(cv) {
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var front0 = parseFloat(cv.dataset.front || '.5');
    var dpr = Math.min(2, window.devicePixelRatio || 1), W, H, c, cells = [], t0 = performance.now(), visible = true, raf;
    var px = -999, py = -999, pt = 0;
    var mauves = ['192,107,224', '142,68,201', '227,200,242', '170,90,215'];
    function construit() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height; if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      c = W < 600 ? 24 : 30;
      cells = [];
      var cols = Math.ceil(W / c) + 2, rows = Math.ceil(H / c) + 1;
      for (var y = 0; y < rows; y++) for (var x = -1; x < cols; x++) {
        cells.push({ x: x, y: y, n: Math.random(), g: Math.random(), m: mauves[(Math.random() * 4) | 0], vide: Math.random() < .22, j: (Math.random() - .5) * 3 });
      }
    }
    function lisse(a) { a = a < 0 ? 0 : a > 1 ? 1 : a; return a * a * (3 - 2 * a); }
    function dessine(t) {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var e = calme ? 1 : lisse((t - t0) / 2600);
      var front = 1.15 - (1.15 - front0) * e + (calme ? 0 : Math.sin(t / 2400) * .025);
      var actif = t - pt < 1600;
      for (var i = 0; i < cells.length; i++) {
        var k = cells[i];
        var ux = (k.x * c) / W;
        var p = lisse((ux - front) / .22 + (k.n - .5) * .9 + .5);
        if (actif) {
          var dx = k.x * c + c / 2 - px, dy = k.y * c + c / 2 - py, d = Math.sqrt(dx * dx + dy * dy);
          var f = Math.max(0, 1 - d / 110) * (1 - (t - pt) / 1600);
          p = Math.min(1, p + f * 1.4);
        }
        var dec = (k.y % 2) * (c / 2) * (1 - p);
        var gap = 3 - p * 1.4, rr = (c * .32) * (1 - p) + .5;
        var s = c - gap * 2 + (1 - p) * k.j;
        var X = k.x * c + dec + gap, Y = k.y * c + gap;
        if (p > .5 && k.vide) { if (p > .8) continue; ctx.globalAlpha = 1 - (p - .5) / .3; } else ctx.globalAlpha = 1;
        var pierre = 22 + k.g * 9, a = .55 + k.g * .2;
        if (p < .5) {
          ctx.fillStyle = 'rgba(' + (pierre + 6 | 0) + ',' + (pierre + 2 | 0) + ',' + (pierre + 12 | 0) + ',' + a + ')';
        } else {
          ctx.fillStyle = 'rgba(' + k.m + ',' + (.12 + k.g * .38) * (p - .5) * 2 + ')';
        }
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(X, Y, s, s, rr); else ctx.rect(X, Y, s, s);
        ctx.fill();
        if (p < .5 && k.g > .55) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(X + rr / 2, Y + 1, s - rr, 2); }
      }
      ctx.globalAlpha = 1;
    }
    var der = 0;
    function boucle(t) {
      raf = requestAnimationFrame(boucle);
      if (!visible || t - der < 33) return;
      der = t; dessine(t);
    }
    construit();
    if (calme) { dessine(performance.now()); }
    else raf = requestAnimationFrame(boucle);
    var to;
    window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(function () { construit(); dessine(performance.now()); }, 150); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    var zone = cv.parentNode;
    var touche = function (e) {
      var r = cv.getBoundingClientRect(), pnt = e.touches ? e.touches[0] : e;
      px = pnt.clientX - r.left; py = pnt.clientY - r.top; pt = performance.now();
    };
    zone.addEventListener('pointermove', touche, { passive: true });
    zone.addEventListener('touchstart', touche, { passive: true });
  }
  doc.querySelectorAll('canvas.mosaique').forEach(mosaique);
})();
