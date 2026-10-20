// etat-page.js - Après un rechargement (actualiser la page), retrouve l'état où on était :
//  - listes déroulantes (classe, semestre, matière...) hors formulaires et fenêtres,
//  - onglets (éléments dans un bloc class="tabs" ou role="tab"),
//  - champs de recherche marqués data-garder,
//  - boutons de chargement marqués data-restaurer (rejoués automatiquement),
//  - sections repliables (séquences et SA des cours : class="toggle-header" ouverts avec la classe "ouvert"),
//  - position de défilement.
// Ne s'active QUE lors d'un rechargement de la page, pas quand on arrive depuis un lien.
(function () {
  try {
    var nav = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || {};
    var recharge = nav.type === "reload" || nav.type === "back_forward";
    var cle = "cf_etat:" + location.pathname;
    var etat = { sel: {}, tabs: {}, txt: {}, act: [], repli: [], y: 0 };
    try { etat = Object.assign(etat, JSON.parse(sessionStorage.getItem(cle) || "{}")); } catch (e) {}
    function sauver() { try { sessionStorage.setItem(cle, JSON.stringify(etat)); } catch (e) {} }

    var TAB = ".tabs button, .tabs [role=tab], [role=tab]";
    var libre = {}; // listes modifiées à la main par l'utilisateur : on arrête de les restaurer
    function boites() { return Array.prototype.slice.call(document.querySelectorAll(".tabs")); }
    function boutons(box) { return Array.prototype.slice.call(box.querySelectorAll("button, [role=tab]")); }
    function horsFormulaire(el) { return !el.closest("form, .modal, [id*=modal], [class*=modal]"); }
    function entetes() { return Array.prototype.slice.call(document.querySelectorAll(".toggle-header")); }
    function cleEntete(h, i) { return i + "|" + (h.textContent || "").trim().slice(0, 40); }
    function memoriserRepli() {
      var ouverts = [];
      entetes().forEach(function (h, i) { if (h.classList.contains("ouvert")) ouverts.push(cleEntete(h, i)); });
      etat.repli = ouverts; sauver();
    }

    // ----- mémorisation (toujours) -----
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.tagName === "SELECT" && t.id && !t.hasAttribute("data-no-restore") && horsFormulaire(t)) {
        if (e.isTrusted) libre[t.id] = true;
        etat.sel[t.id] = t.value; sauver();
      }
    });
    document.addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.id && t.hasAttribute && t.hasAttribute("data-garder")) { etat.txt[t.id] = t.value; sauver(); }
    });
    document.addEventListener("click", function (e) {
      var c = e.target && e.target.closest ? e.target : null; if (!c) return;
      if (c.closest(".toggle-header")) memoriserRepli(); // le clic a déjà ouvert ou fermé la section
      var b = c.closest("[data-restaurer]");
      if (b && b.id && etat.act.indexOf(b.id) === -1) { etat.act.push(b.id); sauver(); }
      var tab = c.closest(TAB);
      if (tab) {
        var box = tab.closest(".tabs") || tab.parentNode, bs = boites(), ci = bs.indexOf(box);
        if (ci >= 0) { var bi = boutons(box).indexOf(tab); if (bi >= 0) { etat.tabs[ci] = bi; sauver(); } }
      }
    });
    var t0 = null;
    window.addEventListener("scroll", function () {
      if (t0) return;
      t0 = setTimeout(function () { t0 = null; etat.y = window.scrollY || 0; sauver(); }, 300);
    }, { passive: true });

    if (!recharge) { etat = { sel: {}, tabs: {}, txt: {}, act: [], repli: [], y: 0 }; sauver(); return; } // arrivée normale : on repart de zéro

    // ----- restauration (rechargement uniquement) -----
    function demarrer() {
      if (document.querySelector("input[type=password]")) return; // pas sur les pages de connexion

      // listes déroulantes : on réapplique la valeur tant que la page remplit ou reconstruit la liste
      Object.keys(etat.sel).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var val = etat.sel[id];
        function appliquer() {
          if (el.value === val) return true;
          var ok = Array.prototype.some.call(el.options, function (o) { return o.value === val; });
          if (!ok) return false;
          el.value = val; el.dispatchEvent(new Event("change", { bubbles: true })); return true;
        }
        appliquer();
        var obs = new MutationObserver(function () { if (libre[id]) { obs.disconnect(); return; } appliquer(); });
        obs.observe(el, { childList: true });
        setTimeout(function () { obs.disconnect(); }, 20000);
      });

      Object.keys(etat.txt).forEach(function (id) {
        var el = document.getElementById(id);
        if (el && etat.txt[id]) { el.value = etat.txt[id]; el.dispatchEvent(new Event("input", { bubbles: true })); }
      });

      // sections repliables (cours, vidéos) : on rouvre celles qui étaient ouvertes
      if (etat.repli && etat.repli.length) {
        var restantes = etat.repli.slice();
        var rouvrir = function () {
          restantes = restantes.filter(function (k) {
            var i = parseInt(k, 10), h = entetes()[i];
            if (!h || cleEntete(h, i) !== k) return true; // pas encore affichée : on réessaiera
            var contenu = h.nextElementSibling;
            h.classList.add("ouvert");
            if (contenu && contenu.classList.contains("toggle-content")) contenu.classList.add("ouvert");
            return false;
          });
          return !restantes.length;
        };
        if (!rouvrir()) {
          var obs2 = new MutationObserver(function () { if (rouvrir()) obs2.disconnect(); });
          obs2.observe(document.body, { childList: true, subtree: true });
          setTimeout(function () { obs2.disconnect(); }, 15000);
        }
      }

      // tâches à rejouer : d'abord les onglets, puis les boutons de chargement
      var taches = [];
      Object.keys(etat.tabs).forEach(function (ci) {
        taches.push(function () { var box = boites()[+ci]; return box && boutons(box)[etat.tabs[ci]]; });
      });
      etat.act.forEach(function (id) { taches.push(function () { return document.getElementById(id); }); });

      function selectsPrets() {
        return Object.keys(etat.sel).every(function (id) {
          var el = document.getElementById(id);
          return !el || libre[id] || el.value === etat.sel[id];
        });
      }

      var essais = 0, stable = 0;
      var timer = setInterval(function () {
        essais++;
        stable = selectsPrets() ? stable + 1 : 0; // les listes doivent être stables 2 passages de suite
        if (stable >= 2 && document.readyState === "complete" && taches.length) {
          var el = taches[0]();
          if (el && el.offsetParent !== null && !el.disabled) { taches.shift(); el.click(); }
        }
        if (!taches.length || essais > 80) {
          clearInterval(timer);
          var n = 0, y = etat.y || 0;
          if (y > 0) { var t = setInterval(function () { window.scrollTo(0, y); if (++n > 10) clearInterval(t); }, 300); }
        }
      }, 250);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
  } catch (e) {}
})();
