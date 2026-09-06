// ============================================================
// class-guard.js
// Protection des pages d'épreuves par classe
// ============================================================
//
// Chaque page de classe doit définir AVANT ce script :
//
// <script>var CLASSE_PAGE = "6ème";</script>
//
// Exemples :
// 6ème
// 5ème
// 4ème
// 3ème
// 2nde A-B
// 2nde C
// 2nde D
// 1ère A-B
// 1ère C
// 1ère D
// Tle A-B
// Tle C
// Tle D
//
// La classe enregistrée dans Firebase fait foi.
// ============================================================

(function () {

  var STORAGE_ACTIVE = "cf_active";

  // ------------------------------------------------------------
  // 1. Masquer la page immédiatement
  // ------------------------------------------------------------
  //
  // Cela évite que l'élève voie brièvement la page interdite
  // pendant que Firebase vérifie sa classe.
  // ------------------------------------------------------------

  document.documentElement.style.visibility = "hidden";


  // ------------------------------------------------------------
  // Récupérer l'identifiant du carnet actif
  // ------------------------------------------------------------

  function getActiveId() {
    return localStorage.getItem(STORAGE_ACTIVE);
  }


  // ------------------------------------------------------------
  // Afficher la page autorisée
  // ------------------------------------------------------------

  function autoriserPage() {
    document.documentElement.style.visibility = "visible";
  }


  // ------------------------------------------------------------
  // Refuser l'accès
  // ------------------------------------------------------------

  function refuserAcces(classeServeur) {

    console.warn(
      "Accès refusé : classe de l'élève =",
      classeServeur,
      "| page demandée =",
      CLASSE_PAGE
    );

    // On retourne simplement à la page Épreuves.
    // L'élève n'est PAS déconnecté.
    window.location.replace("epreuves.html");
  }


  // ------------------------------------------------------------
  // Vérification de la classe
  // ------------------------------------------------------------

  function verifierClasse() {

    // CLASSE_PAGE doit être défini dans la page HTML.
    if (typeof CLASSE_PAGE === "undefined" || !CLASSE_PAGE) {

      console.error(
        "class-guard.js : CLASSE_PAGE n'est pas défini."
      );

      autoriserPage();
      return;
    }


    // Vérifier Firebase Authentication
    if (
      typeof firebase === "undefined" ||
      !firebase.auth
    ) {

      console.error(
        "class-guard.js : Firebase Authentication n'est pas disponible."
      );

      autoriserPage();
      return;
    }


    // Attendre l'état de connexion Firebase
    firebase.auth().onAuthStateChanged(function (user) {

      // --------------------------------------------------------
      // Aucun utilisateur connecté
      // --------------------------------------------------------

      if (!user) {

        // auth-guard.js s'occupera normalement
        // de la redirection vers index.html.
        return;
      }


      // --------------------------------------------------------
      // Récupérer le carnet actif
      // --------------------------------------------------------

      var id = getActiveId();


      if (!id) {

        console.warn(
          "class-guard.js : aucun carnet actif."
        );

        // On ne laisse pas voir la page protégée.
        window.location.replace("profil.html");

        return;
      }


      // --------------------------------------------------------
      // Vérifier la disponibilité de Firebase Database
      // --------------------------------------------------------

      if (
        typeof db === "undefined" ||
        !db
      ) {

        console.error(
          "class-guard.js : Firebase Database indisponible."
        );

        // Par sécurité, on ne montre pas une page
        // dont l'autorisation n'a pas pu être vérifiée.
        window.location.replace("profil.html");

        return;
      }


      // --------------------------------------------------------
      // Lire la classe depuis Firebase
      // --------------------------------------------------------

      db.ref("eleves/" + id + "/classe")
        .once("value")

        .then(function (snap) {

          var classeServeur = snap.val();


          // ----------------------------------------------------
          // Aucune classe enregistrée
          // ----------------------------------------------------

          if (!classeServeur) {

            console.warn(
              "class-guard.js : aucune classe enregistrée pour ce carnet."
            );

            // On ne montre pas la page.
            window.location.replace("profil.html");

            return;
          }


          // ----------------------------------------------------
          // Comparaison des classes
          // ----------------------------------------------------

          if (String(classeServeur).trim() !==
              String(CLASSE_PAGE).trim()) {

            // Classe différente :
            // accès interdit.
            refuserAcces(classeServeur);

            return;
          }


          // ----------------------------------------------------
          // Classe correcte
          // ----------------------------------------------------

          console.log(
            "class-guard.js : accès autorisé pour la classe",
            classeServeur
          );

          autoriserPage();

        })

        .catch(function (erreur) {

          console.error(
            "class-guard.js : erreur lors de la vérification :",
            erreur
          );

          // En cas d'impossibilité de vérifier,
          // on ne laisse pas afficher la page.
          window.location.replace("profil.html");
        });

    });

  }


  // ------------------------------------------------------------
  // Lancer la protection
  // ------------------------------------------------------------

  verifierClasse();

})();
