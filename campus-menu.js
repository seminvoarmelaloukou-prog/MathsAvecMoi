/* Campus Flex – menu du ruban + anti-doublon de logo */
(function () {
  "use strict";

  // Charge automatiquement campus-theme.js (couleur et langue) si la page ne l'a pas déjà dans son <head>
  (function () {
    if (window.CF_THEME || document.querySelector('script[src*="campus-theme.js"]')) { return; }
    var moi = document.currentScript;
    if (!moi) {
      Array.prototype.forEach.call(document.scripts, function (s) { if (/campus-menu\.js/.test(s.src)) { moi = s; } });
    }
    if (!moi || !moi.src) { return; }
    var t = document.createElement("script");
    t.src = moi.src.replace(/campus-menu\.js.*$/, "campus-theme.js");
    document.head.appendChild(t);
  })();

  // Charge le traducteur (traducteur.js) sur les pages de classe d'anglais, d'espagnol et d'allemand
  (function () {
    var pageDeLangue = /\/(anglais|espagnol|allemand)\/[^\/.]+(?:\/(?:index\.html)?)?$/i.test(window.location.pathname);
    if (!(pageDeLangue || window.CF_TRAD_LANGUE) || window.__cfTraducteur || document.querySelector('script[src*="traducteur.js"]')) { return; }
    var moi = document.currentScript;
    if (!moi) {
      Array.prototype.forEach.call(document.scripts, function (s) { if (/campus-menu\.js/.test(s.src)) { moi = s; } });
    }
    if (!moi || !moi.src) { return; }
    var t = document.createElement("script");
    t.src = moi.src.replace(/campus-menu\.js.*$/, "traducteur.js");
    document.head.appendChild(t);
  })();

  // ---------- Menu à trois traits ----------
  var bouton = document.getElementById("burger");
  var panneau = document.getElementById("menu-principal");

  if (bouton && panneau) {
    var ouvrir = function (oui) {
      panneau.classList.toggle("ouvert", oui);
      bouton.setAttribute("aria-expanded", oui ? "true" : "false");
      bouton.setAttribute("aria-label", oui ? "Fermer le menu" : "Ouvrir le menu");
    };

    bouton.addEventListener("click", function () {
      ouvrir(bouton.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { ouvrir(false); } });
    panneau.addEventListener("click", function (e) { if (e.target.closest("a")) { ouvrir(false); } });

    // Page en cours mise en évidence
    var page = (window.location.pathname.split("/").pop() || "index.html");
    panneau.querySelectorAll("a[href]").forEach(function (a) {
      if (a.getAttribute("href") === page) { a.setAttribute("aria-current", "page"); }
    });
  }

  // ---------- Déconnexion (pages qui n'ont pas leur propre gestion) ----------
  document.querySelectorAll("a[data-deconnexion]:not([data-propre])").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (!window.confirm("Veux-tu vraiment te déconnecter ?")) { return; }
      var aller = function () { window.location.href = "connexion.html"; };
      if (window.firebase && window.firebase.auth) { window.firebase.auth().signOut().then(aller, aller); } else { aller(); }
    });
  });

  // ---------- Un seul logo ----------
  // Un script du site (logo-nav.js) peut ajouter un second logo. On ne garde que celui
  // de la page (marqué data-garder) et on retire tout autre logo ajouté ailleurs.
  function nettoyer() {
    document.querySelectorAll("img").forEach(function (img) {
      var src = img.getAttribute("src") || "";
      if (!/logo/i.test(src)) { return; }
      if (img.hasAttribute("data-garder") || img.closest("[data-garder]")) { return; }

      var bloc = img.closest("a") || img.parentElement;
      var risque = !bloc || /^(BODY|HTML|HEADER|MAIN|SECTION|FORM|NAV)$/.test(bloc.tagName) ||
        bloc.querySelector("[data-garder]") || bloc.matches(".marque,.mascotte,.barre-haut");
      (risque ? img : bloc).remove();
    });
  }

  nettoyer();
  window.addEventListener("load", nettoyer);
  setTimeout(nettoyer, 400);
  setTimeout(nettoyer, 1500);
  if (window.MutationObserver && document.body) {
    var observateur = new MutationObserver(nettoyer);
    observateur.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { observateur.disconnect(); }, 6000);
  }
})();
