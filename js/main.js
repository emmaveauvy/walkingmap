/**
 * main.js
 * Logique principale :
 * - Carte Leaflet
 * - Trajets (dessin, sauvegarde, édition, suppression)
 * - Épingles (ajout, suppression, types avec couleurs)
 */

// Variables globales
let map;
let currentTrajetPoints = [];
let currentTrajetLayer = null;
let currentColor = '#FF5733';
let isDrawing = false;
let isAddingEpingle = false;
let allTrajetsLayers = [];
let allEpinglesLayers = [];
let currentEpingleMarker = null;
let currentEpingleLatLng = null;

// Couleurs des épingles
const EPINGLE_COLORS = {
    restaurant: '#e74c3c',
    bar: '#f39c12',
    monument: '#3498db',
    parc: '#2ecc71',
    magasin: '#9b59b6',
    autre: '#7f8c8d'
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initEventListeners();
    loadAndDisplayAllTrajets();
});

// Initialise la carte
function initMap() {
    map = L.map('map').setView([48.8566, 2.3522], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    map.setMinZoom(5);
    map.setMaxZoom(19);
}

// Initialise les écouteurs
function initEventListeners() {
    // Boutons principaux
    document.getElementById('draw-btn').addEventListener('click', startDrawing);
    document.getElementById('search-btn').addEventListener('click', toggleSearch);
    document.getElementById('save-btn').addEventListener('click', showSavePanel);
    document.getElementById('add-epingle-btn').addEventListener('click', startAddingEpingle);
    document.getElementById('export-btn').addEventListener('click', exportData);

    // Importer
    document.getElementById('import-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                importData(file).then(() => {
                    alert('Données importées !');
                    loadAndDisplayAllTrajets();
                }).catch(err => alert(`Erreur : ${err.message}`));
            }
        };
        input.click();
    });

    // Sélecteur de couleur
    document.getElementById('color-picker').addEventListener('input', (e) => {
        currentColor = e.target.value;
        if (currentTrajetLayer) currentTrajetLayer.setStyle({ color: currentColor });
    });

    // Barre de recherche
    document.getElementById('street-search').addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length < 3) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }
        const results = await searchStreet(query);
        displaySearchResults(results);
    });

    // Panneau de sauvegarde trajet
    document.getElementById('confirm-save').addEventListener('click', saveCurrentTrajet);
    document.getElementById('cancel-save').addEventListener('click', hideSavePanel);

    // Panneau d'ajout épingle
    document.getElementById('confirm-epingle').addEventListener('click', confirmAddEpingle);
    document.getElementById('cancel-epingle').addEventListener('click', cancelAddEpingle);

    // Panneau d'info trajet (écouteurs UNIQUES)
    document.getElementById('save-edit').addEventListener('click', () => {
        const trajetId = document.getElementById('info-panel').dataset.trajetId;
        if (trajetId) saveTrajetEdit(trajetId);
    });

    document.getElementById('delete-trajet').addEventListener('click', () => {
        const trajetId = document.getElementById('info-panel').dataset.trajetId;
        if (trajetId && confirm('Supprimer ce trajet ?')) {
            deleteTrajet(trajetId);
            hideInfoPanel();
            loadAndDisplayAllTrajets();
        }
    });

    document.getElementById('close-info').addEventListener('click', hideInfoPanel);

    // Clic sur la carte
    map.on('click', (e) => {
        if (isDrawing) {
            addPointToTrajet(e.latlng.lat, e.latlng.lng);
        } else if (isAddingEpingle) {
            if (currentEpingleMarker) map.removeLayer(currentEpingleMarker);
            currentEpingleLatLng = e.latlng;
            currentEpingleMarker = L.marker(e.latlng, {
                icon: L.divIcon({
                    className: 'epingle-marker',
                    html: '?',
                    iconSize: [24, 24],
                }),
            }).addTo(map);
            document.getElementById('epingle-panel').classList.remove('hidden');
        }
    });
}

