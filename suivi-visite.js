if (!window.__cfSuivi) {
window.__cfSuivi = true;
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

// suivi-visite.js
// Enregistre la dernière visite de l'utilisateur connecté dans connexions/{uid}
// À inclure sur les pages qui n'utilisent pas auth-guard.js (ex. pages enseignants)
// Nécessite : firebase-app, firebase-auth, firebase-database (compat) et firebase-config.js chargés avant.

(function () {
  var INTERVALLE_MS = 10 * 60 * 1000; // 10 minutes

  function enregistrer(user) {
    try {
      if (!user || !firebase.database) return;
      var cle = "cf_derniere_ecriture_" + user.uid; // même clé que auth-guard.js
      var derniere = parseInt(localStorage.getItem(cle) || "0", 10);
      if (Date.now() - derniere < INTERVALLE_MS) return;

      firebase.database().ref("connexions/" + user.uid).update({
        derniereConnexion: firebase.database.ServerValue.TIMESTAMP,
        email: user.email || null
      }).then(function () {
        localStorage.setItem(cle, Date.now().toString());
      }).catch(function () {});
    } catch (e) {}
  }

  function activite() {
    try {
      var u = firebase.auth().currentUser;
      if (u) enregistrer(u);
    } catch (e) {}
  }

  window.addEventListener("load", function () {
    if (!firebase.auth) return;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) enregistrer(user);
    });
  });

  window.addEventListener("click", activite);
  window.addEventListener("keydown", activite);
  window.addEventListener("scroll", activite);
})();
}
