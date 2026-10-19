// logo-nav.js
// Place le logo Campus Flex à gauche de la barre du haut et définit l'icône de l'onglet (favicon).
// Chargé automatiquement par auth-guard.js et suivi-visite.js ; peut aussi être ajouté à la main
// sur une page publique : <script src="logo-nav.js"></script>
(function () {
  var script = document.currentScript;
  if (!script || !script.src) return;
  var base = script.src.replace(/[^\/]*$/, ""); // dossier où se trouve ce fichier

  function favicon() {
    try {
      var anciens = document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]');
      Array.prototype.forEach.call(anciens, function (l) { l.parentNode.removeChild(l); });
      var icone = document.createElement("link");
      icone.rel = "icon"; icone.type = "image/svg+xml"; icone.href = base + "logo-icone.svg";
      document.head.appendChild(icone);
      var apple = document.createElement("link");
      apple.rel = "apple-touch-icon"; apple.href = base + "logo-icone.png";
      document.head.appendChild(apple);
    } catch (e) {}
  }

  function logo() {
    try {
      if (document.getElementById("cf-logo")) return;
      var nav = document.querySelector("nav") || document.querySelector("header");
      if (!nav) {
        // Page sans barre du haut (ex. formulaire dans une carte) : logo en couleurs au-dessus du titre
        var h = document.querySelector("h1");
        if (!h) return;
        var st = document.createElement("style");
        st.textContent = "#cf-logo{display:block;margin:0 0 14px}#cf-logo img{height:38px;width:auto;display:block}";
        document.head.appendChild(st);
        var lien = document.createElement("a");
        lien.id = "cf-logo"; lien.href = base + "index.html"; lien.setAttribute("aria-label", "Campus Flex - Accueil");
        lien.innerHTML = '<img src="' + base + 'logo-campus-flex.svg" alt="Campus Flex">';
        h.parentNode.insertBefore(lien, h);
        return;
      }

      var style = document.createElement("style");
      style.textContent =
        "#cf-logo{display:inline-flex;align-items:center;margin-right:12px;vertical-align:middle;flex:0 0 auto}" +
        "#cf-logo img{height:30px;width:auto;display:block}" +
        "#cf-logo .cf-ico{display:none}" +
        "@media (max-width:560px){#cf-logo .cf-full{display:none}#cf-logo .cf-ico{display:block;height:32px}}";
      document.head.appendChild(style);

      var a = document.createElement("a");
      a.id = "cf-logo"; a.href = base + "index.html"; a.setAttribute("aria-label", "Campus Flex - Accueil");
      a.innerHTML = '<img class="cf-full" src="' + base + 'logo-campus-flex-blanc.svg" alt="Campus Flex">' +
                    '<img class="cf-ico" src="' + base + 'logo-icone.svg" alt="Campus Flex">';

      var titre = nav.querySelector("h1");
      if (titre) {
        titre.style.display = "flex";
        titre.style.alignItems = "center";
        var texte = (titre.textContent || "").replace(/[^A-Za-zÀ-ÿ ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        if (texte === "campus flex") { titre.textContent = ""; a.style.marginRight = "0"; titre.appendChild(a); }
        else titre.insertBefore(a, titre.firstChild);
      } else {
        nav.insertBefore(a, nav.firstChild);
      }
    } catch (e) {}
  }

  favicon();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", logo);
  else logo();
})();
