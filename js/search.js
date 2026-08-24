/**
 * search.js
 * Recherche de rues via Nominatim (OpenStreetMap).
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'MaCarteDeMarche/1.0';

// Recherche une rue
async function searchStreet(query) {
    if (!query.trim()) return [];

    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: 5,
            'accept-language': 'fr',
            countrycodes: 'fr',
        });

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: { 'User-Agent': USER_AGENT },
        });

        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("Erreur de recherche :", err);
        return [];
    }
}

// Ajoute une rue à la carte
function addStreetToMap(streetData, map, color) {
    if (streetData.geojson?.type === 'LineString') {
        const coords = streetData.geojson.coordinates.map(c => [c[1], c[0]]);
        return L.polyline(coords, {
            color: color,
            weight: 5,
            opacity: 0.8,
            scaleWithZoom: false,
        }).addTo(map);
    }
    if (streetData.lat && streetData.lon) {
        map.setView([parseFloat(streetData.lat), parseFloat(streetData.lon)], 16);
    }
    return null;
}