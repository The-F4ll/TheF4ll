# TheF4ll - Architecture du Projet

## Vue d'ensemble
TheF4ll est un projet de jeu multijoueur en temps réel utilisant une architecture client-serveur. Le projet est divisé en deux parties principales : le serveur (MainServ) et le client.

## Structure du Projet

```
TheF4ll/
├── MainServ/           # Serveur Node.js
│   ├── src/           # Code source du serveur
│   │   ├── config/    # Configuration et constantes
│   │   ├── controllers/ # Contrôleurs pour la logique métier
│   │   ├── middleware/ # Middleware Express
│   │   ├── models/    # Modèles de données
│   │   ├── services/  # Services métier
│   │   └── server.js  # Point d'entrée du serveur
│   └── package.json   # Dépendances Node.js
└── client/            # Application client
```

## Architecture Serveur (MainServ)

### Technologies Utilisées
- Node.js avec Express.js pour l'API REST
- Socket.IO pour la communication en temps réel
- Architecture MVC (Model-View-Controller)

### Composants Principaux

#### 1. Configuration (config/)
- Gestion des constantes et configurations
- Variables d'environnement

#### 2. Contrôleurs (controllers/)
- Gestion des requêtes HTTP
- Logique métier
- Gestion des événements Socket.IO

#### 3. Services (services/)
- Logique métier complexe
- Opérations sur les données
- Communication avec les modèles

#### 4. Modèles (models/)
- Définition des structures de données
- Validation des données
- Interaction avec la base de données

#### 5. Middleware (middleware/)
- Authentification
- Validation des requêtes
- Gestion des erreurs

## Architecture Client

Le client est une application web qui communique avec le serveur via :
- API REST pour les opérations CRUD
- WebSocket pour les mises à jour en temps réel

## Communication

### API REST
- GET /api/rooms : Liste des salles
- POST /api/rooms : Création d'une salle
- DELETE /api/rooms/:roomId : Suppression d'une salle

### WebSocket
- Communication en temps réel pour :
  - Mise à jour de l'état du jeu
  - Chat en temps réel
  - Synchronisation des actions des joueurs

## Sécurité
- CORS configuré pour la communication client-serveur
- Validation des données
- Gestion des erreurs centralisée

## Installation et Démarrage

### Serveur
```bash
cd MainServ
npm install
npm start
```

### Client
```bash
cd client
npm install
npm start
```

## Variables d'Environnement
Créer un fichier `.env` basé sur `.env.example` avec les configurations nécessaires.

## Fonctionnalités

- Interface moderne et responsive
- Mise à jour en temps réel des parties et des scores
- Système de classement en direct
- Mode multijoueur
- Filtrage et recherche des parties
- Vue détaillée des parties et des joueurs

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn

## Installation

1. Clonez le dépôt :
\`\`\`bash
git clone https://github.com/votre-username/thef4ll.git
cd thef4ll
\`\`\`

2. Installez les dépendances du serveur :
\`\`\`bash
cd MainServ
npm install
\`\`\`

3. Installez les dépendances du client :
\`\`\`bash
cd ../MainClient
npm install
\`\`\`

## Configuration

1. Créez un fichier \`.env\` dans le dossier \`MainServ\` :
\`\`\`env
PORT=3000
NODE_ENV=development
\`\`\`

2. Créez un fichier \`.env\` dans le dossier \`MainClient\` :
\`\`\`env
VITE_SOCKET_URL=http://localhost:3000
\`\`\`

## Lancement

1. Démarrez le serveur :
\`\`\`bash
cd MainServ
npm run dev
\`\`\`

2. Dans un autre terminal, démarrez le client :
\`\`\`bash
cd MainClient
npm run dev
\`\`\`

3. Ouvrez votre navigateur et accédez à \`http://localhost:5173\`

## Structure du projet

```
thef4ll/
├── MainServ/              # Serveur Node.js
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Contrôleurs
│   │   └── server.js     # Point d'entrée du serveur
│   └── package.json
│
└── MainClient/           # Client Vue.js
    ├── src/
    │   ├── components/  # Composants Vue
    │   ├── views/       # Pages
    │   ├── stores/      # Stores Pinia
    │   ├── router/      # Configuration des routes
    │   ├── App.vue      # Composant racine
    │   └── main.js      # Point d'entrée du client
    └── package.json
```

## Technologies utilisées

- Backend :
  - Node.js
  - Express
  - Socket.IO
  - UUID

- Frontend :
  - React
  - ViteJS
  - TailWindCSS
  - Socket.IO Client
  - Font Awesome
