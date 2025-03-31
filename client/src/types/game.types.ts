export type Player = {
  id: string;
  name: string;
  avatar: string;
  ready: boolean;
};

export type Spectator = {
  id: string;
  name: string;
};

export type Room = {
  id: string;
  players: Player[];
  spectators: Spectator[];
  isGameStarted: boolean;
};
