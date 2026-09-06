// class-guard.js
// Empêche un élève connecté de consulter la page épreuves d'une classe
// qui n'est pas la sienne.
//
// Important : la classe de référence utilisée ici est celle enregistrée
// côté serveur (Firebase, eleves/{id}/classe) et non la copie locale du
// carnet (localStorage). Comme seul l'enseignant peut changer la classe
// d'un élève depuis le tableau de bord, et qu'il le fait directement sur
// Firebase, c'est le serveur qui doit faire foi : cela garantit qu'un
// élève promu en classe supérieure retrouve tout de suite le bon accès,
// sans devoir modifier quoi que ce soit lui-même.
//
// Chaque page epreuves-*.html doit définir la variable CLASSE_PAGE
// AVANT d'inclure ce script, par exemple :
//   <script>var CLASSE_PAGE = "6ème";</script>
// La valeur doit être identique à celle du menu "Classe" de profil.html
// (ex: "6ème", "5ème", "4ème", "3ème", "2nde A-B", "2nde C", "2nde D",
// "1ère A-B", "1ère C", "1ère D", "Tle A-B", "Tle C", "Tle D").
//
// Cette page doit aussi charger firebase-database-compat.js et
// firebase-config.js (pour disposer de l'objet "db"), en plus de
// auth-guard.js qui gère déjà la redirection si personne n'est connecté.

(function () {

  var STORAGE_ACTIVE = "cf_active";

  function getActiveId() {
    return localStorage.getItem(STORAGE_ACTIVE);
  }

  function rediriger() {
    // On renvoie vers le carnet : l'élève y verra sa vraie classe
    // et pourra rejoindre sa propre page épreuves depuis là.
    window.location.href = "profil.html";
  }

  function verifierClasse() {
    if (typeof CLASSE_PAGE === "undefined" || !CLASSE_PAGE) {
      console.warn("class-guard.js : CLASSE_PAGE n'est pas défini sur cette page.");
      return;
    }

    if (typeof firebase === "undefined" || !firebase.auth) {
      console.error("class-guard.js : Firebase Authentication n'est pas disponible.");
      return;
    }

    firebase.auth().onAuthStateChanged(function (user) {

      // Si personne n'est connecté, auth-guard.js s'occupe déjà de
      // rediriger vers index.html : on ne fait rien de plus ici.
      if (!user) return;

      var id = getActiveId();
      if (!id) {
        // Pas encore de carnet créé sur cet appareil : on laisse
        // profil.html s'en occuper plutôt que de bloquer sans raison.
        rediriger();
        return;
      }

      if (typeof db === "undefined" || !db) {
        console.warn("class-guard.js : Firebase Database indisponible.");
        return;
      }

      db.ref("eleves/" + id + "/classe").once("value")
        .then(function (snap) {
          var classeServeur = snap.val();

          // Aucune classe enregistrée côté serveur pour ce carnet :
          // on n'empêche pas l'accès pour ne pas bloquer un élève
          // dont le profil ne s'est pas encore synchronisé.
          if (!classeServeur) return;

          if (classeServeur !== CLASSE_PAGE) {
            rediriger();
          }
        })
        .catch(function (e) {
          console.warn("class-guard.js : vérification impossible (hors ligne ?)", e);
        });
    });
  }

  verifierClasse();

})();

