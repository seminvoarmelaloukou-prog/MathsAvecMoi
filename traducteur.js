/* Campus Flex – Traducteur des cours de langues (anglais, espagnol, allemand)
   Un mot, une phrase ou un passage du cours : français <-> langue du cours.

   Placement : à la racine du dépôt, à côté de campus-menu.js.
   Chargement : automatique par campus-menu.js sur les pages de classe de
   anglais/, espagnol/ et allemand/ (ex. anglais/6eme/index.html).
   Une page qui ne charge pas campus-menu.js peut l'appeler elle-même :
     <script src="../../traducteur.js" defer></script>
   Forcer la langue d'une page : <script>window.CF_TRAD_LANGUE = "en";</script>  (en, es ou de)

   Couleurs : reprend les variables du thème (--ink, --btn-bg, --paper, --line...),
   donc suit la couleur choisie par l'élève et le mode sombre.
   Moteurs : Google (sans clé) puis MyMemory en secours. */
(function () {
  "use strict";
  if (window.__cfTraducteur) { return; }

  var LANGUES = {
    en: { code: "en", nom: "Anglais", voix: "en-GB" },
    es: { code: "es", nom: "Espagnol", voix: "es-ES" },
    de: { code: "de", nom: "Allemand", voix: "de-DE" }
  };
  var PAR_DOSSIER = { anglais: "en", espagnol: "es", allemand: "de" };
  var FR = { code: "fr", nom: "Français", voix: "fr-FR" };
  var MAX = 3000;          // caractères traduits au maximum par demande
  var MORCEAU = 450;       // taille d'un envoi au service de traduction
  var VALIDE_SEL = 120000; // une sélection reste utilisable 2 minutes

  function langueDeLaPage() {
    var forcee = window.CF_TRAD_LANGUE ? String(window.CF_TRAD_LANGUE).toLowerCase() : "";
    if (PAR_DOSSIER[forcee]) { forcee = PAR_DOSSIER[forcee]; }
    if (LANGUES[forcee]) { return LANGUES[forcee]; }
    var m = window.location.pathname.match(/\/(anglais|espagnol|allemand)\/[^\/.]+(?:\/(?:index\.html)?)?$/i);
    return m ? LANGUES[PAR_DOSSIER[m[1].toLowerCase()]] : null;
  }

  var L = langueDeLaPage();
  if (!L) { return; }
  window.__cfTraducteur = true;

  /* ------------------------------------------------------------------ */
  /* TRADUCTION                                                          */
  /* ------------------------------------------------------------------ */
  var cache = {};
  var moteursHS = {};

  function decoder(s) {
    var t = document.createElement("textarea");
    t.innerHTML = String(s);
    return t.value;
  }

  // Coupe un paragraphe en morceaux de 450 caractères au plus, en fin de phrase si possible
  function decouper(p, max) {
    if (p.length <= max) { return [p]; }
    var phrases = p.match(/[^.!?…]+[.!?…]*\s*/g) || [p];
    var morceaux = [], cur = "";
    phrases.forEach(function (ph) {
      if (ph.length > max) {
        if (cur) { morceaux.push(cur); cur = ""; }
        var t = "";
        ph.split(/(\s+)/).forEach(function (m) {
          if (t && (t + m).length > max) { morceaux.push(t); t = ""; }
          t += m;
        });
        cur = t;
        return;
      }
      if (cur && (cur + ph).length > max) { morceaux.push(cur); cur = ""; }
      cur += ph;
    });
    if (cur) { morceaux.push(cur); }
    return morceaux.map(function (m) { return m.trim(); }).filter(Boolean);
  }

  function avecDelai(url, ms) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var minuteur = setTimeout(function () { if (ctrl) { ctrl.abort(); } }, ms);
    return fetch(url, { signal: ctrl ? ctrl.signal : undefined, credentials: "omit", cache: "no-store" })
      .then(function (r) {
        clearTimeout(minuteur);
        if (!r.ok) { throw new Error("HTTP " + r.status); }
        return r.json();
      }, function (e) { clearTimeout(minuteur); throw e; });
  }

  function moteurGoogle(txt, de, vers, mot) {
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t" + (mot ? "&dt=bd" : "") +
      "&sl=" + de + "&tl=" + vers + "&q=" + encodeURIComponent(txt);
    return avecDelai(url, 9000).then(function (j) {
      if (!j || !j[0]) { throw new Error("vide"); }
      var t = j[0].map(function (x) { return x && x[0] ? x[0] : ""; }).join("");
      if (!t) { throw new Error("vide"); }
      var alts = [];
      if (mot && j[1]) {
        j[1].forEach(function (g) {
          (g && g[1] ? g[1] : []).forEach(function (w) {
            if (typeof w === "string" && alts.indexOf(w) === -1 && w.toLowerCase() !== t.toLowerCase()) { alts.push(w); }
          });
        });
      }
      return { texte: t, alts: alts.slice(0, 6) };
    });
  }

  function moteurMyMemory(txt, de, vers, mot) {
    var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(txt) + "&langpair=" + de + "|" + vers;
    return avecDelai(url, 9000).then(function (j) {
      var t = j && j.responseData && j.responseData.translatedText;
      if (!t || String(j.responseStatus) !== "200" || /^MYMEMORY WARNING/i.test(t)) { throw new Error("mymemory"); }
      t = decoder(t);
      var alts = [];
      if (mot && j.matches) {
        j.matches.forEach(function (m) {
          var w = m && m.translation ? decoder(m.translation).trim() : "";
          if (w && w.split(/\s+/).length <= 3 && w.toLowerCase() !== t.toLowerCase() && alts.indexOf(w) === -1) { alts.push(w); }
        });
      }
      return { texte: t, alts: alts.slice(0, 5) };
    });
  }

  var MOTEURS = [["google", moteurGoogle], ["mymemory", moteurMyMemory]];

  function traduireMorceau(txt, de, vers, mot) {
    var cle = de + "|" + vers + "|" + (mot ? "1" : "0") + "|" + txt;
    if (cache[cle]) { return Promise.resolve(cache[cle]); }
    var maintenant = Date.now();
    var liste = MOTEURS.filter(function (m) { return !moteursHS[m[0]] || maintenant - moteursHS[m[0]] > 60000; });
    if (!liste.length) { liste = MOTEURS; }
    function essayer(i) {
      if (i >= liste.length) { return Promise.reject(new Error("aucun moteur")); }
      return liste[i][1](txt, de, vers, mot).then(function (r) {
        delete moteursHS[liste[i][0]];
        cache[cle] = r;
        return r;
      }, function () {
        moteursHS[liste[i][0]] = Date.now();
        return essayer(i + 1);
      });
    }
    return essayer(0);
  }

  /* ------------------------------------------------------------------ */
  /* STYLE (variables du thème du site)                                  */
  /* ------------------------------------------------------------------ */
  var CSS = [
    ".cft *{box-sizing:border-box}",
    ".cft-fab{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:900;display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:10px 18px;border:2px solid var(--btn-bg,#2c3e8c);border-radius:999px;background:var(--btn-bg,#2c3e8c);color:var(--btn-fg,#fff);font:inherit;font-weight:800;font-size:.95rem;line-height:1;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);-webkit-tap-highlight-color:transparent}",
    ".cft-fab.sel{background:var(--hl,#fff3d6);color:var(--text,#1b2540);border-color:var(--amber,#f39c12);animation:cft-pouls 2s ease-out infinite}",
    "@keyframes cft-pouls{0%{box-shadow:0 0 0 0 rgba(243,156,18,.55)}70%,100%{box-shadow:0 0 0 12px rgba(243,156,18,0)}}",
    "@keyframes cft-monte{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}",
    ".cft-fond{position:fixed;left:0;top:0;right:0;bottom:0;z-index:1000;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.45)}",
    ".cft-fond.ouvert{display:flex}",
    ".cft-feuille{width:100%;max-width:560px;max-height:92vh;max-height:92dvh;overflow:auto;-webkit-overflow-scrolling:touch;background:var(--card,#fff);color:var(--text,#1b2540);border:2px solid var(--ink,#2c3e8c);border-bottom:0;border-radius:20px 20px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 30px rgba(0,0,0,.25);animation:cft-monte .25s ease-out}",
    "@media (min-width:700px){.cft-fond{align-items:center}.cft-feuille{border-bottom:2px solid var(--ink,#2c3e8c);border-radius:20px}}",
    ".cft-tete{display:flex;align-items:center;justify-content:space-between;gap:10px}",
    ".cft-titre{margin:0;font-family:Caveat,\"Segoe Print\",\"Bradley Hand\",cursive;font-weight:600;font-size:1.8rem;line-height:1.1;color:var(--ink,#2c3e8c)}",
    ".cft-x{flex:none;width:44px;height:44px;border:2px solid var(--line,#b9c1e3);border-radius:50%;background:transparent;color:var(--text,#1b2540);font:inherit;font-size:1.1rem;font-weight:800;cursor:pointer}",
    ".cft-sens{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin:12px 0}",
    ".cft-puce{display:block;padding:10px 6px;border:2px solid var(--line,#b9c1e3);border-radius:12px;background:var(--paper,#f1f3fb);color:var(--ink,#2c3e8c);font-weight:800;text-align:center}",
    ".cft-inv{width:46px;height:46px;border:2px solid var(--btn-bg,#2c3e8c);border-radius:50%;background:var(--btn-bg,#2c3e8c);color:var(--btn-fg,#fff);font:inherit;font-size:1.3rem;font-weight:800;cursor:pointer}",
    ".cft-zone{display:block;width:100%;min-height:120px;padding:12px;border:2px solid var(--line,#b9c1e3);border-radius:12px;background:var(--card,#fff);color:var(--text,#1b2540);font:inherit;font-size:16px;line-height:1.45;resize:vertical}",
    ".cft-zone:focus,.cft-fab:focus-visible,.cft-go:focus-visible,.cft-sec:focus-visible,.cft-inv:focus-visible,.cft-x:focus-visible{outline:3px solid var(--amber,#f39c12);outline-offset:2px}",
    ".cft-ligne{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0}",
    ".cft-cpt{margin-left:auto;font-size:.8rem;color:var(--muted,#666)}",
    ".cft-sec{min-height:44px;padding:8px 14px;border:2px solid var(--line,#b9c1e3);border-radius:999px;background:transparent;color:var(--text,#1b2540);font:inherit;font-weight:700;font-size:.9rem;cursor:pointer}",
    ".cft-sec:disabled{opacity:.45;cursor:not-allowed}",
    ".cft-go{display:block;width:100%;min-height:50px;margin:10px 0 6px;border:2px solid var(--btn-bg,#2c3e8c);border-radius:999px;background:var(--btn-bg,#2c3e8c);color:var(--btn-fg,#fff);font:inherit;font-weight:800;font-size:1.05rem;cursor:pointer}",
    ".cft-go:disabled{opacity:.6;cursor:wait}",
    ".cft-etat{min-height:1.3em;margin:6px 0;font-size:.9rem;color:var(--muted,#666)}",
    ".cft-etat.err{padding:10px 12px;border:2px solid var(--amber,#f39c12);border-radius:12px;background:var(--hl,#fff3d6);color:var(--text,#1b2540);font-weight:700}",
    ".cft-res{margin-top:10px;padding:14px;border:2px dashed var(--ink,#2c3e8c);border-radius:14px;background:var(--paper,#f1f3fb)}",
    ".cft-res[hidden]{display:none}",
    ".cft-lab{margin:0 0 6px;font-size:.78rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted,#666)}",
    ".cft-texte{white-space:pre-wrap;overflow-wrap:anywhere;word-wrap:break-word;font-size:1.2rem;line-height:1.5;color:var(--text,#1b2540);-webkit-user-select:text;user-select:text}",
    ".cft-texte.mot{font-family:Caveat,\"Segoe Print\",\"Bradley Hand\",cursive;font-weight:600;font-size:2.1rem;line-height:1.15;color:var(--ink,#2c3e8c)}",
    ".cft-alts{margin:8px 0 0;font-size:.95rem;color:var(--text,#1b2540)}",
    ".cft-alts[hidden]{display:none}",
    "@media (prefers-reduced-motion:reduce){.cft-fab.sel,.cft-feuille{animation:none!important}}",
    "@media print{.cft{display:none!important}}"
  ].join("\n");

  /* ------------------------------------------------------------------ */
  /* INTERFACE                                                           */
  /* ------------------------------------------------------------------ */
  function el(tag, cls, texte) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (texte != null) { e.textContent = texte; }
    return e;
  }

  function construire() {
    if (document.getElementById("cf-trad")) { return; }

    var style = document.createElement("style");
    style.id = "cft-style";
    style.textContent = CSS;
    document.head.appendChild(style);

    var racine = el("div", "cft notranslate");
    racine.id = "cf-trad";
    racine.setAttribute("translate", "no");

    var fab = el("button", "cft-fab");
    fab.type = "button";
    fab.setAttribute("aria-haspopup", "dialog");
    var fabTxt = el("span", "", "Traduire");
    fab.appendChild(el("span", "", "🌐"));
    fab.appendChild(fabTxt);

    var fond = el("div", "cft-fond");
    fond.setAttribute("role", "dialog");
    fond.setAttribute("aria-modal", "true");
    fond.setAttribute("aria-labelledby", "cft-titre");
    var feuille = el("div", "cft-feuille");

    var tete = el("div", "cft-tete");
    var titre = el("h2", "cft-titre", "Traducteur d’" + L.nom.toLowerCase());
    titre.id = "cft-titre";
    var fermer = el("button", "cft-x", "✕");
    fermer.type = "button";
    fermer.setAttribute("aria-label", "Fermer le traducteur");
    tete.appendChild(titre);
    tete.appendChild(fermer);

    var sens = el("div", "cft-sens");
    var puceDe = el("span", "cft-puce");
    var inv = el("button", "cft-inv", "⇄");
    inv.type = "button";
    inv.setAttribute("aria-label", "Inverser le sens de la traduction");
    var puceVers = el("span", "cft-puce");
    sens.appendChild(puceDe);
    sens.appendChild(inv);
    sens.appendChild(puceVers);

    var zone = el("textarea", "cft-zone");
    zone.rows = 4;
    zone.maxLength = MAX;
    zone.setAttribute("autocapitalize", "off");
    zone.setAttribute("autocomplete", "off");
    zone.setAttribute("spellcheck", "false");
    zone.setAttribute("aria-label", "Texte à traduire");

    var ligne = el("div", "cft-ligne");
    var btnSel = el("button", "cft-sec", "Utiliser ma sélection");
    btnSel.type = "button";
    btnSel.disabled = true;
    btnSel.title = "Sélectionne d’abord un passage dans le cours";
    var btnEff = el("button", "cft-sec", "Effacer");
    btnEff.type = "button";
    var cpt = el("span", "cft-cpt", "0 / " + MAX);
    ligne.appendChild(btnSel);
    ligne.appendChild(btnEff);
    ligne.appendChild(cpt);

    var btnGo = el("button", "cft-go", "Traduire");
    btnGo.type = "button";

    var etat = el("p", "cft-etat");
    etat.setAttribute("role", "status");
    etat.setAttribute("aria-live", "polite");

    var res = el("div", "cft-res");
    res.hidden = true;
    var resLab = el("p", "cft-lab");
    var resTexte = el("div", "cft-texte");
    var resAlts = el("p", "cft-alts");
    resAlts.hidden = true;
    var actions = el("div", "cft-ligne");
    var btnVoixSrc = el("button", "cft-sec", "🔊 Original");
    btnVoixSrc.type = "button";
    var btnVoixRes = el("button", "cft-sec", "🔊 Traduction");
    btnVoixRes.type = "button";
    var btnCopier = el("button", "cft-sec", "📋 Copier");
    btnCopier.type = "button";
    actions.appendChild(btnVoixSrc);
    actions.appendChild(btnVoixRes);
    actions.appendChild(btnCopier);
    res.appendChild(resLab);
    res.appendChild(resTexte);
    res.appendChild(resAlts);
    res.appendChild(actions);

    feuille.appendChild(tete);
    feuille.appendChild(sens);
    feuille.appendChild(zone);
    feuille.appendChild(ligne);
    feuille.appendChild(btnGo);
    feuille.appendChild(etat);
    feuille.appendChild(res);
    fond.appendChild(feuille);
    racine.appendChild(fab);
    racine.appendChild(fond);
    document.body.appendChild(racine);

    /* ---------------- état ---------------- */
    var inverse = false;           // faux : langue du cours -> français
    var compteur = 0;              // annule une traduction dépassée
    var derniereSel = "", tempsSel = 0, minuteurSel = null;
    var dernier = null;            // { source, resultat, de, vers }
    var boutonVoix = null;

    try { inverse = localStorage.getItem("cf_trad_inv_" + L.code) === "1"; } catch (e) {}

    function msg(texte, erreur) {
      etat.textContent = texte || "";
      etat.className = "cft-etat" + (erreur ? " err" : "");
    }

    function majSens() {
      var de = inverse ? FR : L, vers = inverse ? L : FR;
      puceDe.textContent = de.nom;
      puceVers.textContent = vers.nom;
      zone.lang = de.code;
      zone.placeholder = "Écris un mot, une phrase ou colle un passage en " + de.nom.toLowerCase() + "…";
    }

    function majCompteur() {
      cpt.textContent = zone.value.length + " / " + MAX;
    }

    /* ---------------- sélection dans le cours ---------------- */
    function lireSelection() {
      var s = window.getSelection ? window.getSelection() : null;
      if (!s || s.isCollapsed || !s.rangeCount) { return ""; }
      var n = s.anchorNode;
      if (n && racine.contains(n)) { return ""; }
      return s.toString().replace(/[ \t\u00a0]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    }

    function selectionValide() {
      return !!derniereSel && (Date.now() - tempsSel) < VALIDE_SEL;
    }

    function majFab() {
      var v = selectionValide();
      fab.classList.toggle("sel", v);
      fabTxt.textContent = v ? "Traduire la sélection" : "Traduire";
      btnSel.disabled = !v;
      clearTimeout(minuteurSel);
      if (v) { minuteurSel = setTimeout(majFab, VALIDE_SEL - (Date.now() - tempsSel) + 200); }
    }

    function memoriserSelection() {
      var t = lireSelection();
      if (t) { derniereSel = t; tempsSel = Date.now(); majFab(); }
    }

    var attente = null;
    document.addEventListener("selectionchange", function () {
      clearTimeout(attente);
      attente = setTimeout(memoriserSelection, 150);
    });
    // Appuyer sur le bouton peut effacer la sélection : on la garde avant
    ["pointerdown", "mousedown", "touchstart"].forEach(function (nom) {
      fab.addEventListener(nom, memoriserSelection, { passive: true });
    });

    /* ---------------- voix et copie ---------------- */
    function arreterVoix() {
      try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); } } catch (e) {}
      boutonVoix = null;
    }

    function parler(texte, langue, bouton) {
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        msg("La lecture à voix haute n’est pas disponible sur cet appareil.", true);
        return;
      }
      var s = window.speechSynthesis;
      if (s.speaking && boutonVoix === bouton) { arreterVoix(); return; }
      s.cancel();
      boutonVoix = bouton;
      setTimeout(function () {
        var u = new SpeechSynthesisUtterance(String(texte).slice(0, 800));
        u.lang = langue.voix;
        u.rate = 0.9;
        u.onerror = function (e) {
          if (e && (e.error === "canceled" || e.error === "interrupted")) { return; }
          msg("La voix de cette langue n’est pas disponible sur ton appareil.", true);
        };
        s.speak(u);
      }, 60);
    }

    function copier(texte) {
      function ok() { msg("Traduction copiée."); }
      function repli() {
        var t = document.createElement("textarea");
        t.value = texte;
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        try { document.execCommand("copy"); ok(); } catch (e) { msg("Copie impossible : sélectionne le texte à la main.", true); }
        document.body.removeChild(t);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(ok, repli);
      } else { repli(); }
    }

    /* ---------------- traduction ---------------- */
    function afficher(sortie, source, de, vers, mot, alts) {
      dernier = { source: source, resultat: sortie, de: de, vers: vers };
      resLab.textContent = "Traduction · " + vers.nom;
      resTexte.textContent = sortie;
      resTexte.className = "cft-texte" + (mot ? " mot" : "");
      if (mot && alts && alts.length) {
        resAlts.textContent = "Autres sens : " + alts.join(" · ");
        resAlts.hidden = false;
      } else { resAlts.hidden = true; }
      res.hidden = false;
      if (res.scrollIntoView) { try { res.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {} }
    }

    function lancer() {
      var texte = zone.value.replace(/\u00a0/g, " ").trim();
      if (!texte) {
        msg("Écris un mot ou une phrase, ou sélectionne un passage du cours.", true);
        return;
      }
      var coupe = false;
      if (texte.length > MAX) {
        texte = texte.slice(0, MAX);
        coupe = true;
        zone.value = texte;
        majCompteur();
      }
      if (navigator.onLine === false) {
        msg("Pas de connexion : la traduction a besoin d’internet.", true);
        return;
      }
      var de = inverse ? FR : L, vers = inverse ? L : FR;
      var mot = !/\s/.test(texte) && texte.length <= 40;
      var jeton = ++compteur;
      btnGo.disabled = true;
      res.hidden = true;
      arreterVoix();

      var lignes = texte.split(/\r?\n/);
      var taches = [];
      lignes.forEach(function (l, i) {
        var s = l.trim();
        if (s) { decouper(s, MORCEAU).forEach(function (m) { taches.push({ l: i, t: m }); }); }
      });
      var sorties = lignes.map(function () { return []; });
      var alts = [];
      var n = 0;

      function suite() {
        if (jeton !== compteur) { return Promise.resolve(false); }
        if (n >= taches.length) { return Promise.resolve(true); }
        msg(taches.length > 1 ? "Traduction en cours… " + (n + 1) + "/" + taches.length : "Traduction en cours…");
        var tk = taches[n];
        return traduireMorceau(tk.t, de.code, vers.code, mot).then(function (r) {
          sorties[tk.l].push(r.texte);
          if (mot) { alts = r.alts || []; }
          n++;
          return suite();
        });
      }

      suite().then(function (fini) {
        if (jeton !== compteur || !fini) { return; }
        btnGo.disabled = false;
        var sortie = sorties.map(function (p) { return p.join(" "); }).join("\n");
        afficher(sortie, texte, de, vers, mot, alts);
        msg(coupe ? "Passage long : seuls les " + MAX + " premiers caractères ont été traduits." : "");
      }, function () {
        if (jeton !== compteur) { return; }
        btnGo.disabled = false;
        msg("Impossible de traduire pour le moment. Vérifie ta connexion et réessaie.", true);
      });
    }

    /* ---------------- ouverture / fermeture ---------------- */
    function ouvrir(texte) {
      var t = (texte !== undefined && texte !== null) ? String(texte) : (selectionValide() ? derniereSel : "");
      fond.classList.add("ouvert");
      document.documentElement.style.overflow = "hidden";
      msg("");
      if (t) {
        zone.value = t.slice(0, MAX + 1);
        majCompteur();
        derniereSel = "";
        majFab();
        lancer();
      } else {
        setTimeout(function () { try { zone.focus(); } catch (e) {} }, 80);
      }
    }

    function fermerPanneau() {
      fond.classList.remove("ouvert");
      document.documentElement.style.overflow = "";
      compteur++;
      btnGo.disabled = false;
      arreterVoix();
      try { fab.focus(); } catch (e) {}
    }

    /* ---------------- événements ---------------- */
    fab.addEventListener("click", function () { ouvrir(); });
    fermer.addEventListener("click", fermerPanneau);
    fond.addEventListener("click", function (e) { if (e.target === fond) { fermerPanneau(); } });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && fond.classList.contains("ouvert")) { fermerPanneau(); }
    });
    window.addEventListener("pagehide", function () { document.documentElement.style.overflow = ""; });

    btnGo.addEventListener("click", lancer);
    zone.addEventListener("input", majCompteur);
    zone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); lancer(); }
    });
    btnSel.addEventListener("click", function () {
      if (!selectionValide()) { return; }
      zone.value = derniereSel.slice(0, MAX + 1);
      derniereSel = "";
      majCompteur();
      majFab();
      lancer();
    });
    btnEff.addEventListener("click", function () {
      compteur++;
      btnGo.disabled = false;
      zone.value = "";
      majCompteur();
      res.hidden = true;
      dernier = null;
      arreterVoix();
      msg("");
      zone.focus();
    });
    inv.addEventListener("click", function () {
      inverse = !inverse;
      try { localStorage.setItem("cf_trad_inv_" + L.code, inverse ? "1" : "0"); } catch (e) {}
      compteur++;
      btnGo.disabled = false;
      arreterVoix();
      // la traduction obtenue devient le texte à traduire dans l'autre sens
      if (dernier && !res.hidden) { zone.value = dernier.resultat; majCompteur(); }
      res.hidden = true;
      dernier = null;
      majSens();
      msg("");
    });
    btnVoixSrc.addEventListener("click", function () { if (dernier) { parler(dernier.source, dernier.de, btnVoixSrc); } });
    btnVoixRes.addEventListener("click", function () { if (dernier) { parler(dernier.resultat, dernier.vers, btnVoixRes); } });
    btnCopier.addEventListener("click", function () { if (dernier) { copier(dernier.resultat); } });

    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      btnVoixSrc.hidden = true;
      btnVoixRes.hidden = true;
    }

    majSens();
    majCompteur();
    majFab();

    // Pour un bouton « Traduire » placé ailleurs dans une page : CFTraducteur.ouvrir("hello")
    window.CFTraducteur = {
      ouvrir: function (texte) { ouvrir(texte === undefined ? undefined : String(texte)); },
      fermer: fermerPanneau
    };
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", construire); }
  else { construire(); }
})();
