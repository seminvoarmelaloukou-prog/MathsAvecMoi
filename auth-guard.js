// auth-guard.js
// Vérifie que l'utilisateur est connecté, sinon redirige vers connexion.html
// Déconnecte automatiquement après 5 heures d'inactivité

const DUREE_SESSION_MS = 5 * 60 * 60 * 1000; // 5 heures

function mettreAJourActivite() {
  localStorage.setItem("lastActivity", Date.now().toString());
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
          window.location.href = "connexion.html";
        }).catch(function() {
          window.location.href = "connexion.html";
        });
      } else {
        window.location.href = "connexion.html";
      }
      return false;
    }
  }

  // Met à jour l'activité à chaque vérification
  mettreAJourActivite();
  return true;
}

// Initialisation : vérifier la session au chargement
window.addEventListener("load", function() {
  if (!firebase.auth) {
    console.warn("Firebase Auth non disponible dans auth-guard.js");
    return;
  }

  // Mettre à jour l'activité au chargement
  mettreAJourActivite();

  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // Pas connecté → redirection vers connexion
      window.location.href = "connexion.html";
      return;
    }

    // Connecté : on vérifie la durée d'inactivité
    if (!verifierSession()) {
      // verifierSession a déjà déconnecté et redirigé si besoin
      return;
    }
  });
});

// Mettre à jour l'activité à chaque interaction utilisateur
window.addEventListener("click", mettreAJourActivite);
window.addEventListener("keydown", mettreAJourActivite);
window.addEventListener("scroll", mettreAJourActivite);
