/* VOTE.JS — parcours de vote animé. ES5, sans dépendance. */
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var state = { matricule: "", birthdate: "", studentClass: "", candidate: null };
  var steps = ["id", "choice", "recap", "final", "done", "already", "closed"];
  var stepIndex = { id: 0, choice: 1, recap: 2, final: 3, done: 4 };
  var current = "id";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Étapes + stepper ---------- */
  function paintStepper(name) {
    var st = $("stepper");
    if (!st) return;
    var idx = stepIndex[name];
    if (idx === undefined) { st.hidden = true; return; }
    st.hidden = false;
    var lis = st.querySelectorAll("li"), labels = ["Identification", "Choix", "Récapitulatif", "Validation"];
    for (var i = 0; i < lis.length; i++) {
      lis[i].classList.toggle("done", i < idx || name === "done");
      lis[i].classList.toggle("current", i === idx && name !== "done");
    }
    var now = $("stepper-now");
    if (now) now.textContent = name === "done" ? "Vote enregistré" : "Étape " + (idx + 1) + " sur 4 — " + labels[idx];
  }

  function show(name) {
    var prev = stepIndex[current], next = stepIndex[name];
    var back = prev !== undefined && next !== undefined && next < prev;
    steps.forEach(function (x) {
      var el = $("step-" + x);
      if (!el) return;
      el.classList.remove("enter-fwd", "enter-back");
      el.hidden = x !== name;
    });
    var el = $("step-" + name);
    if (el) {
      el.classList.add("in");
      void el.offsetWidth;
      el.classList.add(back ? "enter-back" : "enter-fwd");
    }
    current = name;
    paintStepper(name);
    var st = $("stepper");
    var target = (st && !st.hidden) ? st : el;
    if (target && target.scrollIntoView) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function message(id, cls, title, text) {
    var b = $(id);
    if (!b) return;
    b.innerHTML = "";
    if (!title) return;
    var d = document.createElement("div");
    d.className = "msg " + cls;
    d.setAttribute("role", cls === "err" ? "alert" : "status");
    var s = document.createElement("strong");
    s.textContent = title;
    d.appendChild(s);
    if (text) { d.appendChild(document.createElement("br")); d.appendChild(document.createTextNode(text)); }
    b.appendChild(d);
  }

  function cand(id) {
    for (var i = 0; i < CONFIG.CANDIDATES.length; i++) if (CONFIG.CANDIDATES[i].id === id) return CONFIG.CANDIDATES[i];
  }

  /* ---------- Compte animé pour la participation ---------- */
  var shown = { pct: 0 };
  function setProgress(p) {
    ["pp", "dp"].forEach(function (k) {
      var f = $(k + "-fill"), t = $(k + "-text");
      if (f) f.style.width = p.pct + "%";
      if (t) t.textContent = p.text;
    });
    shown.pct = p.pct;
  }

  function update() {
    Backend.config(function (r) {
      if (!r || !r.ok) return;
      ElectionCommon.start(r);
      setProgress(ElectionCommon.progress(r));
    });
  }

  /* ---------- Candidats ---------- */
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  function choose(card, id) {
    var all = document.querySelectorAll(".candidate");
    for (var i = 0; i < all.length; i++) {
      all[i].classList.remove("selected");
      all[i].setAttribute("aria-checked", "false");
      all[i].querySelector(".choice").textContent = "Sélectionner";
    }
    card.classList.add("selected");
    card.setAttribute("aria-checked", "true");
    card.querySelector(".choice").textContent = "Sélectionné";
    $("ballot").classList.add("has-pick");
    state.candidate = id;
    message("choice-msg", "", "");
  }

  function render() {
    var b = $("ballot");
    b.innerHTML = "";
    b.classList.remove("has-pick");
    b.setAttribute("role", "radiogroup");
    b.setAttribute("aria-label", "Candidats");
    CONFIG.CANDIDATES.forEach(function (c, i) {
      var d = document.createElement("article");
      d.className = "candidate";
      d.style.setProperty("--i", i);
      d.tabIndex = 0;
      d.setAttribute("role", "radio");
      d.setAttribute("aria-checked", "false");

      var img = document.createElement("img");
      img.src = c.photo; img.alt = "Photo de " + c.name;
      var pick = document.createElement("span");
      pick.className = "pick"; pick.innerHTML = TICK;
      var body = document.createElement("div");
      body.className = "candidate-body";
      var h = document.createElement("h3"); h.textContent = c.name;
      var p = document.createElement("p"); p.textContent = c.slogan;
      var ch = document.createElement("div"); ch.className = "choice"; ch.textContent = "Sélectionner";
      body.appendChild(h); body.appendChild(p); body.appendChild(ch);
      d.appendChild(img); d.appendChild(pick); d.appendChild(body);

      d.addEventListener("click", function () { choose(d, c.id); });
      d.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(d, c.id); }
      });
      /* lueur qui suit le doigt / la souris */
      d.addEventListener("pointermove", function (e) {
        var r = d.getBoundingClientRect();
        d.style.setProperty("--mx", (e.clientX - r.left) + "px");
        d.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      b.appendChild(d);
    });
  }

  /* ---------- Ondulation sur les boutons ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".page-vote .btn") : null;
    if (!btn || reduce) return;
    var r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
    var rp = document.createElement("span");
    rp.className = "ripple";
    rp.style.width = rp.style.height = size + "px";
    rp.style.left = (e.clientX - r.left - size / 2) + "px";
    rp.style.top = (e.clientY - r.top - size / 2) + "px";
    btn.appendChild(rp);
    setTimeout(function () { if (rp.parentNode) rp.parentNode.removeChild(rp); }, 700);
  });

  /* ---------- Confettis ---------- */
  function confetti() {
    var cv = $("confetti");
    if (!cv || reduce || !cv.getContext) return;
    var ctx = cv.getContext("2d"), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size();
    var colors = ["#1f7a41", "#2f9e5a", "#8fd1a4", "#cfe2d5", "#175a34", "#ead6b2"];
    var n = W < 400 ? 70 : 140, parts = [], i;
    for (i = 0; i < n; i++) {
      var a = Math.random() * Math.PI - Math.PI, sp = 6 + Math.random() * 9;
      parts.push({
        x: W / 2, y: H * 0.38,
        vx: Math.cos(a) * sp * (0.6 + Math.random() * 0.8), vy: Math.sin(a) * sp - 3,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 5,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.35,
        c: colors[(Math.random() * colors.length) | 0], life: 0
      });
    }
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var el = t - t0;
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      for (var k = 0; k < parts.length; k++) {
        var p = parts[k];
        p.vy += 0.28; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        var fade = el > 2200 ? Math.max(0, 1 - (el - 2200) / 900) : 1;
        if (p.y < H + 20 && fade > 0) alive = true;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive && el < 3200) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Champs : erreurs visibles ---------- */
  function flagBad(ids) {
    ids.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.classList.remove("bad");
      void el.offsetWidth;
      el.classList.add("bad");
    });
  }
  ["matricule", "birthdate", "student-class"].forEach(function (id) {
    var el = $(id);
    if (!el) return;
    var clear = function () { el.classList.remove("bad"); };
    el.addEventListener("input", clear);
    el.addEventListener("change", clear);
  });
  $("matricule").addEventListener("keydown", function (e) { if (e.key === "Enter") $("btn-check").click(); });


  /* ---------- Matricule oublié : recherche par nom ---------- */
  var fTimer = null, fSeq = 0;
  var HINT = "Choisissez votre classe ci-dessus, puis tapez votre nom.";

  function fHint(t) { $("forgot-hint").textContent = t; }
  function fClear() { $("forgot-list").innerHTML = ""; }

  function fRender(list) {
    var ul = $("forgot-list");
    ul.innerHTML = "";
    if (!list.length) {
      var e = document.createElement("li");
      e.className = "sug-empty";
      e.textContent = "Aucun élève trouvé dans cette classe. Vérifiez l’orthographe ou adressez-vous à l’administration.";
      ul.appendChild(e);
      return;
    }
    fHint("Touchez votre nom pour remplir le matricule.");
    list.forEach(function (x, i) {
      var li = document.createElement("li"), b = document.createElement("button");
      var n = document.createElement("span"), m = document.createElement("span");
      li.style.setProperty("--i", i);
      b.type = "button"; b.className = "sug";
      n.className = "sug-name"; n.textContent = x.name;
      m.className = "sug-mat"; m.textContent = x.matricule;
      b.appendChild(n); b.appendChild(m);
      b.onclick = function () { pickMatricule(x.matricule); };
      li.appendChild(b); ul.appendChild(li);
    });
  }

  function pickMatricule(m) {
    var f = $("matricule");
    f.value = m;
    f.classList.remove("bad", "filled");
    void f.offsetWidth;
    f.classList.add("filled");
    message("id-msg", "", "");
    closeForgot();
    setTimeout(function () { $("birthdate").focus(); }, 60);
  }

  function fSearch() {
    var q = $("forgot-name").value.trim(), cl = $("student-class").value;
    fClear();
    if (!cl) { fHint("Choisissez d’abord votre classe / option dans le formulaire."); return; }
    if (q.replace(/\s/g, "").length < 2) { fHint(HINT.replace("Choisissez votre classe ci-dessus, puis tapez", "Tapez")); return; }
    var my = ++fSeq;
    fHint("Recherche…");
    Backend.suggest(q, cl, function (r) {
      if (my !== fSeq) return;
      if (!r || !r.ok) { fHint("Recherche impossible pour le moment. Réessayez."); return; }
      fRender(r.results || []);
    });
  }

  function openForgot() {
    var p = $("forgot-panel"), t = $("forgot-toggle");
    p.hidden = false;
    t.setAttribute("aria-expanded", "true");
    p.style.animation = "none"; void p.offsetWidth; p.style.animation = "";
    if (!$("student-class").value) {
      fHint("Choisissez d’abord votre classe / option dans le formulaire.");
      flagBad(["student-class"]);
    } else { fSearch(); $("forgot-name").focus(); }
  }
  function closeForgot() {
    $("forgot-panel").hidden = true;
    $("forgot-toggle").setAttribute("aria-expanded", "false");
    $("forgot-name").value = ""; fClear(); fHint(HINT);
  }

  $("forgot-toggle").onclick = function () { if ($("forgot-panel").hidden) openForgot(); else closeForgot(); };
  $("forgot-name").addEventListener("input", function () { clearTimeout(fTimer); fTimer = setTimeout(fSearch, 250); });
  $("student-class").addEventListener("change", function () { if (!$("forgot-panel").hidden) { fSearch(); if ($("student-class").value) $("forgot-name").focus(); } });
  $("forgot-name").addEventListener("keydown", function (e) { if (e.key === "Escape") { closeForgot(); $("forgot-toggle").focus(); } });

  /* ---------- Actions ---------- */
  var checkLabel = $("btn-check").innerHTML;

  $("btn-check").onclick = function () {
    var m = Backend.normalize($("matricule").value), b = $("birthdate").value, c = $("student-class").value.trim(), btn = this;
    var bad = [];
    if (!m) bad.push("matricule");
    if (!b) bad.push("birthdate");
    if (!c) bad.push("student-class");
    if (bad.length) {
      flagBad(bad);
      message("id-msg", "err", "Informations incomplètes", "Les trois informations sont nécessaires.");
      $(bad[0]).focus();
      return;
    }
    if (!ElectionCommon.open()) { show("closed"); return; }

    btn.disabled = true;
    btn.textContent = "Vérification…";
    Backend.check(m, b, c, function (r) {
      btn.disabled = false;
      btn.innerHTML = checkLabel;
      if (!r || !r.ok) { message("id-msg", "err", "Erreur de connexion", "Réessayez dans quelques instants."); return; }
      if (r.status === "already") { show("already"); return; }
      if (r.status === "closed") { show("closed"); return; }
      if (r.status !== "ok") {
        flagBad(["matricule", "birthdate", "student-class"]);
        message("id-msg", "err", "Informations non reconnues", "Elles ne correspondent pas au registre officiel de l’école.");
        return;
      }
      message("id-msg", "", "");
      state.matricule = m; state.birthdate = b; state.studentClass = c; state.candidate = null;
      render();
      $("who").textContent = "Inscription vérifiée · " + r.name;
      show("choice");
    });
  };

  $("btn-submit").onclick = function () {
    if (!state.candidate) {
      message("choice-msg", "err", "Choisissez un candidat", "Sélectionnez une candidature avant de continuer.");
      return;
    }
    var c = cand(state.candidate), rc = $("recap");
    rc.innerHTML = "";
    var img = document.createElement("img"); img.src = c.photo; img.alt = "";
    var box = document.createElement("div");
    var h = document.createElement("h3"); h.textContent = c.name;
    var p = document.createElement("p"); p.className = "desc"; p.textContent = c.slogan;
    box.appendChild(h); box.appendChild(p);
    rc.appendChild(img); rc.appendChild(box);
    show("recap");
  };

  $("btn-notme").onclick = function () { state.candidate = null; show("id"); };
  $("btn-recap-back").onclick = function () { show("choice"); };
  $("btn-recap-ok").onclick = function () { $("final-name").textContent = cand(state.candidate).name; show("final"); };
  $("btn-final-cancel").onclick = function () { show("choice"); };

  $("btn-final-ok").onclick = function () {
    var b = this;
    b.disabled = true;
    b.textContent = "Enregistrement…";
    Backend.vote(state.matricule, state.candidate, state.birthdate, state.studentClass, function (r) {
      b.disabled = false;
      b.textContent = "Valider définitivement mon vote";
      if (!r || !r.ok) { message("final-msg", "err", "Échec de l’enregistrement", "Réessayez sans fermer la page."); return; }
      if (r.status === "recorded") { update(); show("done"); setTimeout(confetti, 350); }
      else if (r.status === "already") show("already");
      else if (r.status === "closed") show("closed");
      else message("final-msg", "err", "Vote non enregistré", "Vérification refusée.");
    });
  };

  $("btn-refresh").onclick = function () {
    var b = this;
    b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
    update();
  };

  paintStepper("id");
  update();
  setInterval(update, 30000);
})();
