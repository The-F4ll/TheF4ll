import React from "react";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  disabled?: boolean; // Doit être un boolean optionnel
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelect,
}) => {
  // Normalement, ces avatars seraient chargés depuis des fichiers
  const avatars = [
    { id: "avatar1", name: "Avatar 1", color: "bg-red-500" },
    { id: "avatar2", name: "Avatar 2", color: "bg-blue-500" },
    { id: "avatar3", name: "Avatar 3", color: "bg-green-500" },
    { id: "avatar4", name: "Avatar 4", color: "bg-yellow-500" },
    { id: "avatar5", name: "Avatar 5", color: "bg-purple-500" },
    { id: "avatar6", name: "Avatar 6", color: "bg-pink-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className={`p-2 rounded-lg cursor-pointer transition-all ${
            selectedAvatar === avatar.id
              ? "ring-2 ring-blue-500 scale-105"
              : "hover:bg-gray-700"
          }`}
          onClick={() => onSelect(avatar.id)}
        >
          <div
            className={`w-16 h-16 mx-auto rounded-full ${avatar.color} flex items-center justify-center text-2xl font-bold`}
          >
            {avatar.name.charAt(0)}
          </div>
          <p className="mt-2 text-center text-sm">{avatar.name}</p>
        </div>
      ))}
    </div>
  );
};

export default AvatarSelector;
