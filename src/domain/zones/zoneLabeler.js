// src/domain/zones/zoneLabeler.js
export function createZoneLabeler({ clusters, zoneEngine }) {
  const safeClusters = Array.isArray(clusters) ? clusters : [];

  function dist2(aLat, aLng, bLat, bLng) {
    const dLat = aLat - bLat;
    const dLng = aLng - bLng;
    return dLat * dLat + dLng * dLng;
  }

  function labelForZoneId(zoneId) {
    const [zLat, zLng] = zoneEngine.zoneCenterFromId(zoneId);

    let best = null;
    let bestD = Infinity;

    for (const c of safeClusters) {
      const cLat = c?.center?.lat;
      const cLng = c?.center?.lng;
      if (typeof cLat !== "number" || typeof cLng !== "number") continue;

      const d = dist2(zLat, zLng, cLat, cLng);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }

    return best?.zone_name ?? `Zona ${zoneId.slice(0, 5)}`;
  }

  return { labelForZoneId };
}
