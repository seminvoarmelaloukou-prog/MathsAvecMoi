// notif-echanges.js - Pastille rouge sur le lien « Échanges » avec le NOMBRE de messages non lus, comme WhatsApp.
//  - élève : réponses d'un enseignant en privé + nouveaux messages de la discussion de classe
//  - enseignant : messages privés non lus + nouveaux messages dans les discussions de ses classes
//  - admin : conversations avec du nouveau (disparaît dès que la conversation est ouverte, sur cet appareil)
// Chargé automatiquement par logo-nav.js. Les pages d'échanges marquent les messages comme lus
// (dossier « lectures » dans Firebase pour la discussion, champs luEns / luEleve pour le privé).
(function () {
  if (window.__cfNotif) return; window.__cfNotif = true;
  var MATIERES = ["Mathématiques", "Français", "Anglais", "PCT", "SVT", "Histoire-Géographie", "Éducation civique", "EPS", "Espagnol", "Allemand", "Philosophie"];
  var TITRE = document.title;
  var fmt = function (n) { return n > 99 ? "99+" : String(n); };

  function type(a) {
    var h = a.getAttribute("href") || "";
    if (/admin-echanges\.html$/.test(h)) return "admin";
    if (/enseignant-echanges\.html$/.test(h)) return "prof";
    return "eleve";
  }
  // dernier passage dans la discussion de classe : enregistré en ligne (lectures), sinon repère de cet appareil
  function lectures(db, uid) {
    return db.ref("lectures/" + uid).once("value").then(function (s) { return s.val() || {}; }).catch(function () { return {}; });
  }
  function vu(LU, uid, c, m) {
    var t = LU[c] && LU[c][m] && LU[c][m].forum;
    if (typeof t === "number") return t;
    var k = "cf_fvu_" + uid + "_" + c + "_" + m;
    try { t = parseInt(localStorage.getItem(k) || "0", 10); } catch (e) { t = 0; }
    if (!t) { t = Date.now(); try { localStorage.setItem(k, String(t)); } catch (e) {} } // 1re fois : on repart de maintenant
    return t;
  }
  function compterForum(db, LU, uid, c, m) {
    return db.ref("forum/" + c + "/" + m).orderByChild("date").startAt(vu(LU, uid, c, m) + 1).limitToLast(100).once("value").then(function (s) {
      var n = 0; s.forEach(function (ch) { if ((ch.val() || {}).auteurUid !== uid) n++; }); return n;
    }).catch(function () { return 0; });
  }
  function somme(l) { return Promise.all(l).then(function (r) { return r.reduce(function (a, b) { return a + b; }, 0); }); }
  var nbEleve = function (v) { return (v && v.luEleve === false) ? (v.nonLusEleve > 0 ? v.nonLusEleve : 1) : 0; };
  var nbEns = function (v) { return (v && v.luEns === false) ? (v.nonLusEns > 0 ? v.nonLusEns : 1) : 0; };

  function compterEleve(db, uid) {
    return db.ref("eleves/" + uid).once("value").then(function (s) {
      var E = s.val(); if (!E || !E.classe) return 0;
      var c = E.classe;
      return lectures(db, uid).then(function (LU) {
        return somme(MATIERES.map(function (m) {
          return db.ref("mp_index/" + c + "/" + m + "/" + uid).once("value").then(function (x) { return nbEleve(x.val()); }).catch(function () { return 0; });
        }).concat(MATIERES.map(function (m) { return compterForum(db, LU, uid, c, m); })));
      });
    }).catch(function () { return 0; });
  }
  function compterProf(db, uid) {
    return db.ref("enseignants/" + uid).once("value").then(function (s) {
      var P = s.val(); if (!P || P.statut !== "actif") return 0;
      var cl = Object.keys(P.classes || {}).filter(function (k) { return P.classes[k] === true; });
      var ma = Object.keys(P.matieres || {}).filter(function (k) { return P.matieres[k] === true; });
      return lectures(db, uid).then(function (LU) {
        var t = [];
        cl.forEach(function (c) { ma.forEach(function (m) {
          t.push(db.ref("mp_index/" + c + "/" + m).once("value").then(function (x) {
            var n = 0; x.forEach(function (ch) { n += nbEns(ch.val()); }); return n;
          }).catch(function () { return 0; }));
          t.push(compterForum(db, LU, uid, c, m));
        }); });
        return somme(t);
      });
    }).catch(function () { return 0; });
  }
  // admin : mêmes repères que admin-echanges.html (mémorisés sur cet appareil)
  function compterAdmin(db, uid) {
    return db.ref("mp_index").once("value").then(function (s) {
      var base = 0;
      try { base = parseInt(localStorage.getItem("cf_adm_base_" + uid) || "0", 10); if (!base) { base = Date.now(); localStorage.setItem("cf_adm_base_" + uid, String(base)); } } catch (e) {}
      var n = 0;
      s.forEach(function (c) { c.forEach(function (m) { m.forEach(function (e) {
        var vuT = 0; try { vuT = parseInt(localStorage.getItem("cf_adm_vu_" + uid + "_" + c.key + "_" + m.key + "_" + e.key) || "0", 10); } catch (x) {}
        if (((e.val() || {}).date || 0) > Math.max(base, vuT)) n++;
      }); }); });
      return n;
    }).catch(function () { return 0; });
  }

  function afficher(a, n) {
    var b = a.querySelector(".cf-badge");
    if (!n) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement("span"); b.className = "cf-badge";
      b.style.cssText = "background:#e74c3c;color:#fff;border-radius:11px;min-width:20px;padding:1px 7px;font-size:12px;font-weight:bold;margin-left:6px;display:inline-block;text-align:center;line-height:18px";
      a.appendChild(b);
    }
    b.textContent = fmt(n);
  }

  function demarrer() {
    var liens = Array.prototype.slice.call(document.querySelectorAll('a[href$="echanges.html"]'));
    if (!liens.length) return;
    function actualiser(user) {
      var db = firebase.database(), uid = user.uid, types = {};
      liens.forEach(function (a) { types[type(a)] = true; });
      var calc = {};
      if (types.eleve) calc.eleve = compterEleve(db, uid);
      if (types.prof) calc.prof = compterProf(db, uid);
      if (types.admin) calc.admin = compterAdmin(db, uid);
      var cles = Object.keys(calc);
      Promise.all(cles.map(function (k) { return calc[k]; })).then(function (r) {
        var res = {}; cles.forEach(function (k, i) { res[k] = r[i]; });
        var total = 0;
        liens.forEach(function (a) { var n = res[type(a)] || 0; afficher(a, n); total = Math.max(total, n); });
        document.title = total ? "(" + fmt(total) + ") " + TITRE : TITRE;
      });
    }
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) return;
      actualiser(user);
      setInterval(function () { if (!document.hidden) actualiser(user); }, 60000);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) actualiser(user); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
