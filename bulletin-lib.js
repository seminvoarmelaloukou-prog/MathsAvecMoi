// bulletin-lib.js - affichage, PDF et Excel des bulletins (Campus Flex)
// Expose window.CF_BULLETIN : html(b), pdf(b), pdfClasse(liste), excelClasse(liste, classe, sem), excelNotes(opts)
(function () {
  var base = document.currentScript.src.replace(/[^\/]*$/, "");
  var CDN = {
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    autotable: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js",
    exceljs: "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"
  };
  var QR_URLS = ["https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js", "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"];
  var INDIGO_RGB = [44, 62, 140], INDIGO_ARGB = "FF2C3E8C", CLAIR_ARGB = "FFEEF1FC", BORD_ARGB = "FFAAB4D7";

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
  function chargerQR() { return charger(QR_URLS[0]).catch(function () { return charger(QR_URLS[1]); }); }
  var logoCache = null;
  function logo() { // { data, w, h } ou null
    if (!logoCache) logoCache = fetch(base + "logo-campus-flex.png").then(function (r) { return r.blob(); }).then(function (blob) {
      return new Promise(function (ok) {
        var fr = new FileReader();
        fr.onload = function () { var im = new Image(); im.onload = function () { ok({ data: fr.result, w: im.naturalWidth, h: im.naturalHeight }); }; im.onerror = function () { ok(null); }; im.src = fr.result; };
        fr.onerror = function () { ok(null); }; fr.readAsDataURL(blob);
      });
    }).catch(function () { return null; });
    return logoCache;
  }
  var sigCache = null;
  function signature() { // { data, w, h } ou null si signature-directeur.png est absent
    if (!sigCache) sigCache = fetch(base + "signature-directeur.png").then(function (r) { if (!r.ok) throw new Error("absent"); return r.blob(); }).then(function (blob) {
      return new Promise(function (ok) {
        var fr = new FileReader();
        fr.onload = function () { var im = new Image(); im.onload = function () { ok({ data: fr.result, w: im.naturalWidth, h: im.naturalHeight }); }; im.onerror = function () { ok(null); }; im.src = fr.result; };
        fr.onerror = function () { ok(null); }; fr.readAsDataURL(blob);
      });
    }).catch(function () { return null; });
    return sigCache;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(v) { return typeof v === "number"; }
  function fmt(v) { return num(v) ? v.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1") : ""; }
  function f2(v) { return num(v) ? v.toFixed(2) : ""; }
  function dateFr(d) { return d ? d.split("-").reverse().join("/") : ""; }
  function naissance(e) { return dateFr(e.dateNaissance) + (e.lieuNaissance ? " à " + e.lieuNaissance : ""); }
  function nomFichier(s) { return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, ""); }
  function aujourdhui() { return new Date().toLocaleDateString("fr-FR"); }
  function sauver(blob, nom) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nom;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  // ---------- QR code de vérification ----------
  function codeAffiche(c) { return String(c).replace(/(.{4})(?=.)/g, "$1-"); }
  function urlVerif(b) { return base + "verifier.html?c=" + encodeURIComponent(b.codeVerif); }
  function qrMatrix(texte) {
    var q = window.qrcode(0, "M"); q.addData(texte); q.make();
    return { n: q.getModuleCount(), dark: function (r, c) { return q.isDark(r, c); } };
  }
  function qrSVG(texte) {
    var m = qrMatrix(texte), Q = 3, t = m.n + 2 * Q, d = "";
    for (var r = 0; r < m.n; r++) for (var c = 0; c < m.n; c++) if (m.dark(r, c)) d += "M" + (c + Q) + " " + (r + Q) + "h1v1h-1z";
    return '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ' + t + " " + t + '" shape-rendering="crispEdges"><rect width="' + t + '" height="' + t + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }
  function qrPNG(texte, px) {
    var m = qrMatrix(texte), Q = 3, t = m.n + 2 * Q, u = Math.max(1, Math.floor(px / t));
    var cv = document.createElement("canvas"); cv.width = cv.height = t * u;
    var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = "#000";
    for (var r = 0; r < m.n; r++) for (var c = 0; c < m.n; c++) if (m.dark(r, c)) g.fillRect((c + Q) * u, (r + Q) * u, u, u);
    return cv.toDataURL("image/png");
  }
  function dessinerQR(doc, texte, x, y, size) {
    var m = qrMatrix(texte), u = size / m.n;
    doc.setFillColor(0, 0, 0);
    for (var r = 0; r < m.n; r++) for (var c = 0; c < m.n; c++) if (m.dark(r, c)) doc.rect(x + c * u, y + r * u, u + 0.03, u + 0.03, "F");
  }

  function totaux(b) {
    var c = 0, m = 0;
    (b.lignes || []).forEach(function (l) { if (num(l.moy)) { c += l.coef; m += l.moyCoef; } });
    return { coef: c, moyCoef: Math.round(m * 100) / 100 };
  }

  // ---------- affichage HTML ----------
  var styleOk = false;
  function ensureStyle() {
    if (styleOk) return; styleOk = true;
    var st = document.createElement("style");
    st.textContent =
      ".cf-b{border:2px solid #2c3e8c;border-radius:8px;padding:12px;background:#fff;font-size:13px;color:#222}" +
      ".cf-b .haut{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".cf-b .haut img{height:34px;width:auto}.cf-b .haut .coord{font-size:11px;color:#666;text-align:right}" +
      ".cf-b .rep{text-align:center;font-weight:bold;letter-spacing:1px;font-size:13px;color:#222}" +
      ".cf-b .min{text-align:center;font-size:11px;color:#555;font-style:italic;margin:2px 0 8px}" +
      ".cf-b .titre{background:#2c3e8c;color:#fff;text-align:center;font-weight:bold;padding:5px;margin:6px 0;border-radius:4px}" +
      ".cf-b .idt{margin:8px 0}" +
      ".cf-b .idt th{background:#eef1fc;color:#222;text-align:left;font-size:12px;width:22%;padding:5px 7px;border:1px solid #c5cdea}" +
      ".cf-b .idt td{text-align:left;font-weight:normal;font-size:12px;padding:5px 7px;border:1px solid #c5cdea;color:#222}" +
      ".cf-b .tab{overflow-x:auto}.cf-b table{width:100%;border-collapse:collapse}" +
      ".cf-b th{background:#2c3e8c;color:#fff;padding:5px 4px;font-size:12px}.cf-b td{padding:5px 4px;text-align:center;border-bottom:1px solid #dde3f5}" +
      ".cf-b td:first-child,.cf-b th:first-child{text-align:left;font-weight:bold}.cf-b tfoot td{background:#eef1fc;font-weight:bold}" +
      ".cf-b .bilan{display:flex;flex-wrap:wrap;gap:6px 24px;margin-top:10px;font-weight:bold}";
    document.head.appendChild(st);
  }
  function html(b) {
    ensureStyle();
    var e = b.eleve || {}, t = totaux(b);
    var h = '<div class="cf-b"><div class="rep">RÉPUBLIQUE DU BÉNIN</div>' +
      '<div class="min">Ministère des Enseignements Secondaire, Technique et de la Formation Professionnelle</div>' +
      '<div class="haut"><img src="' + base + 'logo-campus-flex.svg" alt="Campus Flex">' +
      '<div class="coord"><b>' + esc(b.etablissement) + "</b><br>" + String(b.coordonnees || "").split(/\r?\n/).map(esc).join("<br>") + "</div></div>" +
      '<div class="titre">BULLETIN DE NOTES</div>' +
      '<div class="tab"><table class="idt"><tbody>' +
      "<tr><th>Matricule</th><td>" + esc(e.matricule) + "</td><th>Année scolaire</th><td>" + esc(b.annee) + "</td></tr>" +
      "<tr><th>Nom</th><td>" + esc(e.nom) + "</td><th>Classe</th><td>" + esc(b.classe) + "</td></tr>" +
      "<tr><th>Prénoms</th><td>" + esc(e.prenom) + "</td><th>Effectif</th><td>" + esc(b.effectif) + "</td></tr>" +
      "<tr><th>Date de naissance</th><td>" + esc(naissance(e)) + "</td><th>Semestre</th><td>" + esc(String(b.semestre).charAt(1)) + "</td></tr>" +
      "<tr><th>Redoublant</th><td>" + (e.redoublant === "oui" ? "Oui" : "Non") + "</td><th>Aptitude en EPS</th><td>" + esc(e.aptitudeEps) + "</td></tr>" +
      "</tbody></table></div>" +
      '<div class="tab"><table><thead><tr><th>Disciplines</th><th>Coef</th><th>Moy. interro.</th><th>Devoir 1</th><th>Devoir 2</th><th>Moy/20</th><th>Moy coef</th><th>Rang</th><th>Appréciation</th></tr></thead><tbody>';
    (b.lignes || []).forEach(function (l) {
      h += "<tr><td>" + esc(l.libelle) + "</td><td>" + esc(l.coef) + "</td><td>" + fmt(l.i) + "</td><td>" + fmt(l.d1) + "</td><td>" + fmt(l.d2) + "</td><td>" + f2(l.moy) + "</td><td>" + f2(l.moyCoef) + "</td><td>" + esc(l.rang) + "</td><td>" + esc(l.appreciation) + "</td></tr>";
    });
    h += "</tbody><tfoot><tr><td>TOTAL</td><td>" + t.coef + "</td><td></td><td></td><td></td><td></td><td>" + t.moyCoef.toFixed(2) + "</td><td></td><td></td></tr></tfoot></table></div>" +
      '<div class="bilan"><span>Moy. Semestre ' + esc(String(b.semestre).charAt(1)) + " : " + (num(b.moySemestre) ? b.moySemestre.toFixed(2) : "-") + "</span><span>Rang : " + esc(b.rang || "-") + "</span><span>Sanction : " + esc(b.distinction || "-") + "</span></div>" +
      '<p style="margin-top:8px"><b>Appréciation :</b> ' + esc(b.appreciation) + "</p>" +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-top:10px">' +
      (b.codeVerif ? '<div style="font-size:10px;color:#666"><div class="cf-qr" data-url="' + esc(urlVerif(b)) + '" style="width:90px;height:90px"></div>Scanner pour vérifier<br>Code : ' + esc(codeAffiche(b.codeVerif)) + "</div>" : "<div></div>") +
      '<div style="text-align:right">Le Directeur<br><img src="' + base + 'signature-directeur.png" alt="" style="height:54px;width:auto;display:block;margin:2px 0 2px auto" onerror="this.remove()"><b>' + esc(b.directeur) + "</b></div></div></div>";
    return h;
  }

  // Affiche le bulletin dans un élément puis dessine le QR code
  function afficher(el, b) {
    el.innerHTML = html(b);
    if (!b.codeVerif) return;
    chargerQR().then(function () {
      Array.prototype.forEach.call(el.querySelectorAll(".cf-qr[data-url]"), function (n) { n.innerHTML = qrSVG(n.getAttribute("data-url")); });
    }).catch(function () {});
  }

  // ---------- PDF ----------
  function libsPDF() { return charger(CDN.jspdf).then(function () { return charger(CDN.autotable); }).then(function () { return chargerQR().catch(function () {}); }); }

  function dessinerPDF(doc, b, lg, sg) {
    var W = 210, M = 12, e = b.eleve || {}, t = totaux(b), IND = INDIGO_RGB;
    if (lg) { var hl = 11; doc.addImage(lg.data, "PNG", M, 18, hl * lg.w / lg.h, hl); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(90);
    doc.setFont("helvetica", "bold"); doc.text(String(b.etablissement || ""), W - M, 20, { align: "right" });
    doc.setFont("helvetica", "normal");
    String(b.coordonnees || "").split(/\r?\n/).filter(Boolean).slice(0, 4).forEach(function (l, i) { doc.text(l, W - M, 23.6 + i * 3.5, { align: "right" }); });
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(30);
    doc.text("RÉPUBLIQUE DU BÉNIN", W / 2, 10, { align: "center" });
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(80);
    doc.text("Ministère des Enseignements Secondaire, Technique et de la Formation Professionnelle", W / 2, 14.6, { align: "center" });
    doc.setFillColor(IND[0], IND[1], IND[2]); doc.rect(M, 33, W - 2 * M, 8, "F");
    doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("BULLETIN DE NOTES", W / 2, 38.7, { align: "center" });

    var grille = { fontSize: 9, cellPadding: 1.6, lineColor: [170, 180, 215], lineWidth: 0.2, textColor: 30 };
    doc.autoTable({
      startY: 44, margin: { left: M, right: M }, theme: "grid", styles: grille,
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 36, fillColor: [238, 241, 252] }, 2: { fontStyle: "bold", cellWidth: 36, fillColor: [238, 241, 252] } },
      body: [
        ["Matricule", String(e.matricule || ""), "Année scolaire", String(b.annee || "")],
        ["Nom", String(e.nom || ""), "Classe", String(b.classe || "")],
        ["Prénoms", String(e.prenom || ""), "Effectif", String(b.effectif || "")],
        ["Date de naissance", naissance(e), "Semestre", String(b.semestre).charAt(1)],
        ["Redoublant", e.redoublant === "oui" ? "Oui" : "Non", "Aptitude en EPS", String(e.aptitudeEps || "")]
      ]
    });

    var corps = (b.lignes || []).map(function (l) {
      return [l.libelle, String(l.coef), fmt(l.i), fmt(l.d1), fmt(l.d2), f2(l.moy), f2(l.moyCoef), String(l.rang || ""), String(l.appreciation || "")];
    });
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4, margin: { left: M, right: M }, theme: "grid",
      head: [["Disciplines", "Coef", "Moy. interro.", "Devoir 1", "Devoir 2", "Moy/20", "Moy coef", "Rang", "Appréciation"]],
      body: corps,
      foot: [["TOTAL", String(t.coef), "", "", "", "", t.moyCoef.toFixed(2), "", ""]],
      styles: { fontSize: 9, cellPadding: 2, halign: "center", lineColor: [170, 180, 215], lineWidth: 0.2, textColor: 30 },
      headStyles: { fillColor: IND, textColor: 255, fontSize: 8.5 },
      footStyles: { fillColor: [238, 241, 252], textColor: 30, fontStyle: "bold" },
      columnStyles: { 0: { halign: "left", fontStyle: "bold", cellWidth: 40 } }
    });

    var y = doc.lastAutoTable.finalY + 7, wg = 88, xd = M + wg + 5, wd = W - M - xd;
    doc.setFillColor(IND[0], IND[1], IND[2]); doc.rect(M, y, wg, 7, "F"); doc.rect(xd, y, wd, 7, "F");
    doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(9.5);
    doc.text("BILAN", M + wg / 2, y + 4.8, { align: "center" }); doc.text("SANCTION", xd + wd / 2, y + 4.8, { align: "center" });
    doc.setDrawColor(170, 180, 215); doc.setLineWidth(0.2); doc.rect(M, y + 7, wg, 14); doc.rect(xd, y + 7, wd, 14);
    doc.setTextColor(30); doc.setFontSize(9.5);
    doc.text("Moy. Semestre " + String(b.semestre).charAt(1) + " : " + (num(b.moySemestre) ? b.moySemestre.toFixed(2) : "-"), M + 3, y + 13);
    doc.text("Rang : " + String(b.rang || "-"), M + 3, y + 18.5);
    doc.text(doc.splitTextToSize(String(b.distinction || "-"), wd - 6), xd + 3, y + 13);

    y += 26;
    doc.rect(M, y, W - 2 * M, 16);
    doc.setFont("helvetica", "bold"); doc.text("Appréciation :", M + 3, y + 6);
    doc.setFont("helvetica", "normal"); doc.text(doc.splitTextToSize(String(b.appreciation || ""), W - 2 * M - 34), M + 32, y + 6);

    y += 24;
    doc.setFont("helvetica", "bold"); doc.text("Le Directeur", W - M - 40, y, { align: "center" });
    if (sg) {
      var sw = 40, sh = sw * sg.h / sg.w;
      if (sh > 17) { sh = 17; sw = sh * sg.w / sg.h; }
      doc.addImage(sg.data, "PNG", W - M - 40 - sw / 2, y + 2.5, sw, sh);
    }
    doc.setFont("helvetica", "normal"); doc.text(String(b.directeur || ""), W - M - 40, y + 22, { align: "center" });
    if (b.codeVerif && window.qrcode) {
      dessinerQR(doc, urlVerif(b), M, y - 3, 26);
      doc.setFontSize(7); doc.setTextColor(90);
      doc.text("Scanner pour vérifier ce bulletin", M, y + 26.5);
      doc.text("Code : " + codeAffiche(b.codeVerif), M, y + 30);
    }

    doc.setFontSize(7.5); doc.setTextColor(130);
    doc.text("Document généré par " + (b.etablissement || "Campus Flex") + " le " + aujourdhui(), W / 2, 289, { align: "center" });
  }

  function pdfClasse(liste) {
    return Promise.all([libsPDF(), logo(), signature()]).then(function (r) {
      var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
      liste.forEach(function (b, i) { if (i) doc.addPage(); dessinerPDF(doc, b, r[1], r[2]); });
      var b0 = liste[0] || {};
      doc.save("Bulletins_" + nomFichier(b0.classe || "classe") + "_S" + String(b0.semestre || "").charAt(1) + ".pdf");
    });
  }
  function pdf(b) {
    return Promise.all([libsPDF(), logo(), signature()]).then(function (r) {
      var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
      dessinerPDF(doc, b, r[1], r[2]);
      var e = b.eleve || {};
      doc.save("Bulletin_" + nomFichier(b.classe) + "_S" + String(b.semestre).charAt(1) + "_" + nomFichier((e.nom || "") + " " + (e.prenom || "")) + ".pdf");
    });
  }

  // ---------- Excel ----------
  var BORD = { top: { style: "thin", color: { argb: BORD_ARGB } }, left: { style: "thin", color: { argb: BORD_ARGB } }, bottom: { style: "thin", color: { argb: BORD_ARGB } }, right: { style: "thin", color: { argb: BORD_ARGB } } };
  var BLANC = { argb: "FFFFFFFF" };
  function put(ws, r, c1, c2, val, o) {
    o = o || {};
    if (c2 > c1) ws.mergeCells(r, c1, r, c2);
    for (var k = c1; k <= c2; k++) {
      var c = ws.getCell(r, k);
      if (o.border) c.border = BORD;
      if (o.fill) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: o.fill } };
    }
    var cell = ws.getCell(r, c1);
    cell.value = val;
    if (o.font) cell.font = o.font;
    if (o.align) cell.alignment = o.align;
    if (o.fmt) cell.numFmt = o.fmt;
    return cell;
  }
  var ENTETE = { font: { bold: true, color: BLANC }, fill: INDIGO_ARGB, border: true, align: { horizontal: "center", vertical: "middle", wrapText: true } };
  var CENTRE = { border: true, align: { horizontal: "center", vertical: "middle" } };
  var ETIQ = { font: { bold: true }, fill: CLAIR_ARGB, border: true, align: { vertical: "middle" } };
  var VALEUR = { border: true, align: { vertical: "middle" } };

  function nouveauClasseur(lg, sg) {
    var wb = new window.ExcelJS.Workbook(); wb.creator = "Campus Flex"; wb.created = new Date();
    var id = null, ext = null, sigId = null, sigExt = null;
    if (lg) { id = wb.addImage({ base64: lg.data, extension: "png" }); ext = { width: 190, height: Math.round(190 * lg.h / lg.w) }; }
    if (sg) { sigId = wb.addImage({ base64: sg.data, extension: "png" }); sigExt = { width: 120, height: Math.round(120 * sg.h / sg.w) }; }
    return { wb: wb, id: id, ext: ext, sigId: sigId, sigExt: sigExt };
  }
  function ecrire(wb, nom) {
    return wb.xlsx.writeBuffer().then(function (buf) {
      sauver(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), nom);
    });
  }
  function nomFeuille(s) { return String(s).replace(/[\[\]\*\?\/\\:]/g, "").slice(0, 31); }

  function feuilleEleve(K, b, idx) {
    var e = b.eleve || {}, t = totaux(b), n = (b.lignes || []).length;
    var ws = K.wb.addWorksheet(nomFeuille(idx + " - " + (e.nom || "") + " " + (e.prenom || "")),
      { pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 1 } });
    ws.columns = [30, 8, 13, 11, 11, 10, 11, 9, 18].map(function (w) { return { width: w }; });
    if (K.id !== null) ws.addImage(K.id, { tl: { col: 0.1, row: 2.15 }, ext: K.ext });
    var pet = { font: { italic: true, size: 9, color: { argb: "FF555555" } }, align: { horizontal: "right", vertical: "middle" } };
    put(ws, 1, 1, 9, "RÉPUBLIQUE DU BÉNIN", { font: { bold: true, size: 12 }, align: { horizontal: "center", vertical: "middle" } });
    put(ws, 2, 1, 9, "Ministère des Enseignements Secondaire, Technique et de la Formation Professionnelle", { font: pet.font, align: { horizontal: "center", vertical: "middle" } });
    put(ws, 3, 3, 9, b.etablissement || "", { font: { bold: true, size: 10 }, align: { horizontal: "right", vertical: "middle" } });
    put(ws, 4, 3, 9, String(b.coordonnees || "").split(/\r?\n/).filter(Boolean).join("  |  "),
      { font: pet.font, align: { horizontal: "right", vertical: "middle", wrapText: true } });
    ws.getRow(1).height = 20; ws.getRow(2).height = 16; ws.getRow(3).height = 17; ws.getRow(4).height = 32;
    put(ws, 5, 1, 9, "BULLETIN DE NOTES", { font: { bold: true, size: 14, color: BLANC }, fill: INDIGO_ARGB, align: { horizontal: "center", vertical: "middle" } });
    ws.getRow(5).height = 24;

    var id = [
      ["Matricule", e.matricule || "", "Année scolaire", b.annee || ""],
      ["Nom", e.nom || "", "Classe", b.classe || ""],
      ["Prénoms", e.prenom || "", "Effectif", b.effectif || ""],
      ["Date de naissance", naissance(e), "Semestre", String(b.semestre).charAt(1)],
      ["Redoublant", e.redoublant === "oui" ? "Oui" : "Non", "Aptitude en EPS", e.aptitudeEps || ""]
    ];
    id.forEach(function (l, i) {
      var r = 6 + i;
      put(ws, r, 1, 1, l[0], ETIQ); put(ws, r, 2, 4, l[1], VALEUR); put(ws, r, 5, 6, l[2], ETIQ); put(ws, r, 7, 9, l[3], VALEUR);
      ws.getRow(r).height = 18;
    });

    ["Disciplines", "Coef", "Moy. interro.", "Devoir 1", "Devoir 2", "Moy/20", "Moy coef", "Rang", "Appréciation"].forEach(function (h, i) { put(ws, 12, i + 1, i + 1, h, ENTETE); });
    ws.getRow(12).height = 22;
    (b.lignes || []).forEach(function (l, i) {
      var r = 13 + i, N = { border: true, align: { horizontal: "center", vertical: "middle" }, fmt: "0.00" };
      put(ws, r, 1, 1, l.libelle, { border: true, font: { bold: true }, align: { vertical: "middle" } });
      put(ws, r, 2, 2, l.coef, CENTRE);
      [l.i, l.d1, l.d2, l.moy, l.moyCoef].forEach(function (v, k) { put(ws, r, 3 + k, 3 + k, num(v) ? v : "", N); });
      put(ws, r, 8, 8, l.rang || "", CENTRE); put(ws, r, 9, 9, l.appreciation || "", CENTRE);
      ws.getRow(r).height = 19;
    });
    var rt = 13 + n, T = { border: true, fill: CLAIR_ARGB, font: { bold: true }, align: { horizontal: "center", vertical: "middle" } };
    put(ws, rt, 1, 1, "TOTAL", { border: true, fill: CLAIR_ARGB, font: { bold: true } });
    put(ws, rt, 2, 2, t.coef, T);
    [3, 4, 5, 6].forEach(function (c) { put(ws, rt, c, c, "", T); });
    put(ws, rt, 7, 7, t.moyCoef, Object.assign({ fmt: "0.00" }, T)); put(ws, rt, 8, 9, "", T);

    var r0 = rt + 2;
    put(ws, r0, 1, 4, "BILAN", ENTETE); put(ws, r0, 5, 9, "SANCTION", ENTETE);
    put(ws, r0 + 1, 1, 4, "Moy. Semestre " + String(b.semestre).charAt(1) + " : " + (num(b.moySemestre) ? b.moySemestre.toFixed(2) : "-") + "      Rang : " + (b.rang || "-"), { border: true, font: { bold: true }, align: { vertical: "middle" } });
    put(ws, r0 + 1, 5, 9, b.distinction || "-", { border: true, font: { bold: true }, align: { horizontal: "center", vertical: "middle", wrapText: true } });
    ws.getRow(r0 + 1).height = 26;
    put(ws, r0 + 3, 1, 9, "Appréciation : " + (b.appreciation || ""), { border: true, align: { vertical: "middle", wrapText: true } });
    ws.getRow(r0 + 3).height = 30;
    put(ws, r0 + 5, 6, 9, "Le Directeur", { font: { bold: true }, align: { horizontal: "center" } });
    ws.getRow(r0 + 6).height = 34;
    put(ws, r0 + 7, 6, 9, b.directeur || "", { align: { horizontal: "center" } });
    if (K.sigId !== null) ws.addImage(K.sigId, { tl: { col: 6.3, row: r0 + 5.05 }, ext: K.sigExt });
    if (b.codeVerif && window.qrcode) {
      var qid = K.wb.addImage({ base64: qrPNG(urlVerif(b), 240), extension: "png" });
      ws.addImage(qid, { tl: { col: 0.1, row: r0 + 3.3 }, ext: { width: 100, height: 100 } });
      put(ws, r0 + 9, 1, 4, "Scanner pour vérifier - Code : " + codeAffiche(b.codeVerif), { font: { size: 8, color: { argb: "FF666666" } } });
    }
    put(ws, r0 + 11, 1, 9, "Document généré par " + (b.etablissement || "Campus Flex") + " le " + aujourdhui(), { font: { size: 8, color: { argb: "FF888888" } }, align: { horizontal: "center" } });
  }

  function excelClasse(liste, classe, sem) {
    return Promise.all([charger(CDN.exceljs), logo(), chargerQR().catch(function () {}), signature()]).then(function (r) {
      var K = nouveauClasseur(r[1], r[3]), b0 = liste[0] || {};
      var libs = (b0.lignes || []).map(function (l) { return l.libelle; });
      var ws = K.wb.addWorksheet("Récapitulatif", { views: [{ state: "frozen", ySplit: 5 }] });
      var cols = 4 + libs.length + 2;
      ws.columns = [6, 14, 22, 22].concat(libs.map(function () { return 13; })).concat([14, 34]).map(function (w) { return { width: w }; });
      if (K.id !== null) ws.addImage(K.id, { tl: { col: 0.1, row: 0.2 }, ext: K.ext });
      put(ws, 2, 3, cols, (b0.etablissement || "Campus Flex") + " - Bulletins " + classe + " - Semestre " + String(sem).charAt(1) + " (" + (b0.annee || "") + ")",
        { font: { bold: true, size: 14, color: { argb: INDIGO_ARGB } }, align: { vertical: "middle" } });
      put(ws, 3, 3, cols, "Moyennes sur 20 par discipline, moyenne du semestre et rang", { font: { italic: true, color: { argb: "FF666666" } } });
      ws.getRow(2).height = 26;
      ["Rang", "Matricule", "Nom", "Prénoms"].concat(libs).concat(["Moy. semestre", "Distinction"]).forEach(function (h, i) { put(ws, 5, i + 1, i + 1, h, ENTETE); });
      ws.getRow(5).height = 32;
      liste.forEach(function (b, i) {
        var r = 6 + i, e = b.eleve || {};
        put(ws, r, 1, 1, b.rang || "", CENTRE); put(ws, r, 2, 2, e.matricule || "", VALEUR);
        put(ws, r, 3, 3, e.nom || "", { border: true, font: { bold: true } }); put(ws, r, 4, 4, e.prenom || "", VALEUR);
        libs.forEach(function (lib, k) {
          var l = (b.lignes || []).filter(function (x) { return x.libelle === lib; })[0];
          put(ws, r, 5 + k, 5 + k, l && num(l.moy) ? l.moy : "", Object.assign({ fmt: "0.00" }, CENTRE));
        });
        put(ws, r, 5 + libs.length, 5 + libs.length, num(b.moySemestre) ? b.moySemestre : "", Object.assign({ fmt: "0.00", font: { bold: true } }, CENTRE));
        put(ws, r, 6 + libs.length, 6 + libs.length, b.distinction || "", VALEUR);
      });
      liste.forEach(function (b, i) { feuilleEleve(K, b, i + 1); });
      return ecrire(K.wb, "Bulletins_" + nomFichier(classe) + "_S" + String(sem).charAt(1) + ".xlsx");
    });
  }

  // Feuille de notes d'une matière (enseignants) : opts = { titre, sousTitre, entetes[], lignes[][], fichier }
  function excelNotes(o) {
    return Promise.all([charger(CDN.exceljs), logo()]).then(function (r) {
      var K = nouveauClasseur(r[1]), ws = K.wb.addWorksheet("Notes");
      var nb = o.entetes.length;
      ws.columns = o.entetes.map(function (h, i) { return { width: i ? 14 : 30 }; });
      if (K.id !== null) ws.addImage(K.id, { tl: { col: 0.1, row: 0.2 }, ext: K.ext });
      put(ws, 2, 1, nb, o.titre, { font: { bold: true, size: 13, color: { argb: INDIGO_ARGB } }, align: { horizontal: "right", vertical: "middle" } });
      put(ws, 3, 1, nb, o.sousTitre || "", { font: { italic: true, color: { argb: "FF666666" } }, align: { horizontal: "right" } });
      ws.getRow(2).height = 24;
      o.entetes.forEach(function (h, i) { put(ws, 5, i + 1, i + 1, h, ENTETE); });
      ws.getRow(5).height = 24;
      o.lignes.forEach(function (l, i) {
        l.forEach(function (v, k) {
          put(ws, 6 + i, k + 1, k + 1, num(v) ? v : (v == null ? "" : v), k ? Object.assign({ fmt: "0.00" }, CENTRE) : { border: true });
        });
      });
      return ecrire(K.wb, o.fichier);
    });
  }

  window.CF_BULLETIN = { html: html, afficher: afficher, codeAffiche: codeAffiche, pdf: pdf, pdfClasse: pdfClasse, excelClasse: excelClasse, excelNotes: excelNotes };
})();
