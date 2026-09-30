/* ELECTION-COMMON.JS — minuteur (tuiles j / h / min / s) + progression.
   Mode tuiles si #bar-time porte data-seg="1" (page vote),
   sinon texte simple (page admin). ES5. */
var ElectionCommon = (function () {
  var offset = 0, endAt = 0, tick = null, segs = null, lastVals = [];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function buildSegs(t) {
    t.innerHTML = "";
    var names = ["j", "h", "min", "s"], out = [];
    for (var i = 0; i < names.length; i++) {
      var box = document.createElement("div"), b = document.createElement("b"), sm = document.createElement("small");
      box.className = "seg"; b.textContent = "--"; sm.textContent = names[i];
      box.appendChild(b); box.appendChild(sm); t.appendChild(box);
      out.push({ box: box, b: b });
    }
    return out;
  }

  function setSeg(i, val, animate) {
    var s = segs[i], txt = pad(val);
    if (lastVals[i] === txt) return;
    lastVals[i] = txt;
    s.b.textContent = txt;
    if (animate) {
      s.b.classList.remove("flip");
      void s.b.offsetWidth;
      s.b.classList.add("flip");
    }
  }

  function render() {
    var l = document.getElementById("bar-label"), t = document.getElementById("bar-time");
    if (!l || !t) return;
    var wrap = t.closest ? t.closest(".election-count") : null;
    var useSegs = t.getAttribute("data-seg") === "1";
    var left = endAt - (Date.now() + offset);

    if (useSegs && !segs) { segs = buildSegs(t); lastVals = []; }

    function state(cls) {
      if (!wrap) return;
      wrap.classList.toggle("is-urgent", cls === "urgent");
      wrap.classList.toggle("is-off", cls === "off");
    }

    if (!endAt || left <= 0) {
      l.textContent = !endAt ? "Le vote n’a pas encore commencé" : "Le vote est terminé";
      state("off");
      if (useSegs) {
        segs[0].box.classList.add("off");
        setSeg(1, 0, false); setSeg(2, 0, false); setSeg(3, 0, false);
      } else { t.textContent = !endAt ? "—" : "00:00:00"; }
      return;
    }

    var s = Math.floor(left / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600),
        m = Math.floor(s % 3600 / 60), sec = s % 60, urgent = left < 3600000;

    l.textContent = urgent ? "Dernière heure, dépêche-toi !" : "Temps restant pour voter";
    state(urgent ? "urgent" : "on");

    if (useSegs) {
      segs[0].box.classList.toggle("off", d === 0);
      setSeg(0, d, lastVals.length > 0);
      setSeg(1, h, lastVals.length > 0);
      setSeg(2, m, lastVals.length > 0);
      setSeg(3, sec, lastVals.length > 0);
    } else {
      t.textContent = (d ? d + " j " : "") + pad(h) + ":" + pad(m) + ":" + pad(sec);
    }
  }

  return {
    start: function (cfg) {
      offset = (cfg.serverNow || Date.now()) - Date.now();
      endAt = cfg.endAt || 0;
      render();
      if (!tick) tick = setInterval(render, 1000);
    },
    open: function () { return endAt > 0 && (Date.now() + offset) < endAt; },
    progress: function (cfg) {
      var p = cfg.total ? Math.round(cfg.voted * 100 / cfg.total) : 0;
      return { pct: p, text: cfg.voted + " élève" + (cfg.voted > 1 ? "s" : "") + " sur " + cfg.total + " ont voté (" + p + " %)" };
    }
  };
})();
