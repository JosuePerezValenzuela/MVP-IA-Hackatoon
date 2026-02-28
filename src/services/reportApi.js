// src/services/reportApi.js
export async function requestExecutiveReport({ weekLabel, payload }) {
  const res = await fetch("http://localhost:8787/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekLabel, payload }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }

  return res.json(); // { markdown, model, cached? }
}
