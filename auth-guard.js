// auth-guard.js
// Protection des pages de MathsAvecMoi avec Firebase Authentication.

(function () {

  // Pages accessibles sans connexion (publiques)
  var PAGES_PUBLIQUES = [
    "",
    "index.html",
    "inscription.html",
    "connexion.html"
  ];

  // Pages accessibles aux utilisateurs connectés (élèves + admin)
  var PAGES_PRIVEES_AUTORISEES = [
    "maths/index.html",
    "admin.html",
    "admin-evaluations.html",
    "admin-eleves.html",
    "admin-resultats.html"
    // ajoute ici d'autres pages privées si nécessaire
  ];

  function pageActuelle() {
    var chemin = window.location.pathname;
    // Gère aussi les sous-dossiers comme maths/index.html
    return chemin.substring(chemin.lastIndexOf("/") + 1);
  }

  function cheminComplet() {
    // Retourne quelque chose comme "maths/index.html" ou "admin.html"
    var chemin = window.location.pathname;
    // Enlève le slash initial s'il y en a un
    if (chemin.charAt(0) === "/") {
      chemin = chemin.substring(1);
    }
    return chemin;
  }

  function estPagePublique() {
    return PAGES_PUBLIQUES.indexOf(pageActuelle()) !== -1;
  }

  function estPagePriveeAutorisee() {
    var chemin = cheminComplet();
    return PAGES_PRIVEES_AUTORISEES.indexOf(chemin) !== -1;
  }

  // Attendre que Firebase Authentication soit disponible
  function verifierConnexion() {

    if (typeof firebase === "undefined" || !firebase.auth) {
      console.error("Firebase Authentication n'est pas disponible.");
      return;
    }

    firebase.auth().onAuthStateChanged(function (user) {

      // Si l'utilisateur n'est pas connecté
      if (!user) {
        // Les pages publiques restent accessibles
        if (estPagePublique()) {
          return;
        }

        // Toute autre page non publique → redirection vers l'accueil
        window.location.href = "index.html";
        return;
      }

      // Utilisateur connecté

      // Si on est sur une page privée autorisée, on ne fait rien
      if (estPagePriveeAutorisee()) {
        return;
      }

      // Si on est sur une page publique et qu'on veut rediriger vers un espace connecté,
      // tu peux personnaliser ici. Par exemple :
      // - admin → admin.html
      // - élève → maths/index.html
      // Pour l'instant, on ne fait rien de spécial pour éviter les boucles.
      // Tu peux supprimer ou adapter ce bloc si besoin.

      // Ancien comportement (commenté pour éviter les boucles) :
      /*
      if (
        pageActuelle() === "index.html" ||
        pageActuelle() === "connexion.html" ||
        pageActuelle() === "inscription.html" ||
        pageActuelle() === ""
      ) {
        window.location.href = "accueil.html";
      }
      */

    });

  }

  // Fonction de déconnexion
  window.deconnexion = function () {

    firebase.auth()
      .signOut()
      .then(function () {
        window.location.href = "index.html";
      })
      .catch(function (erreur) {
        console.error("Erreur lors de la déconnexion :", erreur);
      });

  };

  verifierConnexion();

})();
