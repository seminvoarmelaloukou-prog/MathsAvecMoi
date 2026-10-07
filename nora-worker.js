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
  "Tiens compte des messages précédents de la conversation pour répondre à la suite de l'échange. " +
  "Si la question n'a aucun rapport avec les études, ramène poliment l'élève vers ses cours.";

const DELAI_TENTATIVE = 10000; // 10 s max par appel à Gemini
const DELAI_TOTAL = 22000;     // 22 s max au total, ensuite on abandonne

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

    let question = "", historique = [];
    try {
      const d = await req.json();
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
    contents.push({ role: "user", parts: [{ text: question }] });

    const modeles = [...new Set([
      env.MODELE || "gemini-3.8-flash",
      env.MODELE_SECOURS,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ].filter(Boolean))];

    const corps = JSON.stringify({
      systemInstruction: { parts: [{ text: CONSIGNE }] },
      contents: contents,
      generationConfig: { maxOutputTokens: 1500 }
    });
    const attendre = ms => new Promise(res => setTimeout(res, ms));
    const debut = Date.now();

    for (const modele of modeles) {
      for (let essai = 0; essai < 2; essai++) {
        if (Date.now() - debut > DELAI_TOTAL) break;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), DELAI_TENTATIVE);
        try {
          const r = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" + modele + ":generateContent",
            { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: corps, signal: ctrl.signal }
          );
          const d = await r.json();
          const parts = d && d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts;
          const texte = parts ? parts.map(p => p.text || "").join("") : "";
          if (texte) return rep({ texte: texte });
          console.log("Gemini :", r.status, modele, (d && d.error && d.error.message) || "réponse vide");
          if ([429, 500, 503].includes(r.status) && essai === 0) { await attendre(500); continue; }
          break; // erreur définitive (clé, modèle inconnu...) ou 2e échec : modèle suivant
        } catch (e) {
          console.log("Erreur :", modele, String(e && e.message));
          if (essai === 0) await attendre(500);
        } finally {
          clearTimeout(t);
        }
      }
    }
    return rep({ texte: "Nora est très sollicitée en ce moment. Réessaie dans quelques secondes." });
  }
};
