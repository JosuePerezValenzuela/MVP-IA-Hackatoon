// src/services/loadMockDataset.js
export async function loadMockDataset() {
  const res = await fetch("/mock/toxic-events.json");
  if (!res.ok) throw new Error(`No se pudo cargar mock: ${res.status}`);

  const data = await res.json();

  // Soporta: array directo o { meta, clusters, events }
  if (Array.isArray(data)) {
    return { meta: null, clusters: [], events: data };
  }

  return {
    meta: data.meta ?? null,
    clusters: data.clusters ?? [],
    events: data.events ?? [],
  };
}
