/* Campus Flex – matières au programme de chaque classe
   Règles appliquées :
   - PCT : pas pour les classes littéraires (séries A et AB)
   - Philosophie : pas pour le premier cycle (6e, 5e, 4e, 3e)
   - Espagnol et Allemand : pas pour la 6e, la 5e ni les séries scientifiques C, D et E (2de, 1re et Tle)
   - Français : deux types (Lecture, Communication écrite) de la 6e à la 3e, un seul au second cycle
   Si la classe est inconnue, aucune matière n'est cachée. */
(function () {
  "use strict";

  var TOUTES = ["Mathématiques", "Français", "Anglais", "PCT", "SVT", "Histoire-Géographie",
                "Éducation civique", "EPS", "Espagnol", "Allemand", "Philosophie"];

  var SLUGS = { "maths": "Mathématiques", "francais": "Français", "anglais": "Anglais", "pct": "PCT", "svt": "SVT",
                "histoire-geographie": "Histoire-Géographie", "philosophie": "Philosophie", "eps": "EPS",
                "espagnol": "Espagnol", "allemand": "Allemand" };

  // "2de AB", "2nde AB", "1ère AB", "Tle AB", "TleAB", "6ème"... -> "2deab", "1ereab", "tleab", "6eme"
  function norm(classe) {
    return String(classe || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  }
  function premierCycle(n) { return /^[3-6](e|eme)$/.test(n); }
  function sixiemeCinquieme(n) { return /^[56](e|eme)$/.test(n); }
  // 2de C/D/E, 1re C/D/E, Tle C/D/E  (aussi écrits 2nde D, 1ère E, TleC, Terminale D...)
  function serieScientifique(n) { return /^((2|1)(nde|de|re|ere)|tle|terminale)(c|d|e)$/.test(n); }
  function litteraire(n) { return /^((2|1)(nde|de|re|ere)|tle|terminale)(a|ab|a1|a2)$/.test(n); }

  function autorisee(classe, matiere) {
    var n = norm(classe);
    if (!n) { return true; }
    if (matiere === "Philosophie" && premierCycle(n)) { return false; }
    if ((matiere === "Espagnol" || matiere === "Allemand") && (sixiemeCinquieme(n) || serieScientifique(n))) { return false; }
    if (matiere === "PCT" && litteraire(n)) { return false; }
    return true;
  }

  // Français : deux types de la 6e à la 3e (Lecture, Communication écrite), un seul ensuite
  var PARTIES_FRANCAIS = [
    { id: "lecture", nom: "Lecture" },
    { id: "communication-ecrite", nom: "Communication écrite" }
  ];
  function partiesFrancais(classe) {
    return premierCycle(norm(classe)) ? PARTIES_FRANCAIS : [];
  }

  window.CF_PROGRAMME = {
    partiesFrancais: partiesFrancais,
    autorisee: autorisee,
    autoriseeSlug: function (classe, slug) { return autorisee(classe, SLUGS[slug] || slug); },
    matieresPour: function (classe) { return TOUTES.filter(function (m) { return autorisee(classe, m); }); }
  };
})();
