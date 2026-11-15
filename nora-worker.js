// Relais sécurisé pour Nora : la clé Gemini reste secrète ici (jamais dans le site).
const ORIGINES = ["https://seminvoarmelaloukou-prog.github.io"];

const CONSIGNE =
  "Tu es Nora, tutrice de la plateforme Campus Flex, pour des élèves béninois de la 6e à la Terminale (programmes du Bénin). " +
  "Tu aides dans toutes les matières : mathématiques, français, anglais, espagnol, allemand, PCT (physique-chimie-technologie), SVT, histoire-géographie, éducation civique, philosophie et EPS. " +
  "Repère toi-même la matière de la question et adapte ta façon d'expliquer. " +
  "Tu tutoies l'élève. Tu écris en français simple, avec des phrases courtes, un ton chaleureux et encourageant, sans emoji. " +
  "RIGUEUR : ne dis que ce dont tu es sûre. Ne donne jamais un résultat, une date, un nom, un chiffre ou une définition que tu n'as pas vérifié ou dont tu n'es pas certaine ; " +
  "dis alors honnêtement que tu n'es pas sûre et invite l'élève à vérifier dans son cours ou avec son enseignant. " +
  "Si une donnée manque ou si l'énoncé est ambigu, pose UNE question courte au lieu de deviner. Si tu découvres une erreur, corrige-la clairement. " +
  "MATHS ET PCT : avant de répondre, résous toi-même le problème en entier et vérifie chaque calcul (refais-le ou remplace par le résultat). " +
  "Structure (toujours la même) : 1) une phrase qui donne l'idée principale ; " +
  "2) la méthode en étapes numérotées « Étape 1 », « Étape 2 »..., une seule idée ou opération par ligne, avec une ligne vide entre les étapes ; " +
  "3) une ligne « Réponse : ... » qui donne le résultat final, avec l'unité en PCT ; " +
  "4) une petite question ou un mini-exercice pour vérifier que l'élève a compris. " +
  "FRANÇAIS : pour la grammaire, la conjugaison et l'orthographe, donne la règle en une phrase, un exemple, puis applique-la à la phrase de l'élève. " +
  "Quand tu corriges un texte, explique chaque faute au lieu de seulement la corriger. " +
  "Pour une rédaction, un résumé, un commentaire ou une dissertation, aide l'élève à trouver ses idées et à construire son plan, mais n'écris pas le devoir à sa place. " +
  "LANGUES (anglais, espagnol, allemand) : explique en français, donne les exemples dans la langue étudiée avec leur traduction, et corrige les erreurs en expliquant la règle. " +
  "SVT, HISTOIRE-GÉOGRAPHIE, ÉDUCATION CIVIQUE : explique par idées principales, avec des exemples concrets, du Bénin et de l'Afrique de l'Ouest quand c'est utile. " +
  "Décris un schéma ou un document avec des mots. Ne cite jamais une date ou un chiffre dont tu n'es pas certaine. " +
  "PHILOSOPHIE : aide l'élève à comprendre la notion, à poser une problématique et à construire un plan ; présente plusieurs points de vue sans imposer le tien ; " +
  "ne cite un philosophe ou une œuvre que si tu es sûre. N'écris pas la dissertation complète à la place de l'élève. " +
  "EPS : explique les règles, les techniques et l'échauffement ; en cas de douleur ou de blessure, dis à l'élève d'en parler à un adulte ou à un professionnel de santé. " +
  "Pour une simple question de cours, dans n'importe quelle matière, remplace les étapes par une explication courte avec un exemple. " +
  "LONGUEUR : environ 150 mots, jusqu'à 300 mots pour un exercice complet. " +
  "FORMAT STRICT : texte brut uniquement. Interdit : Markdown (###, **, tableaux, ---) et LaTeX (aucun $, aucun antislash, aucune accolade). " +
  "Écris les formules en clair avec les symboles usuels : × ÷ ² ³ √ π ∞ ≤ ≥ ≠ ≈ → ⇒ ∈ ℝ. " +
  "Exemples : Aire = côté × côté ; x² + 3x = 0 ; (a + b)/2 ; √16 = 4 ; f'(x) = 2x ; u(n+1) = 2·u(n) ; " +
  "lim quand x tend vers 0 de ln(1 + x)/x = 1. Intervalles à la française : ]a ; b[ et [a ; b]. " +
  "PHOTO : lis l'énoncé ou le texte avec soin et recopie-le en une ligne (ou résume-le s'il est long). Si une partie est floue, coupée ou illisible, dis-le gentiment et demande une photo plus nette, sans rien inventer. Puis applique la méthode de la matière concernée. " +
  "CONVERSATION : tiens compte des messages précédents pour répondre à la suite de l'échange, sans te répéter. " +
  "À PROPOS DE TON CRÉATEUR : tu as été créée par ALOUKOU Sèminvo Armel, professeur de mathématiques à Karimama (département de l'Alibori, Bénin), qui a aussi conçu la plateforme Campus Flex. " +
  "Si un élève te demande son nom ou qui il est, présente-le avec respect et chaleur à partir de ces seules informations. N'invente rien d'autre (âge, téléphone, adresse, vie privée) ; pour toute autre question à son sujet, invite l'élève à le lui demander directement en classe. " +
  "Si la question n'a aucun rapport avec les études, ramène poliment l'élève vers ses cours. Refuse poliment tout contenu inapproprié.";

