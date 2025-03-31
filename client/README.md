# Client TheF4ll

## Description
Le client TheF4ll est une application web moderne construite avec React et Vite. Il fournit l'interface utilisateur pour le jeu de programmation en temps réel.

## Technologies Utilisées
- React.js
- Vite
- TailwindCSS
- Socket.IO Client
- ESLint

## Structure du Projet
```
client/
├── src/              # Code source
├── public/           # Fichiers statiques
├── index.html        # Point d'entrée HTML
├── vite.config.js    # Configuration Vite
├── tailwind.config.js # Configuration TailwindCSS
└── package.json      # Dépendances
```

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

3. Pour la production :
```bash
npm run build
```

## Configuration

### Variables d'Environnement
Créer un fichier `.env` à la racine du projet client :
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## Architecture

### Composants Principaux
- Interface utilisateur réactive
- Gestion des connexions WebSocket
- Système de chat en temps réel
- Éditeur de code intégré
- Système de matchmaking

### Communication avec le Serveur
- API REST pour les opérations CRUD
- WebSocket pour les mises à jour en temps réel
- Gestion des événements de jeu

## Développement

### Commandes Disponibles
- `npm run dev` : Lance le serveur de développement
- `npm run build` : Compile pour la production
- `npm run preview` : Prévisualise la version de production
- `npm run lint` : Vérifie le code avec ESLint

### Standards de Code
- Utilisation de ESLint pour la qualité du code
- Convention de nommage des composants React
- Structure modulaire des composants

## Interface Utilisateur

### Fonctionnalités
- Interface de connexion/inscription
- Liste des salles disponibles
- Éditeur de code en temps réel
- Chat intégré
- Système de matchmaking
- Interface de jeu

### Design
- Utilisation de TailwindCSS pour le style
- Design responsive
- Thème sombre/clair
- Animations fluides

## Déploiement
1. Construire l'application :
```bash
npm run build
```

2. Les fichiers de production se trouvent dans le dossier `dist/`

## Support
Pour toute question ou problème, veuillez ouvrir une issue dans le repository GitHub.
