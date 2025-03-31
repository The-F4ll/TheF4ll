import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [shareCode, setShareCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    // Demander la liste des salles au chargement
    socket.emit('get_rooms');
    socket.emit('get_active_games');

    // Écouter les mises à jour des salles
    socket.on('rooms_update', (roomsData) => {
      setRooms(roomsData);
    });

    // Écouter les mises à jour des parties actives
    socket.on('active_games_update', (games) => {
      setActiveGames(games);
    });

    // Écouter la création de salle
    socket.on('room_created', (data) => {
      toast.success(data.message);
      setShareCode(data.shareCode);
      setSelectedRoom(data.room);
    });

    // Écouter les erreurs
    socket.on('error', (error) => {
      toast.error(error.message);
    });

    // Écouter la confirmation de connexion à une salle
    socket.on('room_joined', (data) => {
      toast.success(data.message);
      setSelectedRoom({
        id: data.roomId,
        shareCode: data.shareCode,
        players: [{ id: data.playerId, name: data.playerName }]
      });
    });

    return () => {
      socket.off('rooms_update');
      socket.off('active_games_update');
      socket.off('room_created');
      socket.off('error');
      socket.off('room_joined');
    };
  }, []);

  const createRoom = () => {
    socket.emit('create_room');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!shareCode || !playerName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    socket.emit('join_room', { shareCode, playerName });
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {/* Création de salle */}
      <div className="create-room">
        <h2>Créer une nouvelle salle</h2>
        <button onClick={createRoom}>Créer une salle</button>
        {shareCode && (
          <div className="share-code">
            <p>Code de partage: <strong>{shareCode}</strong></p>
            <button onClick={() => navigator.clipboard.writeText(shareCode)}>
              Copier le code
            </button>
          </div>
        )}
      </div>

      {/* Rejoindre une salle */}
      <div className="join-room">
        <h2>Rejoindre une salle</h2>
        <form onSubmit={joinRoom}>
          <input
            type="text"
            placeholder="Code de partage"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value.toUpperCase())}
          />
          <input
            type="text"
            placeholder="Votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button type="submit">Rejoindre</button>
        </form>
      </div>

      {/* Liste des salles */}
      <div className="rooms-list">
        <h2>Salles disponibles</h2>
        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <h3>Salle {room.shareCode}</h3>
              <p>Joueurs: {room.players.length}/4</p>
              <p>Niveau: {room.currentLevel}</p>
              <p>Statut: {room.status}</p>
              <p>Temps restant: {room.timeRemaining}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parties actives */}
      <div className="active-games">
        <h2>Parties en cours</h2>
        <div className="games-grid">
          {activeGames.map(game => (
            <div key={game.id} className="game-card">
              <h3>Partie {game.shareCode}</h3>
              <p>Joueurs: {game.players.length}/4</p>
              <p>Niveau: {game.currentLevel}</p>
              <p>Temps restant: {game.timeRemaining}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* Salle sélectionnée */}
      {selectedRoom && (
        <div className="selected-room">
          <h2>Salle actuelle</h2>
          <div className="room-details">
            <p>Code: {selectedRoom.shareCode}</p>
            <p>Joueurs:</p>
            <ul>
              {selectedRoom.players.map(player => (
                <li key={player.id}>{player.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 