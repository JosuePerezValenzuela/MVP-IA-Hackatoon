import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

const GITHUB_PAT = process.env.GITHUB_MODELS_PAT;
const MODEL = process.env.GITHUB_MODELS_MODEL;

if (!GITHUB_PAT) {
  console.error("Falta GITHUB_MODELS_PAT en .env.local");
  process.exit(1);
}

// Endpoint local: recibe resumen semanal y devuelve markdown
app.post("/api/report", async (req, res) => {
  try {
    const { weekLabel, payload } = req.body;

    // Prompt: ejecutivo, corto, con bullets, y recomendaciones
    const system = `
    Eres un analista ambiental y de salud pública.
    Genera un REPORTE EJECUTIVO semanal en Markdown, claro y minimalista.
    Incluye: Resumen, Hallazgos clave, Zonas críticas, Recomendaciones accionables (medibles),
    y Riesgos/limitaciones del dato (MVP).
    No inventes datos fuera del JSON.
`.trim();

    const user = `
Semana: ${weekLabel}

Datos (JSON):
${JSON.stringify(payload, null, 2)}
`.trim();

    const ghRes = await fetch(
      "https://models.github.ai/inference/chat/completions",
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${GITHUB_PAT}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
          max_tokens: 900,
          stream: false,
        }),
      },
    );

    if (!ghRes.ok) {
      const txt = await ghRes.text();
      return res.status(ghRes.status).json({ error: txt });
    }

    const data = await ghRes.json();
    const markdown = data?.choices?.[0]?.message?.content ?? "";

    return res.json({ markdown, model: MODEL });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(8787, () => {
  console.log("AI report server listo en http://localhost:8787");
});