// Mode dessin
function startDrawing() {
    isDrawing = true;
    isAddingEpingle = false;
    currentTrajetPoints = [];
    if (currentTrajetLayer) map.removeLayer(currentTrajetLayer);
    currentTrajetLayer = L.polyline([], {
        color: currentColor,
        weight: 5,
        opacity: 0.8,
        scaleWithZoom: false,
    }).addTo(map);
}

// Ajoute un point au trajet
function addPointToTrajet(lat, lng) {
    currentTrajetPoints.push([lat, lng]);
    currentTrajetLayer.setLatLngs(currentTrajetPoints);
}

// Barre de recherche
function toggleSearch() {
    const container = document.getElementById('search-container');
    container.classList.toggle('hidden');
    if (!container.classList.contains('hidden')) {
        document.getElementById('street-search').focus();
    }
}

// Affiche les résultats de recherche
function displaySearchResults(results) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">Aucun résultat</div>';
        return;
    }
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = result.display_name;
        item.onclick = () => addStreetFromSearch(result);
        container.appendChild(item);
    });
}

// Ajoute une rue depuis la recherche
function addStreetFromSearch(streetData) {
    const layer = addStreetToMap(streetData, map, currentColor);
    if (layer) {
        const coords = layer.getLatLngs().map(latlng => [latlng.lat, latlng.lng]);
        currentTrajetPoints = currentTrajetPoints.concat(coords);
        currentTrajetLayer.setLatLngs(currentTrajetPoints);
    }
    toggleSearch();
    document.getElementById('street-search').value = '';
}

// Mode ajout épingle
function startAddingEpingle() {
    isAddingEpingle = true;
    isDrawing = false;
    if (currentTrajetLayer) {
        map.removeLayer(currentTrajetLayer);
        currentTrajetLayer = null;
    }
}

// Annule l'ajout d'une épingle
function cancelAddEpingle() {
    isAddingEpingle = false;
    if (currentEpingleMarker) {
        map.removeLayer(currentEpingleMarker);
        currentEpingleMarker = null;
    }
    document.getElementById('epingle-panel').classList.add('hidden');
    document.getElementById('epingle-nom').value = '';
}

// Confirme l'ajout d'une épingle
function confirmAddEpingle() {
    const nom = document.getElementById('epingle-nom').value.trim();
    const type = document.getElementById('epingle-type').value;
    const color = EPINGLE_COLORS[type];

    if (!nom) {
        alert('Veuillez donner un nom à cette épingle.');
        return;
    }
    if (!currentEpingleLatLng) {
        alert('Veuillez cliquer sur la carte pour placer l\'épingle.');
        return;
    }

    const data = loadTrajets();
    let orphelinTrajet = data.trajets.find(t => t.nom === "Épingles orphelines");
    if (!orphelinTrajet) {
        orphelinTrajet = {
            id: generateId(),
            nom: "Épingles orphelines",
            date: formatDate(),
            couleur: "#999999",
            points: [],
            distance: 0,
            epingles: [],
        };
        data.trajets.push(orphelinTrajet);
    }

    orphelinTrajet.epingles.push({
        lat: currentEpingleLatLng.lat,
        lng: currentEpingleLatLng.lng,
        nom: nom,
        type: type,
        color: color
    });

    saveTrajets(data.trajets);
    cancelAddEpingle();
    loadAndDisplayAllTrajets();
    alert('Épingle ajoutée !');
}

// Affiche le panneau de sauvegarde trajet
function showSavePanel() {
    if (currentTrajetPoints.length < 2) {
        alert('Ajoutez au moins 2 points pour sauvegarder un trajet.');
        return;
    }
    document.getElementById('save-panel').classList.remove('hidden');
}

// Cache le panneau de sauvegarde
function hideSavePanel() {
    document.getElementById('save-panel').classList.add('hidden');
}

// Sauvegarde le trajet en cours
function saveCurrentTrajet() {
    const nom = document.getElementById('trajet-nom-input').value.trim();
    const date = formatDate();
    const distance = calculateTrajetDistance(currentTrajetPoints);

    const trajet = {
        id: generateId(),
        nom: nom || `Trajet du ${date}`,
        date: date,
        couleur: currentColor,
        points: currentTrajetPoints,
        distance: distance,
        epingles: [],
    };

    addTrajet(trajet);
    hideSavePanel();
    document.getElementById('trajet-nom-input').value = '';
    resetCurrentTrajet();
    loadAndDisplayAllTrajets();
    alert('Trajet sauvegardé !');
}

