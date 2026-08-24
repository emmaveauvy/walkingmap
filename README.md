# Ma Carte de Marche

Une application web pour enregistrer et visualiser vos trajets à pied, avec la possibilité d'ajouter des épingles et de surligner vos rues préférées.

## 🚀 Fonctionnalités

- **Dessiner un trajet** : Cliquez sur "Dessiner un trajet", puis cliquez sur la carte pour ajouter des points.
- **Rechercher une rue** : Cliquez sur "Rechercher une rue", tapez le nom de la rue, et sélectionnez un résultat pour l'ajouter au trajet.
- **Sauvegarder un trajet** : Une fois le trajet dessiné, cliquez sur "Sauvegarder le trajet" et donnez-lui un nom (optionnel).
- **Ajouter une épingle** : Cliquez sur "Ajouter une épingle", puis cliquez sur la carte pour placer une épingle avec un commentaire.
- **Éditer/Supprimer un trajet** : Cliquez sur un trajet pour voir ses détails, puis utilisez les boutons pour éditer son nom/date ou le supprimer.
- **Exporter/Importer** : Utilisez les boutons "Exporter" et "Importer" pour sauvegarder ou charger vos données en JSON.
- **Affichage des trajets** : Tous vos trajets sont affichés automatiquement sur la carte avec leur couleur.

## 📥 Prérequis

- Un navigateur moderne (Chrome, Firefox, Edge, Safari)
- Une connexion internet (pour charger les tuiles de carte et la recherche)

## 🛠 Installation

1. Clonez ou téléchargez ce dépôt.
2. Ouvrez le fichier `index.html` dans votre navigateur.

> **Astuce** : Pour éviter les problèmes de CORS avec Nominatim, utilisez un serveur local comme [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (extension VS Code) ou lancez `python -m http.server` dans le terminal.

## 📂 Structure du projet