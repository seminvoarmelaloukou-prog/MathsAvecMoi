// Relais sécurisé pour Nora : la clé Gemini reste secrète ici (jamais dans le site).
const ORIGINES = ["https://seminvoarmelaloukou-prog.github.io"];

const CONSIGNE =
  "Tu es Nora, tuteur de mathématiques pour des élèves de la 6e à la Terminale au Bénin. " +
  "Réponds en français, avec des mots simples, en phrases courtes, de façon encourageante. " +
  "FORMAT STRICT : texte brut uniquement. Interdit : Markdown (###, **, tableaux, ---) et LaTeX (aucun $, aucun antislash, aucune accolade). " +
  "Écris chaque formule en clair, avec les symboles usuels : × ÷ ² ³ √ π ∞ ≤ ≥ ≠ ≈ → ⇒. " +
  "Exemples de notation : Aire = côté × côté ; x² + 3x = 0 ; (a + b)/2 ; √16 = 4 ; " +
  "lim quand x tend vers 0 de ln(1 + x)/x = 1 ; u(n+1) = 2·u(n) ; f'(x) = 2x. " +
  "Sépare les idées par une ligne vide. Pour une liste, une ligne par élément qui commence par un tiret. " +
  "Donne une explication courte, un exemple chiffré, puis une petite question pour vérifier la compréhension. " +
  "Maximum environ 150 mots. " +
  "Si la question n'a aucun rapport avec les études, ramène poliment l'élève vers ses cours.";

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

    let question = "";
    try { question = String((await req.json()).question || "").trim().slice(0, 1000); } catch (e) {}
    if (!question) return rep({ erreur: "Question vide" }, 400);

    const modeles = [env.MODELE || "gemini-3.8-flash", env.MODELE_SECOURS].filter(Boolean);
    const corps = JSON.stringify({
      systemInstruction: { parts: [{ text: CONSIGNE }] },
      contents: [{ parts: [{ text: question }] }],
      generationConfig: { maxOutputTokens: 1500 }
    });
    const attendre = ms => new Promise(res => setTimeout(res, ms));
    let dernier = "";

    for (const modele of modeles) {
      for (let essai = 0; essai < 3; essai++) {
        try {
          const r = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" + modele + ":generateContent",
            { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: corps }
          );
          const d = await r.json();
          const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
          const texte = parts ? parts.map(p => p.text || "").join("") : "";
          if (texte) return rep({ texte: texte });
          dernier = r.status + " " + modele + " " + ((d && d.error && d.error.message) || "réponse vide");
          console.log("Gemini :", dernier);
          if ([429, 500, 503].includes(r.status)) { await attendre(900 * (essai + 1)); continue; }
          break;
        } catch (e) {
          dernier = String(e && e.message);
          console.log("Erreur :", dernier);
          await attendre(900 * (essai + 1));
        }
      }
    }
    return rep({ texte: "Nora est très sollicitée en ce moment. Réessaie dans quelques secondes." });
  }
};
