/**
 * utils.js
 * Fonctions utilitaires :
 * - Génération d'ID unique
 * - Formatage de date
 * - Calcul de distance (formule de Haversine)
 */

// Génère un ID unique
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formate une date en "YYYY-MM-DD"
function formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Calcul la distance entre deux points en km (formule de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calcul la distance totale d'un trajet
function calculateTrajetDistance(points) {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
        total += calculateDistance(points[i-1][0], points[i-1][1], points[i][0], points[i][1]);
    }
    return total;
}

// Formate une distance en km ou m
function formatDistance(km) {
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;
}