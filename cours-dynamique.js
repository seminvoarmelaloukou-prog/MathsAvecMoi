/* =====================================================================
   cours-dynamique.js — Campus Flex
   Affiche, dans les pages de classe des matières SANS programme fixe,
   les cours et les vidéos dont les rubriques et les titres sont écrits
   par l'enseignant dans l'admin. Rien à faire dans les pages de classe :
   ce fichier est chargé automatiquement par firebase-config.js.
   ===================================================================== */
(function () {
  "use strict";

  // dossier de la matière  ->  nom de la matière dans l'admin
  var MATIERES = {
    "allemand": "Allemand",
    "anglais": "Anglais",
    "espagnol": "Espagnol",
    "eps": "EPS",
    "francais": "Français",
    "histoire-geo": "Histoire-Géographie",
    "histoire-geographie": "Histoire-Géographie",
    "philosophie": "Philosophie",
    "pct": "PCT",
    "svt": "SVT"
  };

  // dossier de la classe  ->  nom de la classe dans l'admin
  var CLASSES = {
    "6eme": "6e", "5eme": "5e", "4eme": "4e", "3eme": "3e",
    "2ndeab": "2de AB", "2ndec": "2de C", "2nded": "2de D", "2ndee": "2de E",
    "1reab": "1re AB", "1rec": "1re C", "1red": "1re D", "1ree": "1re E",
    "tleab": "Tle AB", "tlec": "Tle C", "tled": "Tle D", "tlee": "Tle E"
  };

  var ORDRE_VOLETS = ["Lecture", "Communication écrite"];

  function detecter() {
    var parts = window.location.pathname.split("/").filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
    if (parts.length && /\.html?$/i.test(parts[parts.length - 1])) parts.pop();
    if (parts.length < 2) return null;
    var classe = CLASSES[parts[parts.length - 1].toLowerCase()];
    var matiere = MATIERES[parts[parts.length - 2].toLowerCase()];
    return classe && matiere ? { classe: classe, matiere: matiere } : null;
  }

  function injecterStyle() {
    if (document.getElementById("style-cours-dynamique")) return;
    var s = document.createElement("style");
    s.id = "style-cours-dynamique";
    s.textContent =
      "#cours-dynamique{margin:10px 0 20px;}" +
      "#cours-dynamique .cd-header{cursor:pointer;user-select:none;}" +
      "#cours-dynamique .cd-header::after{content:'▸';float:right;transition:transform .2s;}" +
      "#cours-dynamique .cd-header.ouvert::after{transform:rotate(90deg);}" +
      "#cours-dynamique .cd-content{display:none;}" +
      "#cours-dynamique .cd-content.ouvert{display:block;}" +
      "#cours-dynamique .cd-volet{margin:18px 0 8px;padding:12px 16px;border-radius:12px;background:#1c2245;color:#fff;font-size:20px;font-weight:bold;}" +
      "#cours-dynamique .cd-sa{margin:12px 0 6px;padding:12px 16px;border-radius:10px;background:#2c3e8c;color:#fff;font-size:18px;font-weight:bold;}" +
      "#cours-dynamique .cd-seq{margin:10px 0 4px;padding:10px 4px;border-bottom:2px solid #dfe3f5;color:#2c3e8c;font-size:16px;font-weight:bold;}" +
      "#cours-dynamique .cd-contenu{background:#fff;border-radius:10px;padding:15px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.1);line-height:2;overflow-x:auto;}" +
      "#cours-dynamique .cd-contenu img{max-width:100%;height:auto;}" +
      "#cours-dynamique .cd-avenir{color:#999;font-style:italic;}" +
      "#cours-dynamique .cd-video{margin:0 0 14px;line-height:1.6;}" +
      "#cours-dynamique .cd-video>summary{cursor:pointer;display:inline-block;padding:8px 16px;border-radius:20px;background:#2c3e8c;color:#fff;font-weight:bold;font-size:14px;list-style:none;}" +
      "#cours-dynamique .cd-video>summary::-webkit-details-marker{display:none;}" +
      "#cours-dynamique .cd-cadre{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px;background:#000;margin-top:12px;}" +
      "#cours-dynamique .cd-cadre iframe{position:absolute;inset:0;width:100%;height:100%;border:none;}" +
      "#cours-dynamique .cd-fiches{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0 16px;line-height:1.6;}" +
      "#cours-dynamique .cd-fiches a,#cours-dynamique .cd-lien{display:inline-block;padding:8px 16px;border-radius:20px;background:#1f5c80;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;}";
    document.head.appendChild(s);
  }

  function nombre(v) { return typeof v === "number" ? v : 1e12; }

  function fusionner(cours, videos) {
    var items = {};
    function base(cle, x) {
      if (!items[cle]) items[cle] = { cle: cle, volet: "", sa: "", titre: "", ordre: null, cours: null, video: null };
      var it = items[cle];
      if (x.voletLabel && !it.volet) it.volet = x.voletLabel;
      if (x.saLabel && !it.sa) it.sa = x.saLabel;
      if (x.seqLabel && !it.titre) it.titre = x.seqLabel;
      if (typeof x.ordre === "number" && it.ordre === null) it.ordre = x.ordre;
      return it;
    }
    Object.keys(cours || {}).forEach(function (cle) {
      var c = cours[cle];
      if (!c || c.actif === false) return;
      base(cle, c).cours = c;
    });
    Object.keys(videos || {}).forEach(function (cle) {
      var v = videos[cle];
      if (!v || v.actif === false) return;
      base(cle, v).video = v;
    });
    return Object.keys(items).map(function (k) { return items[k]; });
  }

  function trier(items) {
    var minGroupe = {};
    items.forEach(function (it) {
      var g = it.volet + "|" + it.sa;
      minGroupe[g] = Math.min(minGroupe[g] === undefined ? 1e12 : minGroupe[g], nombre(it.ordre));
    });
    function rangVolet(v) {
      var i = ORDRE_VOLETS.indexOf(v);
      return i === -1 ? (v ? 99 : -1) : i;
    }
    return items.slice().sort(function (a, b) {
      if (rangVolet(a.volet) !== rangVolet(b.volet)) return rangVolet(a.volet) - rangVolet(b.volet);
      var ga = minGroupe[a.volet + "|" + a.sa], gb = minGroupe[b.volet + "|" + b.sa];
      if (ga !== gb) return ga - gb;
      if (a.sa !== b.sa) return a.sa < b.sa ? -1 : 1;
      if (nombre(a.ordre) !== nombre(b.ordre)) return nombre(a.ordre) - nombre(b.ordre);
      return a.cle < b.cle ? -1 : 1;
    });
  }

  function basculer(entete) {
    var contenu = entete.nextElementSibling;
    if (!contenu || !contenu.classList.contains("cd-content")) return;
    entete.classList.toggle("ouvert");
    contenu.classList.toggle("ouvert");
  }

  function entete(balise, classe, texte) {
    var h = document.createElement(balise);
    h.className = "cd-header " + classe;
    h.textContent = texte;
    h.addEventListener("click", function () { basculer(h); });
    return h;
  }

  function lienFiche(parent, href, texte) {
    var a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = texte;
    parent.appendChild(a);
  }

  function remplirItem(zone, it) {
    var c = it.cours || {}, v = it.video || {};
    var vide = true;

    if (v.lien) {
      vide = false;
      var det = document.createElement("details");
      det.className = "cd-video";
      var res = document.createElement("summary");
      res.textContent = "🎥 Vidéo";
      var cadre = document.createElement("div");
      cadre.className = "cd-cadre";
      var iframe = document.createElement("iframe");
      iframe.src = v.lien;
      iframe.title = it.titre || "Vidéo";
      iframe.loading = "lazy";
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      cadre.appendChild(iframe);
      det.appendChild(res);
      det.appendChild(cadre);
      zone.appendChild(det);
    }
    if (v.ficheUrl || v.ficheWordUrl) {
      vide = false;
      var f = document.createElement("div");
      f.className = "cd-fiches";
      if (v.ficheUrl) lienFiche(f, v.ficheUrl, "📄 Fiche (PDF)");
      if (v.ficheWordUrl) lienFiche(f, v.ficheWordUrl, "📝 Fiche (Word)");
      zone.appendChild(f);
    }
    if (c.contenu) {
      vide = false;
      var texte = String(c.contenu);
      var div = document.createElement("div");
      if (/<[a-z][\s\S]*>/i.test(texte)) {
        div.innerHTML = texte;
      } else {
        texte.split(/\n+/).forEach(function (l) {
          if (!l.trim()) return;
          var p = document.createElement("p");
          p.textContent = l;
          div.appendChild(p);
        });
      }
      zone.appendChild(div);
    }
    if (c.lien) {
      vide = false;
      var p2 = document.createElement("p");
      var a = document.createElement("a");
      a.className = "cd-lien"; a.href = c.lien; a.target = "_blank"; a.rel = "noopener";
      a.textContent = "Ouvrir le cours";
      p2.appendChild(a);
      zone.appendChild(p2);
    }
    if (c.image) {
      vide = false;
      var img = document.createElement("img");
      img.src = c.image; img.alt = it.titre || "";
      zone.appendChild(img);
    }
    if (vide) {
      var p3 = document.createElement("p");
      p3.className = "cd-avenir";
      p3.textContent = "Bientôt disponible";
      zone.appendChild(p3);
    }
  }

  function construire(items) {
    var racine = document.createElement("div");
    racine.id = "cours-dynamique";
    var voletCourant = null, saCourante = null, zoneVolet = racine, zoneSA = racine;

    trier(items).forEach(function (it) {
      if (it.volet !== voletCourant) {
        voletCourant = it.volet;
        saCourante = null;
        if (voletCourant) {
          racine.appendChild(entete("h2", "cd-volet", voletCourant));
          zoneVolet = document.createElement("div");
          zoneVolet.className = "cd-content";
          racine.appendChild(zoneVolet);
        } else {
          zoneVolet = racine;
        }
        zoneSA = zoneVolet;
      }
      if (it.sa !== saCourante) {
        saCourante = it.sa;
        if (saCourante) {
          zoneVolet.appendChild(entete("h3", "cd-sa", saCourante));
          zoneSA = document.createElement("div");
          zoneSA.className = "cd-content";
          zoneVolet.appendChild(zoneSA);
        } else {
          zoneSA = zoneVolet;
        }
      }
      zoneSA.appendChild(entete("h4", "cd-seq", it.titre || "Sans titre"));
      var zone = document.createElement("div");
      zone.className = "cd-content cd-contenu";
      remplirItem(zone, it);
      zoneSA.appendChild(zone);
    });
    return racine;
  }

  // Exposé pour d'éventuels aperçus
  window.CoursDynamique = { fusionner: fusionner, trier: trier, construire: construire };

  function demarrer() {
    var ctx = detecter();
    if (!ctx) return;
    var section = document.getElementById("cours");
    if (!section) return;
    if (section.querySelector(".devoir[data-key]")) return;     // page déjà gérée autrement
    if (typeof firebase === "undefined" || !firebase.auth || !firebase.database) return;

    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) return;
      var db = firebase.database();
      Promise.all([
        db.ref("cours/" + ctx.classe + "/" + ctx.matiere).once("value"),
        db.ref("videos/" + ctx.classe + "/" + ctx.matiere).once("value")
      ]).then(function (res) {
        var cours = res[0] && res[0].exists() ? res[0].val() : {};
        var videos = res[1] && res[1].exists() ? res[1].val() : {};
        var items = fusionner(cours, videos);
        if (!items.length) return;
        injecterStyle();
        var ancien = document.getElementById("cours-dynamique");
        if (ancien) ancien.remove();
        var racine = construire(items);
        var attente = section.querySelector(".video-bloc");
        if (attente) {
          attente.parentNode.insertBefore(racine, attente);
          attente.style.display = "none";
        } else {
          section.insertBefore(racine, section.firstChild);
        }
      }).catch(function (e) { console.error("Cours dynamiques :", e); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
