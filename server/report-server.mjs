import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

const GITHUB_PAT = process.env.GITHUB_MODELS_PAT;
const MODEL = process.env.GITHUB_MODELS_MODEL || "openai/gpt-4.1";

// Cache global (vive mientras el server esté levantado)
const cache = new Map(); // key -> { markdown, ts }
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

if (!GITHUB_PAT) {
  console.error("Falta GITHUB_MODELS_PAT en .env.local");
  process.exit(1);
}

app.post("/api/report", async (req, res) => {
  try {
    const { weekLabel, payload } = req.body;

    // Validación mínima
    if (!weekLabel || typeof weekLabel !== "string") {
      return res.status(400).json({ error: "Falta weekLabel (string)." });
    }
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Falta payload (object)." });
    }

    // Compactar payload (ahorro de tokens)
    const compact = {
      context: payload.context ?? payload.meta ?? {},
      totals: payload.totals ?? {},
      hotspots: Array.isArray(payload.hotspots)
        ? payload.hotspots.slice(0, 10)
        : [],
      // opcional: clusters si los necesitas para que el modelo use nombres humanos
      clusters: Array.isArray(payload.clusters) ? payload.clusters : undefined,
    };

    // Cache key estable
    const key = JSON.stringify({ weekLabel, compact });

    // Cache hit
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json({
        markdown: cached.markdown,
        model: MODEL,
        cached: true,
      });
    }

    // Prompt ejecutivo, sin inventar
    const system = `
Eres un analista ambiental y de salud pública.
Genera un REPORTE EJECUTIVO semanal en Markdown, claro, minimalista y orientado a toma de decisiones.
Incluye SIEMPRE:
1) Resumen ejecutivo (3-5 bullets)
2) Hallazgos clave (bullets)
3) Zonas críticas (tabla corta con: zona, nivel, eventos)
4) Recomendaciones accionables y medibles (bullets)
5) Riesgos/limitaciones del dato (MVP)
No inventes datos fuera del JSON. Si falta información, dilo explícitamente.
`.trim();

    const user = `
Semana: ${weekLabel}

Datos (JSON compacto):
${JSON.stringify(compact, null, 2)}
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

    // Guardar en cache
    cache.set(key, { markdown, ts: Date.now() });

    return res.json({ markdown, model: MODEL, cached: false });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(8787, () => {
  console.log("AI report server listo en http://localhost:8787");
});
