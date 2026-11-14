/* Campus Flex – installation sur l'écran d'accueil */
(function () {
  "use strict";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.warn("Service worker non enregistré :", err);
      });
    });
  }

  var CLE = "cf_install_masque_jusqua";
  var PAUSE_JOURS = 7;

  function dejaInstalle() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }

  function masque() {
    try { return Number(localStorage.getItem(CLE) || 0) > Date.now(); } catch (e) { return false; }
  }

  function reporter() {
    try { localStorage.setItem(CLE, String(Date.now() + PAUSE_JOURS * 86400000)); } catch (e) {}
  }

  function creerBandeau(texte, avecBouton, onInstaller) {
    if (document.getElementById("cf-install")) { return; }

    var style = document.createElement("style");
    style.textContent =
      "#cf-install{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#2c3e8c;color:#fff;" +
      "padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;gap:12px;" +
      "flex-wrap:wrap;font:16px/1.4 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;box-shadow:0 -2px 12px rgba(0,0,0,.25)}" +
      "#cf-install p{flex:1 1 200px;margin:0}" +
      "#cf-install button{min-height:44px;padding:8px 18px;border-radius:10px;font:inherit;font-weight:700;cursor:pointer;border:2px solid #fff}" +
      "#cf-install .oui{background:#fff;color:#2c3e8c}" +
      "#cf-install .non{background:transparent;color:#fff}" +
      "#cf-install button:focus-visible{outline:3px solid #f39c12;outline-offset:2px}";
    document.head.appendChild(style);

    var bandeau = document.createElement("div");
    bandeau.id = "cf-install";
    bandeau.setAttribute("role", "region");
    bandeau.setAttribute("aria-label", "Installer Campus Flex");

    var p = document.createElement("p");
    p.textContent = texte;
    bandeau.appendChild(p);

    if (avecBouton) {
      var oui = document.createElement("button");
      oui.type = "button";
      oui.className = "oui";
      oui.textContent = "Installer";
      oui.addEventListener("click", onInstaller);
      bandeau.appendChild(oui);
    }

    var non = document.createElement("button");
    non.type = "button";
    non.className = "non";
    non.textContent = "Plus tard";
    non.addEventListener("click", function () { reporter(); fermer(); });
    bandeau.appendChild(non);

    document.body.appendChild(bandeau);
  }

  function fermer() {
    var b = document.getElementById("cf-install");
    if (b) { b.remove(); }
  }

  var invite = null;

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    invite = e;
    if (dejaInstalle() || masque()) { return; }
    creerBandeau("Installe Campus Flex sur ton écran d’accueil pour l’ouvrir en un clic.", true, function () {
      if (!invite) { return; }
      invite.prompt();
      invite.userChoice.then(function () { invite = null; fermer(); });
    });
  });

  window.addEventListener("appinstalled", function () { invite = null; fermer(); });

  // iPhone / iPad (Safari) : pas d'invite automatique, on explique le geste
  window.addEventListener("load", function () {
    var ua = navigator.userAgent || "";
    var ios = /iPhone|iPad|iPod/.test(ua);
    var safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (ios && safari && !dejaInstalle() && !masque()) {
      creerBandeau("Pour installer : appuie sur Partager, puis sur « Sur l’écran d’accueil ».", false);
    }
  });
})();
