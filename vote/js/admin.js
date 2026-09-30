/* ADMIN.JS — tableau de bord animé. ES5, sans dépendance. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var code = "", timer = null, lastVoted = null, rendered = false;
  var CIRC = 263.9;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var loginLabel = $("btn-login").innerHTML;

  function later(fn, ms) { setTimeout(fn, reduce ? 0 : ms); }
  function toast(t) { if (window.showToast) window.showToast(t); }

  function msg(id, cls, title) {
    var b = $(id);
    b.innerHTML = "";
    if (!title) return;
    var d = document.createElement("div"), s = document.createElement("strong");
    d.className = "msg " + cls;
    d.setAttribute("role", cls === "err" ? "alert" : "status");
    s.textContent = title;
    d.appendChild(s);
    b.appendChild(d);
  }

  /* ---------- Nombres qui comptent ---------- */
  function tween(el, to, fmt) {
    fmt = fmt || function (v) { return "" + v; };
    var from = +el.getAttribute("data-v") || 0;
    el.setAttribute("data-v", to);
    if (el._raf) cancelAnimationFrame(el._raf);
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1100;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(from + (to - from) * e));
      if (k < 1) el._raf = requestAnimationFrame(step);
    }
    el._raf = requestAnimationFrame(step);
  }

  function pop(el) { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }

  /* ---------- Fenêtre de confirmation ---------- */
  function confirmBox(o, onOk) {
    var back = document.activeElement;
    var m = document.createElement("div");
    m.className = "modal" + (o.danger ? " danger-m" : "");
    m.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="m-t"><div class="modal-ico" aria-hidden="true"></div><h4 id="m-t"></h4><p></p><div class="modal-actions"><button type="button" class="btn btn-dark-outline" data-r="0"></button><button type="button" class="btn ' + (o.danger ? "btn-danger" : "btn-primary") + '" data-r="1"></button></div></div>';
    m.querySelector(".modal-ico").textContent = o.danger ? "!" : "?";
    m.querySelector("h4").textContent = o.title;
    m.querySelector("p").textContent = o.text;
    var bs = m.querySelectorAll("button");
    bs[0].textContent = "Annuler";
    bs[1].textContent = o.label;
    document.body.appendChild(m);
    bs[o.danger ? 0 : 1].focus();

    function close(ok) {
      document.removeEventListener("keydown", key, true);
      m.classList.add("out");
      setTimeout(function () {
        if (m.parentNode) m.parentNode.removeChild(m);
        if (back && back.focus) back.focus();
        if (ok) onOk();
      }, reduce ? 0 : 200);
    }
    function key(e) {
      if (e.key === "Escape") { e.preventDefault(); close(false); }
      if (e.key === "Tab") {
        e.preventDefault();
        (document.activeElement === bs[0] ? bs[1] : bs[0]).focus();
      }
    }
    document.addEventListener("keydown", key, true);
    bs[0].onclick = function () { close(false); };
    bs[1].onclick = function () { close(true); };
    m.addEventListener("click", function (e) { if (e.target === m) close(false); });
  }

  /* ---------- Classement ---------- */
  var rows = {};
  var CROWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 8 4 4 5-7 5 7 4-4-2 11H5L3 8z"/></svg>';

  function initials(n) {
    var p = String(n).split(/\s+/);
    return ((p[0] || "").charAt(0) + (p[1] || "").charAt(0)).toUpperCase();
  }

  function makeRow(c) {
    var d = document.createElement("div"), img = document.createElement("img"), main = document.createElement("div");
    d.className = "rank";
    img.className = "rank-avatar"; img.alt = ""; img.src = c.photo;
    img.onerror = function () {
      var f = document.createElement("div");
      f.className = "rank-avatar fallback"; f.textContent = initials(c.name);
      if (img.parentNode) img.parentNode.replaceChild(f, img);
    };
    main.className = "rank-main";
    main.innerHTML = '<div class="rank-name"><span class="n"></span></div><div class="rank-votes"></div>';
    main.querySelector(".n").textContent = c.name;
    var pct = document.createElement("div"); pct.className = "rank-pct"; pct.textContent = "0 %";
    var bar = document.createElement("div"); bar.className = "rank-bar"; bar.innerHTML = "<i></i>";
    d.appendChild(img); d.appendChild(main); d.appendChild(pct); d.appendChild(bar);
    return { el: d, main: main, pct: pct, bar: bar.firstChild };
  }

  function renderResults(counts) {
    var box = $("a-results"), sum = 0, list = [], i;
    CONFIG.CANDIDATES.forEach(function (c, idx) {
      var n = +counts[c.id] || 0;
      sum += n;
      list.push({ c: c, n: n, idx: idx });
    });
    list.sort(function (a, b) { return b.n - a.n || a.idx - b.idx; });
    var top = list.length ? list[0].n : 0;

    /* positions avant, pour l'animation de réordonnancement */
    var before = {};
    for (var id in rows) if (rows.hasOwnProperty(id)) before[id] = rows[id].el.getBoundingClientRect().top;

    list.forEach(function (x) {
      if (!rows[x.c.id]) rows[x.c.id] = makeRow(x.c);
      var r = rows[x.c.id], pct = sum ? Math.round(x.n * 100 / sum) : 0;
      var lead = top > 0 && x.n === top;
      r.el.classList.toggle("lead", lead);
      var badge = r.main.querySelector(".badge-lead");
      if (lead && !badge) {
        badge = document.createElement("span");
        badge.className = "badge-lead";
        r.main.querySelector(".rank-name").appendChild(badge);
      }
      if (badge) {
        if (lead) badge.innerHTML = CROWN + (list.filter(function (y) { return y.n === top; }).length > 1 ? "Égalité" : "En tête");
        else badge.parentNode.removeChild(badge);
      }
      r.main.querySelector(".rank-votes").textContent = x.n + " voix";
      tween(r.pct, pct, function (v) { return v + " %"; });
      r.bar.style.width = pct + "%";
      box.appendChild(r.el);
    });

    /* FLIP : les lignes glissent vers leur nouvelle place */
    if (!reduce) {
      list.forEach(function (x) {
        var r = rows[x.c.id];
        if (before[x.c.id] === undefined) return;
        var dy = before[x.c.id] - r.el.getBoundingClientRect().top;
        if (Math.abs(dy) < 2) return;
        r.el.classList.remove("moving");
        r.el.style.transform = "translateY(" + dy + "px)";
        void r.el.offsetWidth;
        r.el.classList.add("moving");
        r.el.style.transform = "";
        (function (el) { setTimeout(function () { el.classList.remove("moving"); }, 750); })(r.el);
      });
    }

    var empty = $("a-empty");
    if (!sum && !empty) {
      empty = document.createElement("p");
      empty.id = "a-empty"; empty.className = "rank-empty";
      empty.textContent = "Aucun vote pour l’instant. Les résultats s’afficheront dès la première voix.";
      box.parentNode.insertBefore(empty, $("a-total"));
    } else if (sum && empty) empty.parentNode.removeChild(empty);

    return sum;
  }

  /* ---------- Rendu principal ---------- */
  function fmtDate(ms) {
    try { return new Date(ms).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).replace(":", " h "); }
    catch (e) { return new Date(ms).toLocaleString(); }
  }

  function render(r) {
    ElectionCommon.start(r);
    var p = ElectionCommon.progress(r), counts = r.counts || {};

    $("a-ring").style.strokeDashoffset = CIRC * (1 - p.pct / 100);
    tween($("a-pct"), p.pct, function (v) { return v + "%"; });
    $("a-text").textContent = p.text;

    tween($("a-voted"), r.voted);
    tween($("a-left"), Math.max(0, r.total - r.voted));
    if (lastVoted !== null && r.voted > lastVoted) {
      var plus = $("a-plus");
      plus.textContent = "+" + (r.voted - lastVoted);
      plus.classList.remove("go"); void plus.offsetWidth; plus.classList.add("go");
      pop($("a-voted"));
    }
    lastVoted = r.voted;

    var sum = renderResults(counts);
    $("a-total").textContent = "Total des voix : " + sum + " · Non-votants : " + (r.total - r.voted);

    /* statut du minuteur */
    var now = r.serverNow || Date.now(), st = $("t-status"), tx = $("t-status-text");
    if (!r.endAt) { st.classList.add("off"); tx.textContent = "Aucun scrutin lancé pour le moment."; }
    else if (r.endAt <= now) { st.classList.add("off"); tx.textContent = "Scrutin clôturé. Les élèves ne peuvent plus voter."; }
    else { st.classList.remove("off"); tx.textContent = "Scrutin en cours. Fin prévue le " + fmtDate(r.endAt) + "."; }

    /* rapport imprimable (balisage simple, indépendant de l'écran) */
    var pr = $("pr-results");
    pr.innerHTML = "";
    CONFIG.CANDIDATES.forEach(function (c) {
      var n = +counts[c.id] || 0, pc = sum ? Math.round(n * 100 / sum) : 0;
      var line = document.createElement("div"), h = document.createElement("div"), b = document.createElement("b"), sp = document.createElement("span"), m = document.createElement("div"), i = document.createElement("i");
      line.className = "resline"; b.textContent = c.name; sp.textContent = n + " voix · " + pc + " %";
      h.appendChild(b); h.appendChild(sp);
      m.className = "meter"; i.style.width = pc + "%"; m.appendChild(i);
      line.appendChild(h); line.appendChild(m); pr.appendChild(line);
    });
    $("pr-title").textContent = CONFIG.TITLE + " — " + CONFIG.SCHOOL;
    $("pr-date").textContent = "Rapport du " + new Date().toLocaleString("fr-FR") + (ElectionCommon.open() ? " (scrutin en cours)" : " (scrutin clôturé)");
    $("pr-total").textContent = $("a-total").textContent;

    var t = new Date(), pad = function (n) { return n < 10 ? "0" + n : n; };
    $("sync-text").textContent = "Mis à jour à " + pad(t.getHours()) + ":" + pad(t.getMinutes()) + ":" + pad(t.getSeconds());
    var sy = document.querySelector(".sync");
    sy.classList.remove("pulse"); void sy.offsetWidth; sy.classList.add("pulse");
    rendered = true;
  }

  function load(manual) {
    if (!manual && document.hidden) return;
    var btn = $("btn-reload");
    if (manual) btn.classList.add("is-loading");
    Backend.adminStats(code, function (r) {
      btn.classList.remove("is-loading");
      if (!r || !r.ok) { if (r && r.error === "code") logout("Code incorrect."); return; }
      render(r);
    });
  }

  /* ---------- Connexion / déconnexion ---------- */
  function shake() {
    var c = $("login"), l = $("lock");
    [c, l].forEach(function (e) { e.classList.remove("rattle"); void e.offsetWidth; });
    l.classList.add("rattle");
    var f = $("code"); f.classList.remove("bad"); void f.offsetWidth; f.classList.add("bad");
  }

  function logout(t) {
    code = ""; lastVoted = null;
    if (timer) clearInterval(timer);
    $("panel").hidden = true; $("panel").classList.remove("panel-in");
    var lg = $("login");
    lg.hidden = false; lg.classList.remove("leaving");
    $("lock").classList.remove("open");
    $("code").value = "";
    msg("login-msg", t ? "err" : "", t || "");
    if (t) shake();
  }

  function enterPanel(r) {
    var lg = $("login"), lk = $("lock");
    lk.classList.add("open");
    later(function () {
      lg.classList.add("leaving");
      later(function () {
        lg.hidden = true;
        var pn = $("panel");
        pn.hidden = false;
        var k = 0;
        for (var i = 0; i < pn.children.length; i++) if (pn.children[i].classList.contains("e-card")) pn.children[i].style.setProperty("--k", k++);
        pn.classList.remove("panel-in"); void pn.offsetWidth; pn.classList.add("panel-in");
        rows = {}; $("a-results").innerHTML = "";
        var e = $("a-empty"); if (e) e.parentNode.removeChild(e);
        render(r);
        timer = setInterval(load, 15000);
        window.scrollTo(0, 0);
      }, 380);
    }, 480);
  }

  $("btn-login").onclick = function () {
    code = $("code").value.trim();
    if (!code) { msg("login-msg", "err", "Saisissez le code administrateur."); shake(); $("code").focus(); return; }
    var b = this;
    b.disabled = true; b.textContent = "Vérification…";
    Backend.adminStats(code, function (r) {
      b.disabled = false; b.innerHTML = loginLabel;
      if (!r || !r.ok) {
        code = "";
        msg("login-msg", "err", r && r.error === "code" ? "Code incorrect." : "Connexion impossible.");
        shake();
        return;
      }
      msg("login-msg", "", "");
      enterPanel(r);
    });
  };
  $("code").onkeydown = function (e) { if ((e.key || "").toLowerCase() === "enter") $("btn-login").click(); };
  $("code").addEventListener("input", function () { this.classList.remove("bad"); });

  $("pw-eye").onclick = function () {
    var c = $("code"), show = c.type === "password";
    c.type = show ? "text" : "password";
    this.setAttribute("aria-pressed", show ? "true" : "false");
    this.setAttribute("aria-label", show ? "Masquer le code" : "Afficher le code");
    c.focus();
  };

  $("btn-logout").onclick = function () { logout(""); toast("Session fermée."); };
  $("btn-reload").onclick = function () { load(true); };

  /* ---------- Durée du scrutin ---------- */
  var pills = document.querySelectorAll(".pill");
  function setDays(d) {
    $("days").value = d;
    for (var i = 0; i < pills.length; i++) {
      var on = pills[i].getAttribute("data-d") === String(d);
      pills[i].setAttribute("aria-checked", on ? "true" : "false");
      pills[i].tabIndex = on ? 0 : -1;
      if (on) $("pill-thumb").style.transform = "translateX(" + (i * 100) + "%)";
    }
  }
  for (var pi = 0; pi < pills.length; pi++) {
    (function (p, i) {
      p.onclick = function () { setDays(p.getAttribute("data-d")); };
      p.onkeydown = function (e) {
        var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
        if (n === null || n < 0 || n >= pills.length) return;
        e.preventDefault(); setDays(pills[n].getAttribute("data-d")); pills[n].focus();
      };
    })(pills[pi], pi);
  }
  setDays(3);

  $("btn-start").onclick = function () {
    var d = $("days").value;
    confirmBox({ title: "Lancer le scrutin ?", text: "Le scrutin durera " + d + " jour" + (d > 1 ? "s" : "") + " à partir de maintenant. Le compte à rebours repart de zéro.", label: "Lancer le scrutin" }, function () {
      Backend.adminSetTimer(code, d, function (r) {
        if (r && r.ok) { msg("timer-msg", "ok", "Minuteur lancé."); toast("Scrutin lancé"); load(true); }
        else if (r && r.error === "code") logout("Code incorrect.");
        else msg("timer-msg", "err", "Opération impossible.");
      });
    });
  };

  $("btn-stop").onclick = function () {
    confirmBox({ danger: true, title: "Clôturer le scrutin ?", text: "Plus aucun élève ne pourra voter. Vous pourrez relancer un scrutin plus tard.", label: "Clôturer" }, function () {
      Backend.adminStop(code, function (r) {
        if (r && r.ok) { msg("timer-msg", "ok", "Scrutin clôturé."); toast("Scrutin clôturé"); load(true); }
        else if (r && r.error === "code") logout("Code incorrect.");
        else msg("timer-msg", "err", "Opération impossible.");
      });
    });
  };

  $("btn-pdf").onclick = function () { window.print(); };

  /* ---------- Outils de démonstration ---------- */
  if (CONFIG.MODE === "demo") {
    $("demo-tools").hidden = false;
    $("btn-reset").onclick = function () {
      confirmBox({ danger: true, title: "Réinitialiser la démo ?", text: "Tous les votes et le minuteur de ce navigateur seront effacés.", label: "Réinitialiser" }, function () {
        Backend.adminResetDemo(code, function (r) {
          if (r && r.ok) { lastVoted = null; msg("demo-msg", "ok", "Démo réinitialisée."); toast("Démo réinitialisée"); load(true); }
          else msg("demo-msg", "err", "Opération impossible.");
        });
      });
    };
  }

  Backend.config(function (r) { if (r && r.ok) ElectionCommon.start(r); });
})();
