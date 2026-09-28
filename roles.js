// roles.js : permet à un enseignant actif d'utiliser les pages admin,
// limité aux matières et classes que l'administrateur lui a attribuées.
// Chargé après firebase-config.js. La vraie protection est dans database.rules.json.

window.RoleAcces = { role: "admin", profil: null };

window.chargerRole = function(uid) {
  return db.ref("administrateurs/" + uid).once("value").then(function(snap) {
    if (snap.exists()) {
      RoleAcces.role = "admin";
      return snap;
    }
    return db.ref("enseignants/" + uid).once("value").then(function(s) {
      const p = s.val();
      if (p && p.statut === "actif") {
        RoleAcces.role = "enseignant";
        RoleAcces.profil = p;
        return {
          exists: function() { return true; },
          val: function() {
            return { nom: ((p.prenom || "") + " " + (p.nom || "")).trim(), email: p.email };
          }
        };
      }
      return snap; // compte ni admin ni enseignant actif : la page affiche son erreur
    });
  });
};

window.restreindreSelecteurs = function(idMatiere, idClasse, cartesAMasquer) {
  if (RoleAcces.role !== "enseignant") return;
  const p = RoleAcces.profil;

  function filtrer(id, permis) {
    const select = document.getElementById(id);
    if (!select) return;
    Array.prototype.slice.call(select.options).forEach(function(o) {
      if (o.value && !permis[o.value]) o.remove();
    });
  }
  filtrer(idMatiere, p.matieres || {});
  filtrer(idClasse, p.classes || {});

  if (cartesAMasquer && cartesAMasquer.length) {
    const css = document.createElement("style");
    css.textContent = cartesAMasquer.map(function(i) { return "#" + i; }).join(",") + "{display:none!important}";
    document.head.appendChild(css);
  }

  const interdits = ["admin-eleves.html", "admin-resultats.html", "admin-coefficients.html", "admin-utilisateurs.html"];
  document.querySelectorAll("nav a").forEach(function(a) {
    const h = a.getAttribute("href") || "";
    if (h === "admin.html") a.setAttribute("href", "enseignant.html");
    else if (interdits.indexOf(h) >= 0 && a.parentNode) a.parentNode.style.display = "none";
  });
};