// Réinitialise le trajet en cours
function resetCurrentTrajet() {
    currentTrajetPoints = [];
    if (currentTrajetLayer) {
        map.removeLayer(currentTrajetLayer);
        currentTrajetLayer = null;
    }
    isDrawing = false;
}

// Charge et affiche tous les trajets
function loadAndDisplayAllTrajets() {
    allTrajetsLayers.forEach(layer => map.removeLayer(layer));
    allEpinglesLayers.forEach(layer => map.removeLayer(layer));
    allTrajetsLayers = [];
    allEpinglesLayers = [];

    const data = loadTrajets();
    data.trajets.forEach(trajet => {
        // Affiche le trajet
        const layer = L.polyline(trajet.points, {
            color: trajet.couleur,
            weight: 5,
            opacity: 0.8,
            scaleWithZoom: false,
        }).addTo(map);
        allTrajetsLayers.push(layer);

        layer.on('click', () => showTrajetInfo(trajet));

        // Affiche les épingles
        trajet.epingles.forEach(epingle => {
            const marker = L.marker([epingle.lat, epingle.lng], {
                icon: L.divIcon({
                    className: `epingle-marker epingle-${epingle.type}`,
                    html: '!',
                    iconSize: [24, 24],
                }),
            }).addTo(map);
            allEpinglesLayers.push(marker);

            marker.on('click', (e) => {
                e.originalEvent.stopPropagation();
                if (confirm(`Supprimer l'épingle "${epingle.nom}" (${epingle.type}) ?`)) {
                    deleteEpingleFromTrajet(trajet.id, epingle);
                }
            });
        });
    });
}

// Affiche les infos d'un trajet
function showTrajetInfo(trajet) {
    document.getElementById('info-panel').dataset.trajetId = trajet.id;
    document.getElementById('edit-nom').value = trajet.nom;
    document.getElementById('edit-date').value = trajet.date;
    document.getElementById('trajet-distance').textContent = `Distance : ${formatDistance(trajet.distance)}`;

    const epinglesContainer = document.getElementById('trajet-epingles');
    epinglesContainer.innerHTML = '<h3>Épingles</h3>';
    if (trajet.epingles.length > 0) {
        trajet.epingles.forEach((epingle, index) => {
            const item = document.createElement('div');
            item.className = 'epingle-item';
            item.innerHTML = `
                <div class="epingle-info">
                    <span class="epingle-type" style="background-color: ${epingle.color}">${epingle.type}</span>
                    <span>${epingle.nom}</span>
                </div>
                <button class="delete-epingle" data-index="${index}" data-trajet-id="${trajet.id}">❌</button>
            `;
            epinglesContainer.appendChild(item);
        });
    } else {
        epinglesContainer.innerHTML += '<p>Aucune épingle pour ce trajet.</p>';
    }

    document.getElementById('info-panel').classList.remove('hidden');
}

// Cache le panneau d'info
function hideInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
}

// Sauvegarde les modifications d'un trajet
function saveTrajetEdit(trajetId) {
    const newNom = document.getElementById('edit-nom').value;
    const newDate = document.getElementById('edit-date').value;
    updateTrajet(trajetId, { nom: newNom, date: newDate });
    hideInfoPanel();
    loadAndDisplayAllTrajets();
}

// Supprime une épingle d'un trajet
function deleteEpingleFromTrajet(trajetId, epingle) {
    const data = loadTrajets();
    const trajet = data.trajets.find(t => t.id === trajetId);
    if (trajet) {
        trajet.epingles = trajet.epingles.filter(e => e !== epingle);
        saveTrajets(data.trajets);
        loadAndDisplayAllTrajets();
        if (document.getElementById('info-panel').dataset.trajetId === trajetId) {
            showTrajetInfo(trajet);
        }
    }
}