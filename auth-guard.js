// auth-guard.js
// Protège les pages contre l'accès non connecté et gère la déconnexion.

(function () {
  // Nom du fichier de la page où l'utilisateur doit atterrir
  // s'il n'est pas connecté (aussi la page de destination après déconnexion).
  var PAGE_PROFIL = "profil.html";

  // Récupère le nom du fichier de la page actuelle (ex: "epreuves.html")
  function pageActuelle() {
    var chemin = window.location.pathname;
    return chemin.substring(chemin.lastIndexOf("/") + 1);
  }

  // Vérifie l'état de connexion à chaque chargement de page
  firebase.auth().onAuthStateChanged(function (utilisateur) {
    if (!utilisateur && pageActuelle() !== PAGE_PROFIL) {
      // Pas connecté et pas déjà sur la page de profil -> redirection
      window.location.href = PAGE_PROFIL;
    }
  });

  // Fonction appelée par le lien "Déconnexion" du menu
  window.deconnexion = function () {
    firebase.auth().signOut()
      .then(function () {
        window.location.href = PAGE_PROFIL;
      })
      .catch(function (erreur) {
        console.error("Erreur lors de la déconnexion :", erreur);
        alert("Une erreur est survenue lors de la déconnexion. Réessaie.");
      });
  };
})();
