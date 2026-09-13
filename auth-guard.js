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

    // Si l'utilisateur vient tout juste de se connecter (moins d'une minute),
    // on ignore toute ancienne valeur d'activité périmée et on repart à zéro.
    const derniereConnexion = user.metadata && user.metadata.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).getTime()
      : 0;

    if (derniereConnexion && (Date.now() - derniereConnexion) < 60000) {
      mettreAJourActivite();
      return;
    }

    // Connecté : on vérifie la durée d'inactivité (verifierSession met à jour l'horodatage si tout est bon)
    verifierSession();
  });
});

// Mettre à jour l'activité à chaque interaction utilisateur
window.addEventListener("click", mettreAJourActivite);
window.addEventListener("keydown", mettreAJourActivite);
window.addEventListener("scroll", mettreAJourActivite);
