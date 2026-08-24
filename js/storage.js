/**
 * storage.js
 * Gestion du localStorage pour les trajets et épingles.
 */

const STORAGE_KEY = 'marche_trajets';

// Charge les trajets depuis localStorage
function loadTrajets() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { trajets: [] };
}

// Sauvegarde les trajets
function saveTrajets(trajets) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ trajets }));
}

// Ajoute un trajet
function addTrajet(trajet) {
    const data = loadTrajets();
    data.trajets.push(trajet);
    saveTrajets(data.trajets);
    return trajet;
}

// Met à jour un trajet
function updateTrajet(id, updates) {
    const data = loadTrajets();
    const index = data.trajets.findIndex(t => t.id === id);
    if (index !== -1) {
        data.trajets[index] = { ...data.trajets[index], ...updates };
        saveTrajets(data.trajets);
        return data.trajets[index];
    }
    return null;
}

// Supprime un trajet
function deleteTrajet(id) {
    const data = loadTrajets();
    data.trajets = data.trajets.filter(t => t.id !== id);
    saveTrajets(data.trajets);
}

// Exporte les données
function exportData() {
    const data = loadTrajets();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marche_trajets_${formatDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Importe les données
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.trajets && Array.isArray(data.trajets)) {
                    saveTrajets(data.trajets);
                    resolve(data.trajets);
                } else {
                    reject(new Error("Fichier invalide : 'trajets' manquant."));
                }
            } catch (err) {
                reject(new Error("Fichier invalide : JSON non valide."));
            }
        };
        reader.onerror = () => reject(new Error("Erreur de lecture du fichier."));
        reader.readAsText(file);
    });
}