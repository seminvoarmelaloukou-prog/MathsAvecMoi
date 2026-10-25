// edt-lib.js - Emploi du temps : aperçu à l'écran et PDF (A4 paysage) avec l'en-tête des bulletins et la signature du directeur
// Expose window.CF_EDT : preparer(donnees, mode, cible), afficher(element, modele), pdf(modele)
//   donnees = { classes, profs, seances, config }   (lus dans edt/classes, edt/profs, edt/seances, bulletins_config)
//   mode    = "classe" (cible = identifiant de la classe) | "uid" (cible = identifiant de l'enseignant) | "code" (cible = code enseignant)
(function () {
  var base = document.currentScript.src.replace(/[^\/]*$/, "");
  var CDN = {
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    autotable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"
  };
  var JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  var COORD_DEFAUT = "Email : seminvoarmelaloukou@gmail.com\nWhatsApp : +229 01 98 81 69 11\nCommune de Karimama, Bénin";
  var ANCIEN = "seminvoarmelaloukou-prog.github.io/MathsAvecMoi";
  var COULEURS = {
    "Mathématiques": [219, 231, 255], "Français": [255, 227, 227], "Anglais": [221, 245, 221], "PCT": [255, 240, 204],
    "SVT": [214, 245, 234], "Histoire-Géographie": [240, 228, 255], "Espagnol": [255, 233, 214], "Allemand": [232, 232, 232],
    "EPS": [215, 242, 247], "Éducation civique": [247, 240, 200], "Philosophie": [236, 224, 216]
  };
  var AUTRE = [238, 241, 252];

  // ---------- utilitaires ----------
  var charges = {};
  function charger(url) {
    if (!charges[url]) charges[url] = new Promise(function (ok, ko) {
      var s = document.createElement("script"); s.src = url; s.onload = ok;
      s.onerror = function () { ko(new Error("Chargement impossible : " + url)); };
      document.head.appendChild(s);
    });
    return charges[url];
  }
  var imgs = {};
  function image(nom) { // { data, w, h } ou null si le fichier est absent
    if (!imgs[nom]) imgs[nom] = fetch(base + nom).then(function (r) { if (!r.ok) throw new Error("absent"); return r.blob(); }).then(function (blob) {
      return new Promise(function (ok) {
        var fr = new FileReader();
        fr.onload = function () { var im = new Image(); im.onload = function () { ok({ data: fr.result, w: im.naturalWidth, h: im.naturalHeight }); }; im.onerror = function () { ok(null); }; im.src = fr.result; };
        fr.onerror = function () { ok(null); }; fr.readAsDataURL(blob);
      });
    }).catch(function () { return null; });
    return imgs[nom];
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function mn(h) { var p = String(h || "0:0").split(":"); return +p[0] * 60 + +p[1]; }
  function nomFichier(s) { return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, ""); }
  function libClasse(classes, id) { var c = (classes || {})[id]; return c ? (c.niveau + " " + c.nom).trim() : "Classe"; }
  function couleur(m) { return COULEURS[m] || AUTRE; }
  function rgb(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }

  // ---------- préparation du modèle ----------
  function preparer(d, mode, cible) {
    var cfg = d.config || {};
    var coord = (!cfg.coordonnees || cfg.coordonnees === ANCIEN) ? COORD_DEFAUT : cfg.coordonnees;
    var profs = d.profs || {}, classes = d.classes || {};
    var liste = Object.keys(d.seances || {}).map(function (id) { return d.seances[id]; }).filter(function (s) {
      if (mode === "classe") return s.classeId === cible;
      if (mode === "uid") return s.uid === cible;
      return s.code === cible;
    });
    var items = liste.map(function (s) {
      var p = profs[s.code] || {};
      return { jour: s.jour, debut: s.debut, fin: s.fin, matiere: p.matiere || s.code || "", enseignant: p.nom || "", classe: libClasse(classes, s.classeId) };
    });
    var jours = JOURS.filter(function (j) { return items.some(function (i) { return i.jour === j; }); });
    var cles = [];
    items.forEach(function (i) { var k = i.debut + "|" + i.fin; if (cles.indexOf(k) === -1) cles.push(k); });
    cles.sort(function (a, b) { var x = a.split("|"), y = b.split("|"); return mn(x[0]) - mn(y[0]) || mn(x[1]) - mn(y[1]); });
    var grille = cles.map(function (k) {
      return {
        horaire: k.split("|").join(" - "),
        cases: jours.map(function (j) {
          return items.filter(function (i) { return i.jour === j && i.debut + "|" + i.fin === k; }).map(function (i) {
            return mode === "classe" ? { haut: i.matiere, bas: i.enseignant, matiere: i.matiere } : { haut: i.matiere, bas: i.classe, matiere: i.matiere };
          });
        })
      };
    });
    var sous;
    if (mode === "classe") sous = "Classe : " + libClasse(classes, cible);
    else if (mode === "uid") sous = "Emploi du temps de l'enseignant (toutes ses classes)";
    else sous = "Enseignant : " + ((profs[cible] || {}).nom || cible) + " (" + ((profs[cible] || {}).matiere || "") + ")";
    return {
      mode: mode, cible: cible, sous: sous, annee: cfg.annee || "", etablissement: cfg.etablissement || "Campus Flex",
      coordonnees: coord, directeur: cfg.directeur || "", jours: jours, grille: grille, total: items.length
    };
  }

  // ---------- aperçu à l'écran ----------
  var styleOk = false;
  function ensureStyle() {
    if (styleOk) return; styleOk = true;
    var st = document.createElement("style");
    st.textContent =
      ".cf-e{border:2px solid #2c3e8c;border-radius:8px;padding:12px;background:#fff;font-size:13px;color:#222;margin-top:12px}" +
      ".cf-e .rep{text-align:center;font-weight:bold;letter-spacing:1px;font-size:13px}" +
      ".cf-e .min{text-align:center;font-size:11px;color:#555;font-style:italic;margin:2px 0 8px}" +
      ".cf-e .haut{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".cf-e .haut img{height:34px;width:auto}.cf-e .coord{font-size:11px;color:#666;text-align:right}" +
      ".cf-e .titre{background:#2c3e8c;color:#fff;text-align:center;font-weight:bold;padding:5px;margin:8px 0 4px;border-radius:4px}" +
      ".cf-e .sous{text-align:center;font-weight:bold;margin:6px 0 8px}" +
      ".cf-e .tab{overflow-x:auto}.cf-e table{width:100%;border-collapse:collapse}" +
      ".cf-e th{background:#2c3e8c;color:#fff;padding:6px 4px;font-size:12px}" +
      ".cf-e td{padding:5px 4px;text-align:center;border:1px solid #c5cdea;font-size:12px;min-width:90px}" +
      ".cf-e td.h{background:#eef1fc;font-weight:bold;white-space:nowrap}" +
      ".cf-e td small{display:block;color:#555;font-size:11px}" +
      ".cf-e .pied{display:flex;justify-content:flex-end;margin-top:12px}.cf-e .sig{text-align:center}";
    document.head.appendChild(st);
  }
  function html(m) {
    ensureStyle();
    var h = '<div class="cf-e"><div class="rep">RÉPUBLIQUE DU BÉNIN</div>' +
      '<div class="min">Ministère des Enseignements Secondaire, Technique et de la Formation Professionnelle</div>' +
      '<div class="haut"><img src="' + base + 'logo-campus-flex.svg" alt="Campus Flex">' +
      '<div class="coord"><b>' + esc(m.etablissement) + "</b><br>" + String(m.coordonnees).split(/\r?\n/).map(esc).join("<br>") + "</div></div>" +
      '<div class="titre">EMPLOI DU TEMPS</div>' +
      '<div class="sous">' + esc(m.sous) + (m.annee ? " - Année scolaire " + esc(m.annee) : "") + "</div>";
    if (!m.total) return h + "<p>Aucune séance enregistrée.</p></div>";
    h += '<div class="tab"><table><thead><tr><th>Horaire</th>' + m.jours.map(function (j) { return "<th>" + esc(j) + "</th>"; }).join("") + "</tr></thead><tbody>";
    m.grille.forEach(function (l) {
      h += '<tr><td class="h">' + esc(l.horaire) + "</td>";
      l.cases.forEach(function (c) {
        if (!c.length) { h += "<td></td>"; return; }
        h += '<td style="background:' + rgb(couleur(c[0].matiere)) + '">' + c.map(function (x) { return "<b>" + esc(x.haut) + "</b>" + (x.bas ? "<small>" + esc(x.bas) + "</small>" : ""); }).join("<hr>") + "</td>";
      });
      h += "</tr>";
    });
    h += '</tbody></table></div><div class="pied"><div class="sig">Le Directeur<br><img src="' + base + 'signature-directeur.png" alt="" style="height:54px;width:auto;display:block;margin:2px auto" onerror="this.remove()"><b>' + esc(m.directeur) + "</b></div></div></div>";
    return h;
  }
  function afficher(el, m) { el.innerHTML = html(m); }

  // ---------- PDF (A4 paysage) ----------
  function pdf(m) {
    return Promise.all([charger(CDN.jspdf).then(function () { return charger(CDN.autotable); }), image("logo-campus-flex.png"), image("signature-directeur.png")]).then(function (r) {
      var lg = r[1], sg = r[2];
      var doc = new window.jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      var W = 297, H = 210, M = 12, IND = [44, 62, 140];

      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30);
      doc.text("RÉPUBLIQUE DU BÉNIN", W / 2, 10, { align: "center" });
      doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(80);
      doc.text("Ministère des Enseignements Secondaire, Technique et de la Formation Professionnelle", W / 2, 15, { align: "center" });
      if (lg) { var hl = 11; doc.addImage(lg.data, "PNG", M, 18, hl * lg.w / lg.h, hl); }
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(90);
      doc.text(String(m.etablissement || ""), W - M, 20, { align: "right" });
      doc.setFont("helvetica", "normal");
      String(m.coordonnees || "").split(/\r?\n/).filter(Boolean).slice(0, 4).forEach(function (l, i) { doc.text(l, W - M, 23.6 + i * 3.5, { align: "right" }); });

      doc.setFillColor(IND[0], IND[1], IND[2]); doc.rect(M, 33, W - 2 * M, 8, "F");
      doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.text("EMPLOI DU TEMPS", W / 2, 38.7, { align: "center" });
      doc.setTextColor(30); doc.setFontSize(10.5);
      doc.text(m.sous + (m.annee ? "   -   Année scolaire " + m.annee : ""), W / 2, 47, { align: "center" });

      var y = 52;
      if (!m.total) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.text("Aucune séance enregistrée.", W / 2, y + 10, { align: "center" });
      } else {
        var meta = [];
        var corps = m.grille.map(function (l) {
          var ligne = [l.horaire], mt = [];
          l.cases.forEach(function (c) {
            ligne.push(c.map(function (x) { return x.haut + (x.bas ? "\n" + x.bas : ""); }).join("\n---\n"));
            mt.push(c.length ? c[0].matiere : null);
          });
          meta.push(mt);
          return ligne;
        });
        doc.autoTable({
          startY: y, margin: { left: M, right: M }, theme: "grid",
          head: [["Horaire"].concat(m.jours)], body: corps,
          styles: { fontSize: 9, cellPadding: 2.4, halign: "center", valign: "middle", lineColor: [170, 180, 215], lineWidth: 0.2, textColor: 30, minCellHeight: 14 },
          headStyles: { fillColor: IND, textColor: 255, fontSize: 10 },
          columnStyles: { 0: { halign: "center", fontStyle: "bold", cellWidth: 30, fillColor: [238, 241, 252] } },
          didParseCell: function (d) {
            if (d.section === "body" && d.column.index > 0) {
              var mat = meta[d.row.index] && meta[d.row.index][d.column.index - 1];
              if (mat) d.cell.styles.fillColor = couleur(mat);
            }
          }
        });
        y = doc.lastAutoTable.finalY + 8;
      }
      if (y > H - 48) { doc.addPage(); y = 22; }
      var cx = W - M - 45;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30);
      doc.text("Le Directeur", cx, y, { align: "center" });
      if (sg) {
        var sw = 42, sh = sw * sg.h / sg.w;
        if (sh > 17) { sh = 17; sw = sh * sg.w / sg.h; }
        doc.addImage(sg.data, "PNG", cx - sw / 2, y + 2.5, sw, sh);
      }
      doc.setFont("helvetica", "normal"); doc.text(String(m.directeur || ""), cx, y + 22, { align: "center" });
      doc.setFontSize(7.5); doc.setTextColor(130);
      doc.text("Document généré par " + (m.etablissement || "Campus Flex") + " le " + new Date().toLocaleDateString("fr-FR"), W / 2, H - 6, { align: "center" });
      doc.save("Emploi_du_temps_" + nomFichier(m.sous.replace(/^[^:]*:\s*/, "")) + ".pdf");
    });
  }

  window.CF_EDT = { preparer: preparer, afficher: afficher, pdf: pdf, libClasse: libClasse };
})();
