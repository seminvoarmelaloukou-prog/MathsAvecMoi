// notif-echanges.js - Pastille rouge sur le lien « Échanges » quand il y a du nouveau, comme sur Facebook.
//  - élève : réponses d'un enseignant en privé + nouveaux messages de la discussion de classe
//  - enseignant : messages privés non lus + nouveaux messages dans les discussions de ses classes
//  - admin : messages privés non lus (toutes classes)
// Chargé automatiquement par logo-nav.js. Les pages d'échanges marquent la discussion de classe comme « vue ».
(function () {
  if (window.__cfNotif) return; window.__cfNotif = true;
  var MATIERES = ["Mathématiques", "Français", "Anglais", "PCT", "SVT", "Histoire-Géographie", "Éducation civique", "EPS", "Espagnol", "Allemand", "Philosophie"];
  var TITRE = document.title;

  function type(a) {
    var h = a.getAttribute("href") || "";
    if (/admin-echanges\.html$/.test(h)) return "admin";
    if (/enseignant-echanges\.html$/.test(h)) return "prof";
    return "eleve";
  }
  function vu(uid, c, m) { // dernière visite de la discussion de classe (mémorisée sur cet appareil)
    var k = "cf_fvu_" + uid + "_" + c + "_" + m;
    var t = parseInt(localStorage.getItem(k) || "0", 10);
    if (!t) { t = Date.now(); try { localStorage.setItem(k, String(t)); } catch (e) {} } // 1re fois : on repart de maintenant
    return t;
  }
  function compterForum(db, uid, c, m) {
    return db.ref("forum/" + c + "/" + m).orderByChild("date").startAt(vu(uid, c, m) + 1).limitToLast(50).once("value").then(function (s) {
      var n = 0; s.forEach(function (ch) { if ((ch.val() || {}).auteurUid !== uid) n++; }); return n;
    }).catch(function () { return 0; });
  }
  function somme(l) { return Promise.all(l).then(function (r) { return r.reduce(function (a, b) { return a + b; }, 0); }); }

  function compterEleve(db, uid) {
    return db.ref("eleves/" + uid).once("value").then(function (s) {
      var E = s.val(); if (!E || !E.classe) return 0;
      var c = E.classe;
      return somme(MATIERES.map(function (m) {
        return db.ref("mp_index/" + c + "/" + m + "/" + uid + "/luEleve").once("value").then(function (x) { return x.val() === false ? 1 : 0; }).catch(function () { return 0; });
      }).concat(MATIERES.map(function (m) { return compterForum(db, uid, c, m); })));
    }).catch(function () { return 0; });
  }
  function compterProf(db, uid) {
    return db.ref("enseignants/" + uid).once("value").then(function (s) {
      var P = s.val(); if (!P || P.statut !== "actif") return 0;
      var cl = Object.keys(P.classes || {}).filter(function (k) { return P.classes[k] === true; });
      var ma = Object.keys(P.matieres || {}).filter(function (k) { return P.matieres[k] === true; });
      var t = [];
      cl.forEach(function (c) { ma.forEach(function (m) {
        t.push(db.ref("mp_index/" + c + "/" + m).once("value").then(function (x) {
          var n = 0; x.forEach(function (ch) { if ((ch.val() || {}).luEns === false) n++; }); return n;
        }).catch(function () { return 0; }));
        t.push(compterForum(db, uid, c, m));
      }); });
      return somme(t);
    }).catch(function () { return 0; });
  }
  function compterAdmin(db) {
    return db.ref("mp_index").once("value").then(function (s) {
      var n = 0;
      s.forEach(function (c) { c.forEach(function (m) { m.forEach(function (e) { if ((e.val() || {}).luEns === false) n++; }); }); });
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
    b.textContent = n > 9 ? "9+" : String(n);
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
      if (types.admin) calc.admin = compterAdmin(db);
      var cles = Object.keys(calc);
      Promise.all(cles.map(function (k) { return calc[k]; })).then(function (r) {
        var res = {}; cles.forEach(function (k, i) { res[k] = r[i]; });
        var total = 0;
        liens.forEach(function (a) { var n = res[type(a)] || 0; afficher(a, n); total = Math.max(total, n); });
        document.title = total ? "(" + (total > 9 ? "9+" : total) + ") " + TITRE : TITRE;
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
