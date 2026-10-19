// etat-page.js - Après un rechargement (actualiser la page), retrouve l'état où on était :
// listes déroulantes (classe, semestre, matière...), boutons de chargement déjà utilisés et position de défilement.
// Ne s'active QUE lors d'un rechargement de la page, pas quand on arrive depuis un lien.
(function () {
  try {
    var nav = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
    var recharge = nav.type === "reload" || nav.type === "back_forward";
    var cle = "cf_etat:" + location.pathname;
    var etat = { sel: {}, act: [], y: 0 };
    try { etat = Object.assign(etat, JSON.parse(sessionStorage.getItem(cle) || "{}")); } catch (e) {}
    function sauver() { try { sessionStorage.setItem(cle, JSON.stringify(etat)); } catch (e) {} }

    // ----- mémorisation (toujours) -----
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.tagName === "SELECT" && t.id && !t.hasAttribute("data-no-restore")) { etat.sel[t.id] = t.value; sauver(); }
    });
    document.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("[data-restaurer]") : null;
      if (b && b.id && etat.act.indexOf(b.id) === -1) { etat.act.push(b.id); sauver(); }
    });
    var t0 = null;
    window.addEventListener("scroll", function () {
      if (t0) return;
      t0 = setTimeout(function () { t0 = null; etat.y = window.scrollY || 0; sauver(); }, 300);
    }, { passive: true });

    if (!recharge) { etat.sel = {}; etat.act = []; etat.y = 0; sauver(); return; } // arrivée normale : on repart de zéro

    // ----- restauration (rechargement uniquement) -----
    function demarrer() {
      if (document.querySelector("input[type=password]")) return; // pas sur les pages de connexion
      var attente = 0;
      Object.keys(etat.sel).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var val = etat.sel[id];
        function appliquer() {
          var ok = Array.prototype.some.call(el.options, function (o) { return o.value === val; });
          if (!ok) return false;
          el.value = val; el.dispatchEvent(new Event("change", { bubbles: true })); return true;
        }
        if (!appliquer()) {
          attente++;
          var obs = new MutationObserver(function () { if (appliquer()) { obs.disconnect(); attente--; } });
          obs.observe(el, { childList: true });
          setTimeout(function () { obs.disconnect(); }, 15000);
        }
      });

      var restants = etat.act.slice(), essais = 0;
      var timer = setInterval(function () {
        essais++;
        if (!attente && restants.length) {
          var el = document.getElementById(restants[0]);
          if (el && el.offsetParent !== null && !el.disabled) { restants.shift(); el.click(); }
        }
        if ((!restants.length && !attente) || essais > 50) {
          clearInterval(timer);
          var n = 0, y = etat.y || 0;
          if (y > 0) { var t = setInterval(function () { window.scrollTo(0, y); if (++n > 10) clearInterval(t); }, 300); }
        }
      }, 250);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
  } catch (e) {}
})();
