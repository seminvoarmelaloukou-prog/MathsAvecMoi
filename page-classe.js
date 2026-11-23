/* Campus Flex – Page de classe commune (nouveau style)
   Un seul fichier pour TOUTES les classes de TOUTES les matières.

   Placement : à la racine du dépôt (à côté de campus.css et campus-menu.js).
   Chaque dossier de classe (ex. espagnol/TleAB/) contient le même index.html,
   qui charge ce fichier. La matière et la classe sont lues dans l'adresse :
     .../espagnol/TleAB/index.html  ->  matière « Espagnol », classe « Tle AB »

   Les cours et les vidéos viennent de Firebase, comme dans les anciennes pages :
     cours/{classe}/{matière}   et   videos/{classe}/{matière}
   Les séquences s'affichent dans l'ordre de leurs clés (sa1_seq1, sa1_seq2, sa2_seq1...),
   regroupées par SA, repliées par défaut. Ce qui est ajouté dans l'admin apparaît tout seul.

   Pour l'anglais, l'espagnol et l'allemand, le traducteur (traducteur.js) est chargé aussi. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Matière et classe d'après l'adresse                                 */
  /* ------------------------------------------------------------------ */
  var MATIERES = {
    "anglais": "Anglais", "espagnol": "Espagnol", "allemand": "Allemand", "francais": "Français",
    "maths": "Mathématiques", "pct": "PCT", "svt": "SVT", "philosophie": "Philosophie",
    "histoire-geographie": "Histoire-Géographie", "eps": "EPS", "education-civique": "Éducation civique"
  };
  var LANGUES = { "anglais": 1, "espagnol": 1, "allemand": 1 };

  // dossier -> [identifiant dans Firebase, nom affiché]
  var CLASSES = {
    "6eme": ["6e", "6e"], "5eme": ["5e", "5e"], "4eme": ["4e", "4e"], "3eme": ["3e", "3e"],
    "2ndeab": ["2de AB", "2nde AB"], "2ndec": ["2de C", "2nde C"], "2nded": ["2de D", "2nde D"], "2ndee": ["2de E", "2nde E"],
    "1reab": ["1re AB", "1ère AB"], "1rec": ["1re C", "1ère C"], "1red": ["1re D", "1ère D"], "1ree": ["1re E", "1ère E"],
    "tleab": ["Tle AB", "Tle AB"], "tlec": ["Tle C", "Tle C"], "tled": ["Tle D", "Tle D"], "tlee": ["Tle E", "Tle E"]
  };

  function lireAdresse() {
    var forcee = window.CF_CLASSE;   // facultatif : { dossier: "espagnol", classe: "TleAB" }
    var morceaux = window.location.pathname.split("/").filter(Boolean);
    if (morceaux.length && /\.html?$/i.test(morceaux[morceaux.length - 1])) { morceaux.pop(); }
    var dossierClasse = forcee && forcee.classe ? forcee.classe : morceaux[morceaux.length - 1];
    var dossierMatiere = forcee && forcee.dossier ? forcee.dossier : morceaux[morceaux.length - 2];
    if (!dossierClasse || !dossierMatiere) { return null; }
    var cl = CLASSES[String(dossierClasse).toLowerCase()];
    var mat = MATIERES[String(dossierMatiere).toLowerCase()];
    if (!cl || !mat) { return null; }
    return { dossier: String(dossierMatiere).toLowerCase(), matiere: mat, classeId: cl[0], classeNom: cl[1] };
  }

  var PAGE = lireAdresse();

  // Adresse de la racine du site, d'après l'emplacement de ce fichier
  var script = document.currentScript;
  var RACINE;
  if (script && script.src) { RACINE = script.src.replace(/page-classe\.js.*$/, ""); }
  else { try { RACINE = new URL("../../", window.location.href).href; } catch (e) { RACINE = "../../"; } }

  /* ------------------------------------------------------------------ */
  /* Outils                                                              */
  /* ------------------------------------------------------------------ */
  function el(tag, cls, texte) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (texte != null) { e.textContent = texte; }
    return e;
  }

  function urlSure(u) {
    u = String(u == null ? "" : u).trim();
    return (u && !/^(javascript|data|vbscript):/i.test(u)) ? u : "";
  }

  function cleNaturelle(k) {
    return String(k).toLowerCase().replace(/\d+/g, function (n) { return ("0000" + n).slice(-4); });
  }

  function plein(o) { return !!o && typeof o === "object"; }
  function aContenu(c) { return plein(c) && !!(c.contenu || c.lien || c.image); }
  function aVideo(v) { return plein(v) && !!(v.lien || v.ficheUrl || v.ficheWordUrl); }

  var CSS = [
    ".pc-onglets{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px}",
    ".pc-onglet{min-height:46px;border:2px solid var(--ink,#2c3e8c);border-radius:999px;background:var(--card,#fff);color:var(--ink,#2c3e8c);font:inherit;font-weight:800;font-size:1rem;cursor:pointer}",
    ".pc-onglet[aria-selected=true]{background:var(--btn-bg,#2c3e8c);color:var(--btn-fg,#fff)}",
    ".pc-panneau[hidden]{display:none}",
    ".pc-info{margin:6px 0;color:var(--muted,#666);text-align:center}",
    ".pc-sa{margin:0 0 12px;border:2px solid var(--ink,#2c3e8c);border-radius:14px;background:var(--card,#fff);overflow:hidden}",
    ".pc-sa>summary{display:block;padding:14px 38px 14px 16px;background:var(--btn-bg,#2c3e8c);color:var(--btn-fg,#fff);font-weight:800;cursor:pointer;list-style:none;position:relative}",
    ".pc-seq>summary{display:block;padding:13px 38px 13px 16px;background:var(--paper,#f1f3fb);color:var(--ink,#2c3e8c);font-weight:700;cursor:pointer;list-style:none;position:relative;border-top:2px solid var(--line,#b9c1e3)}",
    ".pc-sa>summary::-webkit-details-marker,.pc-seq>summary::-webkit-details-marker,.pc-video>summary::-webkit-details-marker{display:none}",
    ".pc-sa>summary::after,.pc-seq>summary::after{content:\"\\25B8\";position:absolute;right:14px;top:50%;margin-top:-.6em;line-height:1.2;transition:transform .2s}",
    ".pc-sa[open]>summary::after,.pc-seq[open]>summary::after{transform:rotate(90deg)}",
    ".pc-corps{padding:14px 16px;background:var(--card,#fff);color:var(--text,#1b2540);line-height:1.7;overflow-wrap:anywhere}",
    ".pc-html{overflow-x:auto}",
    ".pc-corps img,.pc-corps iframe,.pc-corps video{max-width:100%;height:auto}",
    ".pc-corps table{display:block;max-width:100%;overflow-x:auto}",
    ".pc-vide{margin:0;color:var(--muted,#666);font-style:italic}",
    ".pc-video{margin:0 0 14px}",
    ".pc-video>summary{display:inline-block;padding:8px 16px;border:2px solid var(--ink,#2c3e8c);border-radius:999px;background:var(--card,#fff);color:var(--ink,#2c3e8c);font-weight:700;font-size:.95rem;cursor:pointer;list-style:none}",
    ".pc-cadre{position:relative;width:100%;aspect-ratio:16/9;margin-top:10px;border-radius:10px;overflow:hidden;background:#000}",
    ".pc-cadre iframe{position:absolute;left:0;top:0;width:100%;height:100%;border:0}",
    ".pc-fiches{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 14px}",
    ".pc-fiches a{display:inline-block;padding:8px 14px;border:2px solid var(--ink,#2c3e8c);border-radius:999px;background:var(--card,#fff);color:var(--ink,#2c3e8c);font-weight:700;font-size:.9rem;text-decoration:none}",
    ".pc-retour{margin-top:16px}"
  ].join("\n");

  /* ------------------------------------------------------------------ */
  /* Éléments de page                                                    */
  /* ------------------------------------------------------------------ */
  function lien(texte, href, cible) {
    var a = el("a", "", texte);
    a.href = href;
    if (cible) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }

  function construireEntete() {
    var header = el("header", "barre");
    var haut = el("div", "barre-haut");
    var marque = el("a", "marque");
    marque.href = RACINE + "index.html";
    var logo = el("img");
    logo.setAttribute("data-garder", "");
    logo.src = RACINE + "logo-icone.png";
    logo.alt = "";
    marque.appendChild(logo);
    marque.appendChild(document.createTextNode("Campus Flex"));
    var burger = el("button", "burger");
    burger.type = "button";
    burger.id = "burger";
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", "menu-principal");
    burger.setAttribute("aria-label", "Ouvrir le menu");
    burger.appendChild(el("span"));
    burger.appendChild(el("span"));
    burger.appendChild(el("span"));
    haut.appendChild(marque);
    haut.appendChild(burger);

    var panneau = el("div", "menu-panneau");
    panneau.id = "menu-principal";
    panneau.setAttribute("role", "navigation");
    panneau.setAttribute("aria-label", "Navigation principale");
    var interieur = el("div", "interieur");
    var liens = el("div", "liens");
    [["Mon profil", "profil.html"], ["Matières", "matieres.html"], ["Composer", "composition.html"], ["Échanges", "echanges.html"],
     ["Emploi du temps", "emploi-eleve.html"], ["Mon bulletin", "bulletin.html"], ["Mes résultats", "mes-resultats.html"], ["Accueil", "index.html"]
    ].forEach(function (l) {
      var a = lien(l[0], RACINE + l[1]);
      if (l[1] === "matieres.html") { a.setAttribute("aria-current", "page"); }
      liens.appendChild(a);
    });
    var sortie = el("a", "sortie", "Se déconnecter");
    sortie.href = "#";
    sortie.id = "deconnexion";
    sortie.setAttribute("data-deconnexion", "");
    sortie.setAttribute("data-propre", "");
    sortie.addEventListener("click", function (e) {
      e.preventDefault();
      if (!window.confirm("Veux-tu vraiment te déconnecter ?")) { return; }
      var aller = function () { window.location.href = RACINE + "connexion.html"; };
      if (window.firebase && window.firebase.auth) { window.firebase.auth().signOut().then(aller, aller); } else { aller(); }
    });
    liens.appendChild(sortie);
    interieur.appendChild(liens);
    panneau.appendChild(interieur);
    header.appendChild(haut);
    header.appendChild(panneau);
    return header;
  }

  function blocVideo(v, titre) {
    var lienVideo = urlSure(v.lien);
    if (!lienVideo) { return null; }
    var d = el("details", "pc-video");
    d.appendChild(el("summary", "", "🎥 Vidéo de la séquence"));
    var cadre = el("div", "pc-cadre");
    d.appendChild(cadre);
    // la vidéo ne se charge que si l'élève l'ouvre (économise ses données mobiles)
    d.addEventListener("toggle", function () {
      if (!d.open || cadre.firstChild) { return; }
      var f = el("iframe");
      f.src = lienVideo;
      f.title = titre || "Vidéo";
      f.setAttribute("loading", "lazy");
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      f.setAttribute("allowfullscreen", "");
      cadre.appendChild(f);
    });
    return d;
  }

  function blocFiches(v) {
    var pdf = urlSure(v.ficheUrl), word = urlSure(v.ficheWordUrl);
    if (!pdf && !word) { return null; }
    var zone = el("div", "pc-fiches");
    if (pdf) { zone.appendChild(lien("📄 Fiche de la séquence (PDF)", pdf, true)); }
    if (word) { zone.appendChild(lien("📝 Fiche de la séquence (Word)", word, true)); }
    return zone;
  }

  function corpsSequence(it) {
    var corps = el("div", "pc-corps");
    var titre = (it.cours && it.cours.seqLabel) || (it.video && it.video.seqLabel) || "";
    if (aVideo(it.video)) {
      var bv = blocVideo(it.video, titre);
      if (bv) { corps.appendChild(bv); }
      var bf = blocFiches(it.video);
      if (bf) { corps.appendChild(bf); }
    }
    if (aContenu(it.cours)) {
      var c = it.cours;
      var zone = el("div", "pc-html");
      if (c.contenu) { zone.innerHTML = String(c.contenu); }   // HTML écrit par l'admin, comme avant
      if (urlSure(c.lien)) {
        var p = el("p");
        p.appendChild(lien("📄 Ouvrir le cours", urlSure(c.lien), true));
        zone.appendChild(p);
      }
      if (urlSure(c.image)) {
        var img = el("img");
        img.src = urlSure(c.image);
        img.alt = titre || "Cours";
        zone.appendChild(img);
      }
      corps.appendChild(zone);
    } else {
      corps.appendChild(el("p", "pc-vide", "Le cours de cette séquence sera bientôt disponible."));
    }
    return corps;
  }

  function etiquetteSA(id, liste) {
    for (var i = 0; i < liste.length; i++) {
      var l = (liste[i].cours && liste[i].cours.saLabel) || (liste[i].video && liste[i].video.saLabel);
      if (l) { return String(l); }
    }
    var m = String(id).match(/^sa(\d+)$/i);
    return m ? "SA " + m[1] : (id ? String(id).toUpperCase() : "Cours");
  }

  function etiquetteSeq(it) {
    var l = (it.cours && it.cours.seqLabel) || (it.video && it.video.seqLabel);
    if (l) { return String(l); }
    var m = String(it.key).match(/seq(\d+)/i);
    return m ? "Séquence " + m[1] : String(it.key);
  }

  // Regroupe par SA (ordre des clés), SA et séquences repliées
  function remplir(panneau, liste, fabriquerCorps) {
    var groupes = [], index = {};
    liste.forEach(function (it) {
      var id = String(it.key).split("_").length > 1 ? String(it.key).split("_")[0] : "";
      if (!index.hasOwnProperty(id)) { index[id] = { id: id, items: [] }; groupes.push(index[id]); }
      index[id].items.push(it);
    });
    groupes.forEach(function (g) {
      var sa = el("details", "pc-sa");
      sa.appendChild(el("summary", "", etiquetteSA(g.id, g.items)));
      g.items.forEach(function (it) {
        var seq = el("details", "pc-seq");
        seq.appendChild(el("summary", "", etiquetteSeq(it)));
        seq.appendChild(fabriquerCorps(it));
        sa.appendChild(seq);
      });
      panneau.appendChild(sa);
    });
  }

  function corpsVideoSeul(it) {
    var corps = el("div", "pc-corps");
    var bv = blocVideo(it.video, etiquetteSeq(it));
    if (bv) { bv.open = false; corps.appendChild(bv); }
    var bf = blocFiches(it.video);
    if (bf) { corps.appendChild(bf); }
    return corps;
  }

  /* ------------------------------------------------------------------ */
  /* Construction de la page                                             */
  /* ------------------------------------------------------------------ */
  function construire() {
    document.title = PAGE.matiere + " " + PAGE.classeNom + " - Campus Flex";
    var st = el("style", "", CSS);
    st.id = "pc-style";
    document.head.appendChild(st);

    var ancre = script && script.parentNode === document.body ? script : null;
    function poser(n) { if (ancre) { document.body.insertBefore(n, ancre); } else { document.body.appendChild(n); } }

    poser(construireEntete());

    var main = el("main");
    main.appendChild(el("p", "salut ecrit", PAGE.matiere + " · " + PAGE.classeNom));

    var carte = el("section", "carte");
    var onglets = el("div", "pc-onglets");
    onglets.setAttribute("role", "tablist");
    var bCours = el("button", "pc-onglet", "Cours");
    var bVideos = el("button", "pc-onglet", "Vidéos");
    [bCours, bVideos].forEach(function (b) { b.type = "button"; b.setAttribute("role", "tab"); });
    onglets.appendChild(bCours);
    onglets.appendChild(bVideos);

    var pCours = el("div", "pc-panneau");
    var pVideos = el("div", "pc-panneau");
    pCours.appendChild(el("p", "pc-info", "Chargement des cours…"));
    pVideos.appendChild(el("p", "pc-info", "Chargement des vidéos…"));

    function choisir(nom) {
      var v = nom === "videos";
      pCours.hidden = v;
      pVideos.hidden = !v;
      bCours.setAttribute("aria-selected", v ? "false" : "true");
      bVideos.setAttribute("aria-selected", v ? "true" : "false");
    }
    bCours.addEventListener("click", function () {
      choisir("cours");
      try { history.replaceState(null, "", "#cours"); } catch (e) {}
    });
    bVideos.addEventListener("click", function () {
      choisir("videos");
      try { history.replaceState(null, "", "#videos"); } catch (e) {}
    });
    choisir(window.location.hash === "#videos" ? "videos" : "cours");

    carte.appendChild(onglets);
    carte.appendChild(pCours);
    carte.appendChild(pVideos);
    main.appendChild(carte);

    var retour = el("div", "pc-retour");
    var btnRetour = lien("← Retour à " + PAGE.matiere, "../index.html");
    btnRetour.className = "btn sec";
    retour.appendChild(btnRetour);
    main.appendChild(retour);
    poser(main);

    var pied = el("footer");
    pied.appendChild(document.createTextNode("© 2026 Campus Flex - Tous droits réservés - "));
    pied.appendChild(lien("Contact", RACINE + "contact.html"));
    poser(pied);

    if (LANGUES[PAGE.dossier] && !window.__cfTraducteur && !document.querySelector('script[src*="traducteur.js"]')) {
      var t = document.createElement("script");
      t.src = RACINE + "traducteur.js";
      document.head.appendChild(t);
    }

    return { pCours: pCours, pVideos: pVideos };
  }

  function afficherDonnees(zones, cours, videos) {
    var items = {};
    function item(k) { return items[k] || (items[k] = { key: k }); }
    if (plein(cours)) { Object.keys(cours).forEach(function (k) { if (plein(cours[k])) { item(k).cours = cours[k]; } }); }
    if (plein(videos)) { Object.keys(videos).forEach(function (k) { if (plein(videos[k])) { item(k).video = videos[k]; } }); }

    var tous = Object.keys(items).sort(function (a, b) {
      var x = cleNaturelle(a), y = cleNaturelle(b);
      return x < y ? -1 : x > y ? 1 : 0;
    }).map(function (k) { return items[k]; });

    var pourCours = tous.filter(function (it) { return aContenu(it.cours) || aVideo(it.video); });
    var pourVideos = tous.filter(function (it) { return aVideo(it.video); });

    zones.pCours.textContent = "";
    zones.pVideos.textContent = "";

    if (pourCours.length) { remplir(zones.pCours, pourCours, corpsSequence); }
    else { zones.pCours.appendChild(el("p", "pc-info", "Le programme de " + PAGE.matiere + " pour la " + PAGE.classeNom + " sera bientôt ajouté ici.")); }

    if (pourVideos.length) { remplir(zones.pVideos, pourVideos, corpsVideoSeul); }
    else { zones.pVideos.appendChild(el("p", "pc-info", "Les vidéos de " + PAGE.matiere + " pour la " + PAGE.classeNom + " seront bientôt disponibles.")); }
  }

  function charger(zones) {
    var db = window.firebase.database();
    function lire(chemin) {
      return db.ref(chemin).once("value").then(function (snap) {
        return snap && snap.exists() ? snap.val() : null;
      }, function (e) { console.error("Lecture impossible :", chemin, e); return null; });
    }
    var base = PAGE.classeId + "/" + PAGE.matiere;
    Promise.all([lire("cours/" + base), lire("videos/" + base)]).then(function (r) {
      afficherDonnees(zones, r[0], r[1]);
    });
  }

  function demarrer() {
    if (!PAGE) {
      var m = el("main");
      m.appendChild(el("p", "erreur", "Page de classe non reconnue. Vérifie le nom des dossiers (matière/classe)."));
      document.body.appendChild(m);
      return;
    }
    var zones = construire();

    if (!window.firebase || !window.firebase.auth || !window.firebase.database) {
      zones.pCours.textContent = "";
      zones.pCours.appendChild(el("p", "erreur", "Service indisponible pour le moment."));
      return;
    }

    window.firebase.auth().onAuthStateChanged(function (user) {
      if (!user) { window.location.href = RACINE + "connexion.html"; return; }
      window.firebase.database().ref("administrateurs/" + user.uid).once("value").then(function (snapAdmin) {
        if (snapAdmin && snapAdmin.exists()) { window.location.href = RACINE + "admin.html"; return; }
        charger(zones);
      }, function () { charger(zones); });
    });
  }

  demarrer();
})();
