// auth-guard.js
// Protège les pages contre l'accès sans session active, et gère la déconnexion.
// Ne supprime jamais les données des carnets : seule la "session active" est retirée.

(function () {
  var STORAGE_PROFILES = "cf_profiles"; // { [id]: profil }
  var STORAGE_ACTIVE = "cf_active";     // id du profil actuellement connecté
  var PAGE_PROFIL = "profil.html";

  function pageActuelle() {
    var chemin = window.location.pathname;
    return chemin.substring(chemin.lastIndexOf("/") + 1);
  }

  function sessionActive() {
    try {
      var id = localStorage.getItem(STORAGE_ACTIVE);
      if (!id) return false;
      var raw = localStorage.getItem(STORAGE_PROFILES);
      var all = raw ? JSON.parse(raw) : {};
      return !!all[id];
    } catch (e) {
      return false;
    }
  }

  // Si aucune session active et qu'on n'est pas déjà sur profil.html -> redirection
  if (!sessionActive() && pageActuelle() !== PAGE_PROFIL) {
    window.location.href = PAGE_PROFIL;
  }

  // Fonction appelée par le lien "Déconnexion" du menu
  // Retire uniquement la session active — les données du carnet restent sauvegardées.
  window.deconnexion = function () {
    localStorage.removeItem(STORAGE_ACTIVE);
    window.location.href = PAGE_PROFIL;
  };
})();
