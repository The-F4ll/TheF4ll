# MainServ - Serveur TheF4ll

## Description

Le serveur MainServ est le cœur de l'application TheF4ll. Il gère la logique métier, la communication en temps réel et la persistance des données.

## Architecture

### Structure des Dossiers

```
MainServ/
├── src/
│   ├── config/         # Configuration et constantes
│   ├── controllers/    # Contrôleurs de l'application
│   ├── middleware/     # Middleware Express
│   ├── models/        # Modèles de données
│   ├── services/      # Services métier
│   └── server.js      # Point d'entrée
├── .env               # Variables d'environnement
└── package.json       # Dépendances
```

### Composants Principaux

#### 1. Configuration (config/)

- `constants.js` : Définition des constantes globales
- Configuration des paramètres de l'application

#### 2. Contrôleurs (controllers/)

- `roomController.js` : Gestion des salles de jeu
- `socketController.js` : Gestion des connexions WebSocket
- `gameController.js` : Logique du jeu

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

## API REST

### Routes Disponibles

- `GET /api/rooms` : Liste toutes les salles disponibles
- `POST /api/rooms` : Crée une nouvelle salle
- `DELETE /api/rooms/:roomId` : Supprime une salle spécifique

## WebSocket

### Événements Gérés

- Connexion/Déconnexion des clients
- Mise à jour de l'état du jeu
- Communication en temps réel entre les joueurs

## Installation

1. Cloner le repository
2. Installer les dépendances :

```bash
npm install
```

3. Configurer les variables d'environnement :

```bash
cp .env.example .env
# Éditer .env avec les valeurs appropriées
```

4. Démarrer le serveur :

```bash
npm start
```

## Variables d'Environnement

- `PORT` : Port du serveur (défaut: 3000)
- `NODE_ENV` : Environnement (development/production)

## Développement

- Utiliser `npm run dev` pour le développement avec hot-reload
- Les tests peuvent être exécutés avec `npm test`

## Sécurité

- CORS configuré pour la communication client-serveur
- Validation des données entrantes
- Gestion des erreurs centralisée
- Protection contre les attaques courantes
