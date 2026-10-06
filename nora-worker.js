// Relais sécurisé pour Nora : la clé Gemini reste secrète ici (jamais dans le site).
const ORIGINES = ["https://seminvoarmelaloukou-prog.github.io"];

const CONSIGNE =
  "Tu es Nora, un tuteur IA en mathématiques pour collégiens et lycéens (6e à Terminale) au Bénin. " +
  "Réponds en français, de manière claire, pédagogique et encourageante. " +
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

    const modele = env.MODELE || "gemini-2.5-flash";
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + modele + ":generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CONSIGNE }] },
          contents: [{ parts: [{ text: question }] }],
          generationConfig: { maxOutputTokens: 1500 }
        })
      }
    );
    const d = await r.json();
    const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
    const texte = parts ? parts.map(p => p.text || "").join("") : "";
    return rep({ texte: texte }, texte ? 200 : 502);
  }
};