// Délais : attente du PREMIER mot de la réponse (ensuite la réponse s'affiche au fur et à mesure)
const DELAI_PREMIER_MOT = 25000;      // 25 s (30 s avec une image)
const DELAI_TOTAL = 22000;            // plus aucun nouvel essai après 22 s
const TAILLE_IMAGE_MAX = 1500000;     // caractères base64 (≈ 1,1 Mo)
const TYPES_IMAGE = ["image/jpeg", "image/png", "image/webp"];

// Extrait le texte des blocs « data: {...} » envoyés par Gemini en streaming
function extraireTextes(tampon) {
  const lignes = tampon.split("\n");
  const reste = lignes.pop();
  const textes = [];
  for (const l of lignes) {
    const ligne = l.trim();
    if (!ligne.startsWith("data:")) continue;
    const json = ligne.slice(5).trim();
    if (!json || json === "[DONE]") continue;
    try {
      const d = JSON.parse(json);
      const parts = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
      if (parts) textes.push(parts.map(p => (p.thought ? "" : (p.text || ""))).join(""));
    } catch (e) {}
  }
  return { textes: textes, reste: reste };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const autorise = ORIGINES.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": autorise ? origin : ORIGINES[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    const rep = (obj, status) =>
      new Response(JSON.stringify(obj), { status: status || 200, headers: { ...cors, "Content-Type": "application/json" } });

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST" || !autorise) return rep({ erreur: "Accès refusé" }, 403);

    let question = "", historique = [], image = null;
    try {
      const d = await req.json();
      if (d.image && TYPES_IMAGE.includes(d.image.mime) && typeof d.image.data === "string"
          && d.image.data.length > 0 && d.image.data.length <= TAILLE_IMAGE_MAX
          && /^[A-Za-z0-9+/=]+$/.test(d.image.data)) {
        image = { mime: d.image.mime, data: d.image.data };
      }
      question = String(d.question || "").trim().slice(0, 1000);
      if (Array.isArray(d.historique)) historique = d.historique.slice(-6);
    } catch (e) {}
    if (!question) return rep({ erreur: "Question vide" }, 400);

    // Conversation : messages précédents + question actuelle
    const contents = [];
    for (const m of historique) {
      const texte = String((m && m.texte) || "").trim().slice(0, 800);
      if (!texte) continue;
      contents.push({ role: m.role === "nora" ? "model" : "user", parts: [{ text: texte }] });
    }
    while (contents.length && contents[0].role !== "user") contents.shift();
    const partiesQuestion = [];
    if (image) partiesQuestion.push({ inlineData: { mimeType: image.mime, data: image.data } });
    partiesQuestion.push({ text: question });
    contents.push({ role: "user", parts: partiesQuestion });

    // Chaque modèle a son propre quota : si l'un est surchargé ou épuisé, on passe au suivant.
    // MODELE_SECOURS peut contenir plusieurs modèles séparés par des virgules.
    const modeles = [...new Set([
      env.MODELE || "gemini-3.8-flash",
      ...String(env.MODELE_SECOURS || "").split(",")
    ].map(m => m.trim()).filter(Boolean))];

    // Niveau de réflexion : minimal (très rapide) · low · medium (soigné, recommandé) · high (très lent)
    const niveau = env.NIVEAU_REFLEXION || "medium";
    const consigne = env.CONSIGNE || CONSIGNE; // la variable CONSIGNE (Cloudflare) remplace le texte ci-dessus si elle existe
    const construire = (avecReflexion, niv) => JSON.stringify({
      systemInstruction: { parts: [{ text: consigne }] },
      contents: contents,
      generationConfig: avecReflexion
        ? { maxOutputTokens: 3000, thinkingConfig: { thinkingLevel: niv } }
        : { maxOutputTokens: 3000 }
    });

    const attendre = ms => new Promise(res => setTimeout(res, ms));
    const debut = Date.now();
    const delaiPremierMot = image ? 30000 : DELAI_PREMIER_MOT;
    let code = "?";

    for (const modele of modeles) {
      let avecReflexion = true;
      for (let essai = 0; essai < 2; essai++) {
        if (Date.now() - debut > DELAI_TOTAL) break;
        const ctrl = new AbortController();
        const minuteur = setTimeout(() => ctrl.abort(), delaiPremierMot);
        try {
          const r = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" + modele + ":streamGenerateContent?alt=sse",
            { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: construire(avecReflexion, essai === 0 ? niveau : "low"), signal: ctrl.signal }
          );
          code = String(r.status);

          if (!r.ok || !r.body) {
            let message = "";
            try { const e = await r.json(); message = (e && e.error && e.error.message) || ""; } catch (e) {}
            console.log("Gemini :", r.status, modele, message);
            if (r.status === 400 && avecReflexion) { avecReflexion = false; continue; } // réglage de réflexion refusé : on réessaie sans
            if ([500, 503].includes(r.status) && essai === 0) { await attendre(800); continue; } // service surchargé : 1 nouvel essai (réflexion allégée)
            break; // quota atteint (429), modèle inconnu (404), clé... : on passe au modèle suivant sans insister
          }

          // On attend le premier morceau de texte avant de répondre à l'élève
          const lecteur = r.body.getReader();
          const decodeur = new TextDecoder();
          let tampon = "", premier = "";
          while (!premier) {
            const { done, value } = await lecteur.read();
            if (done) break;
            tampon += decodeur.decode(value, { stream: true });
            const x = extraireTextes(tampon);
            tampon = x.reste;
            premier = x.textes.join("");
          }
          if (!premier) { code = "vide"; console.log("Réponse vide :", modele); break; }

          // Réponse envoyée mot par mot à l'élève
          const encodeur = new TextEncoder();
          const flux = new ReadableStream({
            async start(controller) {
              controller.enqueue(encodeur.encode(premier));
              try {
                while (true) {
                  const { done, value } = await lecteur.read();
                  if (done) break;
                  tampon += decodeur.decode(value, { stream: true });
                  const x = extraireTextes(tampon);
                  tampon = x.reste;
                  const t = x.textes.join("");
                  if (t) controller.enqueue(encodeur.encode(t));
                }
                const fin = extraireTextes(tampon + "\n").textes.join("");
                if (fin) controller.enqueue(encodeur.encode(fin));
              } catch (e) {}
              controller.close();
            }
          });
          return new Response(flux, { headers: { ...cors, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
        } catch (e) {
          const delaiDepasse = e && e.name === "AbortError";
          code = delaiDepasse ? "delai" : "reseau";
          console.log("Erreur :", modele, String(e && e.message));
          if (delaiDepasse) break; // trop lent : inutile de réessayer le même modèle
          if (essai === 0) await attendre(500);
        } finally {
          clearTimeout(minuteur);
        }
      }
    }
    const message = code === "429"
      ? "Nora a atteint sa limite d'utilisation pour le moment. Réessaie dans quelques minutes. (code 429)"
      : "Nora est très sollicitée en ce moment. Réessaie dans quelques secondes. (code " + code + ")";
    return rep({ texte: message });
  }
};
