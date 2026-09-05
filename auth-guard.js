// auth-guard.js
// Protection des pages de MathsAvecMoi avec Firebase Authentication.

(function () {

// Pages accessibles sans connexion
var PAGES_PUBLIQUES = [
"",
"index.html",
"inscription.html",
"connexion.html"
];

function pageActuelle() {
var chemin = window.location.pathname;
return chemin.substring(chemin.lastIndexOf("/") + 1);
}

function estPagePublique() {
return PAGES_PUBLIQUES.indexOf(pageActuelle()) !== -1;
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
    if (!estPagePublique()) {
      window.location.href = "index.html";
    }

    return;
  }

  // Si l'utilisateur est déjà connecté et arrive
  // sur la page publique, on peut l'envoyer vers l'accueil.
  if (
    pageActuelle() === "index.html" ||
    pageActuelle() === "connexion.html" ||
    pageActuelle() === "inscription.html" ||
    pageActuelle() === ""
  ) {
    window.location.href = "accueil.html";
  }

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
