/* COMMON.JS — minuteur visible sur toutes les pages + petits outils. ES5. */
var Common = (function () {
  var offset = 0, endAt = 0, tick = null;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function render() {
    var label = document.getElementById("bar-label"), time = document.getElementById("bar-time"), bar = document.getElementById("bar");
    if (!bar) return;
    var left = endAt - (Date.now() + offset);
    if (!endAt) { bar.className = "bar bar-off"; label.textContent = "Le vote n’a pas encore commencé"; time.textContent = ""; return; }
    if (left <= 0) { bar.className = "bar bar-off"; label.textContent = "Le vote est terminé"; time.textContent = ""; return; }
    var s = Math.floor(left / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    bar.className = left < 3600000 ? "bar bar-urgent" : "bar";
    label.textContent = left < 3600000 ? "Dernière heure, dépêche-toi !" : "Temps restant pour voter";
    time.textContent = (d > 0 ? d + " j " : "") + pad(h) + ":" + pad(m) + ":" + pad(sec);
  }

  return {
    startTimer: function (cfg) {
      offset = (cfg.serverNow || Date.now()) - Date.now();
      endAt = cfg.endAt || 0;
      render();
      if (!tick) tick = setInterval(render, 1000);
    },
    isOpen: function () { return endAt > 0 && (Date.now() + offset) < endAt; },
    progress: function (cfg) {
      var pct = cfg.total ? Math.round(cfg.voted * 100 / cfg.total) : 0;
      return { pct: pct, text: cfg.voted + " élève" + (cfg.voted > 1 ? "s" : "") + " sur " + cfg.total + " ont voté (" + pct + " %)" };
    },
    clear: function (el) { while (el.firstChild) el.removeChild(el.firstChild); },
    el: function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }
  };
})();
