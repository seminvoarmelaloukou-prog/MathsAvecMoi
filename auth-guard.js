// Logo dans la barre du haut (chargé depuis logo-nav.js, dans le même dossier)
(function () {
  try {
    var s = document.currentScript;
    if (!s || !s.src || document.getElementById("cf-logo-script")) return;
    var l = document.createElement("script");
    l.id = "cf-logo-script";
    l.src = s.src.replace(/[^\/]*$/, "") + "logo-nav.js";
    document.head.appendChild(l);
  } catch (e) {}
})();

// auth-guard.js
// Vérifie que l'utilisateur est connecté, sinon redirige vers connexion.html
// Déconnecte automatiquement après 5 heures d'inactivité
// Enregistre la dernière visite (activité sur le site) dans connexions/{uid}

const DUREE_SESSION_MS = 5 * 60 * 60 * 1000; // 5 heures
const INTERVALLE_ENREGISTREMENT_MS = 10 * 60 * 1000; // 10 minutes

function mettreAJourActivite() {
  localStorage.setItem("lastActivity", Date.now().toString());
}

// Enregistre la dernière visite dans la base (au plus une fois toutes les 10 minutes)
function enregistrerConnexion(user) {
  try {
    if (!firebase.database || !user) return;
    const cle = "cf_derniere_ecriture_" + user.uid;
    const derniere = parseInt(localStorage.getItem(cle) || "0", 10);
    if (Date.now() - derniere < INTERVALLE_ENREGISTREMENT_MS) return;

    firebase.database().ref("connexions/" + user.uid).update({
      derniereConnexion: firebase.database.ServerValue.TIMESTAMP,
      email: user.email || null
    }).then(function() {
      localStorage.setItem(cle, Date.now().toString());
    }).catch(function() {});
  } catch (e) {}
}

function verifierSession() {
  const lastActivityStr = localStorage.getItem("lastActivity");
  const now = Date.now();

  if (lastActivityStr) {
    const lastActivity = parseInt(lastActivityStr, 10);
    if (now - lastActivity > DUREE_SESSION_MS) {
      // Session expirée : on déconnecte
      if (firebase.auth) {
        firebase.auth().signOut().then(function() {
          window.location.href = "/MathsAvecMoi/connexion.html";
        }).catch(function() {
          window.location.href = "/MathsAvecMoi/connexion.html";
        });
      } else {
        window.location.href = "/MathsAvecMoi/connexion.html";
      }
      return false;
    }
  }

  // Met à jour l'activité seulement après avoir vérifié qu'on n'a pas dépassé la durée
  mettreAJourActivite();
  return true;
}

// Initialisation : vérifier la session au chargement
window.addEventListener("load", function() {
  if (!firebase.auth) {
    console.warn("Firebase Auth non disponible dans auth-guard.js");
    return;
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // Pas connecté → redirection vers connexion
      window.location.href = "/MathsAvecMoi/connexion.html";
      return;
    }

    // Compte suspendu par l'administrateur : déconnexion immédiate
    if (firebase.database) {
      firebase.database().ref("suspensions/" + user.uid).once("value").then(function(snap) {
        if (snap.exists()) {
          firebase.auth().signOut().then(function() {
            window.location.href = "/MathsAvecMoi/connexion.html?suspendu=1";
          });
        }
      }).catch(function() {});
    }

    // Si l'utilisateur vient tout juste de se connecter (moins d'une minute),
    // on ignore toute ancienne valeur d'activité périmée et on repart à zéro.
    const derniereConnexion = user.metadata && user.metadata.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).getTime()
      : 0;

    if (derniereConnexion && (Date.now() - derniereConnexion) < 60000) {
      mettreAJourActivite();
      enregistrerConnexion(user);
      return;
    }

    // Connecté : on vérifie la durée d'inactivité (verifierSession met à jour l'horodatage si tout est bon)
    if (verifierSession()) {
      enregistrerConnexion(user);
    }
  });
});

// À chaque interaction : mise à jour locale + enregistrement de la dernière visite (limité à 1 fois / 10 min)
function activiteUtilisateur() {
  mettreAJourActivite();
  try {
    const u = firebase.auth && firebase.auth().currentUser;
    if (u) enregistrerConnexion(u);
  } catch (e) {}
}
window.addEventListener("click", activiteUtilisateur);
window.addEventListener("keydown", activiteUtilisateur);
window.addEventListener("scroll", activiteUtilisateur);
