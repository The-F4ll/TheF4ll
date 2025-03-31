import React from 'react';
import { ROOM_STATUS } from '../config/constants';

const RoomCard = ({ room, onJoin }) => {
  const isFull = room.players.length >= 4;
  const isInProgress = room.status === ROOM_STATUS.IN_PROGRESS;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Salle {room.id}
          </h3>
          <p className="text-sm text-gray-600">
            {room.players.length} / 4 joueurs
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {room.players.map((player) => (
            <span
              key={player.id}
              className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm"
            >
              {player.name}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className={`text-sm font-medium ${
            room.status === ROOM_STATUS.WAITING
              ? "text-green-600"
              : "text-indigo-600"
          }`}>
            {room.status === ROOM_STATUS.WAITING ? "En attente" : "En cours"}
          </span>
          <button
            onClick={onJoin}
            disabled={isFull || isInProgress}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isFull || isInProgress
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isFull ? "Plein" : isInProgress ? "En cours" : "Rejoindre"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 