import ngeohash from "ngeohash";

/**
 * Motor de zonas basado en GEOHASH.
 * - ZoneId: string (geohash)
 * - Shape: hexágono (representación visual) derivado del bbox del geohash
 *
 * NOTA (importante): geohash es una grilla rectangular.
 * Aquí lo dibujamos como hex por estética del MVP.
 */
export function createGeohashHexEngine({ precision = 6 } = {}) {
  return {
    name: "geohash-hex",
    precision,

    zoneIdFromPoint(lat, lng) {
      return ngeohash.encode(lat, lng, precision);
    },

    /**
     * Devuelve un "hexágono" como lista de [lat, lng] (cerrado).
     * Lo calculamos usando el bbox del geohash:
     * - centro = promedio de min/max
     * - radio en lat/lng = proporción del bbox
     */
    zonePolygonFromId(zoneId) {
      // decode_bbox -> [minLat, minLng, maxLat, maxLng]
      const [minLat, minLng, maxLat, maxLng] = ngeohash.decode_bbox(zoneId);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // “Radios” en grados (aproximación para MVP)
      const rLat = (maxLat - minLat) / 2;
      const rLng = (maxLng - minLng) / 2;

      // Hexágono regular aproximado dentro del bbox (elipse lat/lng)
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i; // 0, 60, 120...
        const lat = centerLat + rLat * Math.sin(angle);
        const lng = centerLng + rLng * Math.cos(angle);
        points.push([lat, lng]);
      }
      // cerrar el polígono repitiendo el primer punto
      points.push(points[0]);

      return points;
    },

    zoneCenterFromId(zoneId) {
      const [minLat, minLng, maxLat, maxLng] = ngeohash.decode_bbox(zoneId);
      return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    },
  };
}
