/**
 * VOTE EN LIGNE — Google Apps Script — CS AMANI
 *
 * Registre:
 * A Matricule
 * B Nom
 * C Postnom
 * D Prénom
 * E Sexe
 * F Date de naissance
 * G Niveau
 * H Classe
 * I Section
 *
 * Pour l'identification, le site envoie:
 * - matricule
 * - date de naissance
 * - classe / option, par ex. "7ème Éducation des Bases"
 *
 * Le backend reconstruit cette valeur à partir des colonnes H + I.
 */

var ADMIN_CODE = "CHANGE-MOI";
var SPREADSHEET_ID = "1RIQAbMHS5ITWWv7KgRsC7giMQyU1FKcpO_aGlOgKALc";
var SH_STUDENTS = "Élèves 2026-2027";
var SH_SIGN = "Émargement";
var SH_URN = "Urne";
var SH_CONF = "Config";
var CANDIDATE_IDS = ["c1", "c2", "c3"];

function spreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function sheet_(n) {
  var ss = spreadsheet_();
  return ss.getSheetByName(n) || ss.insertSheet(n);
}

function json_(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function norm_(v) {
  return String(v || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function compact_(v) {
  return norm_(v).replace(/\s+/g, "");
}

/* Convertit une date Google Sheets ou une date texte vers YYYY-MM-DD. */
function dateKey_(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return Utilities.formatDate(
      v,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );
  }

  var s = String(v || "").trim();

  /* 19/06/2013, 19-06-2013, 19.06.2013 */
  var m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (m) {
    return m[3] + "-" +
      String(m[2]).padStart(2, "0") + "-" +
      String(m[1]).padStart(2, "0");
  }

  /* 2013-06-19 */
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    return m[1] + "-" +
      String(m[2]).padStart(2, "0") + "-" +
      String(m[3]).padStart(2, "0");
  }

  return s.slice(0, 10);
}

/* Valeur exacte attendue par le formulaire: "Classe Section". */
function classKey_(classe, section) {
  var c = String(classe || "").trim();
  var s = String(section || "").trim();

  if (s) return norm_(c + " " + s);
  return norm_(c);
}

function endAt_() {
  var v = sheet_(SH_CONF).getRange("B1").getValue();
  return v ? Number(v) : 0;
}

function isOpen_() {
  var e = endAt_();
  return e > 0 && Date.now() < e;
}

function total_() {
  var s = sheet_(SH_STUDENTS);
  return Math.max(0, s.getLastRow() - 1);
}

function voted_() {
  var s = sheet_(SH_SIGN);
  var last = s.getLastRow();
  if (last <= 1) return 0;

  /* Ligne 1 = en-têtes. */
  return last - 1;
}

function findStudent_(m) {
  var s = sheet_(SH_STUDENTS);
  var last = s.getLastRow();

  if (last < 2) return null;

  /*
   * Colonnes A:I:
   * A matricule
   * B nom
   * C postnom
   * D prénom
   * E sexe
   * F naissance
   * G niveau
   * H classe
   * I section
   */
  var v = s.getRange(2, 1, last - 1, 9).getValues();

  for (var i = 0; i < v.length; i++) {
    if (compact_(v[i][0]) !== compact_(m)) continue;

    var fullName = (v[i][3] + " " + v[i][1])
      .replace(/^\s+|\s+$/g, "");

    return {
      name: fullName,
      birthdate: dateKey_(v[i][5]),
      studentClass: classKey_(v[i][7], v[i][8])
    };
  }

  return null;
}

function hasVoted_(m) {
  var s = sheet_(SH_SIGN);
  var last = s.getLastRow();

  if (last < 2) return false;

  var v = s.getRange(2, 1, last - 1, 1).getValues();

  for (var i = 0; i < v.length; i++) {
    if (compact_(v[i][0]) === compact_(m)) return true;
  }

  return false;
}

function counts_() {
  var s = sheet_(SH_URN);
  var last = s.getLastRow();
  var out = {};
  var i;

  for (i = 0; i < CANDIDATE_IDS.length; i++) {
    out[CANDIDATE_IDS[i]] = 0;
  }

  if (last < 2) return out;

  var v = s.getRange(2, 1, last - 1, 1).getValues();

  for (i = 0; i < v.length; i++) {
    if (out.hasOwnProperty(v[i][0])) {
      out[v[i][0]]++;
    }
  }

  return out;
}

function base_() {
  return {
    ok: true,
    serverNow: Date.now(),
    endAt: endAt_(),
    open: isOpen_(),
    total: total_(),
    voted: voted_()
  };
}

/* Retire les accents et met en minuscules (recherche de nom). */
function fold_(v) {
  var s = String(v || "");
  try { s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
  return s.toLowerCase();
}

/*
 * "Matricule oublié ?" : suggestions par nom, LIMITÉES à la classe choisie
 * par l'élève (la classe n'est donc jamais révélée). 2 lettres minimum,
 * 5 résultats maximum, on ne renvoie que le nom et le matricule.
 */
function suggest_(q, studentClass) {
  var cl = norm_(studentClass);
  var t = fold_(q).split(/\s+/).filter(function (x) { return x; });
  var out = [];

  if (!cl || fold_(q).replace(/\s/g, "").length < 2) return out;

  var s = sheet_(SH_STUDENTS);
  var last = s.getLastRow();
  if (last < 2) return out;

  var v = s.getRange(2, 1, last - 1, 9).getValues();

  for (var i = 0; i < v.length && out.length < 5; i++) {
    if (classKey_(v[i][7], v[i][8]) !== cl) continue;

    var h = fold_(v[i][1] + " " + v[i][2] + " " + v[i][3]).split(/\s+/);
    var ok = true;

    for (var j = 0; j < t.length && ok; j++) {
      var f = false;
      for (var k = 0; k < h.length; k++) {
        if (h[k].indexOf(t[j]) === 0) { f = true; break; }
      }
      ok = f;
    }

    if (ok) {
      out.push({
        matricule: String(v[i][0]).trim(),
        name: (String(v[i][3]) + " " + String(v[i][1])).replace(/^\s+|\s+$/g, "")
      });
    }
  }

  return out;
}

function doGet(e) {
  var a = e.parameter.action;

  if (a === "health") {
    return json_({ok:true, spreadsheetId:SPREADSHEET_ID, sheet:SH_STUDENTS, total:total_()});
  }

  if (a === "config") {
    return json_(base_());
  }

  if (a === "suggest") {
    return json_({
      ok: true,
      results: suggest_(e.parameter.q, e.parameter.studentClass)
    });
  }

  if (a === "check") {
    var m = compact_(e.parameter.matricule);
    var st = findStudent_(m);

    var birthdate = dateKey_(e.parameter.birthdate);
    var studentClass = norm_(e.parameter.studentClass);

    var identityOk =
      !!st &&
      st.birthdate === birthdate &&
      st.studentClass === studentClass;

    var status =
      !isOpen_()
        ? "closed"
        : !identityOk
          ? "unknown"
          : hasVoted_(m)
            ? "already"
            : "ok";

    return json_({
      ok: true,
      status: status,
      name: st ? st.name : ""
    });
  }

  return json_({
    ok: false,
    error: "action"
  });
}

function doPost(e) {
  var p;

  try {
    p = JSON.parse(e.postData.contents);
  } catch (x) {
    return json_({
      ok: false,
      error: "json"
    });
  }

  if (p.action === "vote") {
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);

    try {
      var m = compact_(p.matricule);
      var st = findStudent_(m);
      var birthdate = dateKey_(p.birthdate);
      var studentClass = norm_(p.studentClass);

      if (!isOpen_()) {
        return json_({
          ok: true,
          status: "closed"
        });
      }

      if (
        !st ||
        st.birthdate !== birthdate ||
        st.studentClass !== studentClass
      ) {
        return json_({
          ok: true,
          status: "unknown"
        });
      }

      if (CANDIDATE_IDS.indexOf(p.candidateId) < 0) {
        return json_({
          ok: false,
          error: "candidate"
        });
      }

      if (hasVoted_(m)) {
        return json_({
          ok: true,
          status: "already"
        });
      }

      /*
       * Secret du vote:
       * Émargement = matricule + heure
       * Urne = candidat + heure
       * aucune ligne ne relie directement les deux.
       */
      sheet_(SH_SIGN).appendRow([m, new Date()]);
      sheet_(SH_URN).appendRow([p.candidateId, new Date()]);

      return json_({
        ok: true,
        status: "recorded"
      });

    } finally {
      lock.releaseLock();
    }
  }

  if (String(p.action).indexOf("admin_") === 0) {
    if (p.code !== ADMIN_CODE) {
      return json_({
        ok: false,
        error: "code"
      });
    }

    if (p.action === "admin_setTimer") {
      var days = Math.min(
        3,
        Math.max(1, Number(p.days) || 1)
      );

      sheet_(SH_CONF)
        .getRange("A1:B1")
        .setValues([
          ["endAt", Date.now() + days * 86400000]
        ]);

    } else if (p.action === "admin_stop") {
      sheet_(SH_CONF)
        .getRange("A1:B1")
        .setValues([
          ["endAt", Date.now()]
        ]);
    }

    var r = base_();
    r.counts = counts_();

    return json_(r);
  }

  return json_({
    ok: false,
    error: "action"
  });
}
