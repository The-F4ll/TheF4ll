import { io, Socket } from "socket.io-client";
import { Player, Spectator } from "../types/game.types";

// Types pour les événements socket
export type SocketResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Types pour les payloads des événements
export type JoinRoomPayload = {
  roomId: string;
  player?: Omit<Player, "id">;
  spectator?: Omit<Spectator, "id">;
};

export type SubmitCodePayload = {
  roomId: string;
  playerId: string;
  code: string;
};

export type VotePayload = {
  roomId: string;
  spectatorId: string;
  option: string;
};

export type PlayerReadyPayload = {
  roomId: string;
  playerId: string;
  ready: boolean;
};

export type StartGamePayload = {
  roomId: string;
};

// Liste des événements Socket.IO
export enum SocketEvents {
  // Événements natifs Socket.IO
  CONNECT = "connect",
  DISCONNECT = "disconnect",

  // Événements client → serveur
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  PLAYER_READY = "player_ready",
  START_GAME = "start_game",
  SUBMIT_CODE = "submit_code",
  REQUEST_HINT = "request_hint",
  CAST_VOTE = "cast_vote",

  // Événements serveur → client
  ASSIGNED_ID = "assigned_id",
  ROOM_UPDATED = "room_updated",
  GAME_STARTED = "game_started",
  GAME_OVER = "game_over",
  STAGE_CLEARED = "stage_cleared",
  WAITING_OTHERS = "waiting_others",
  RECEIVE_HINT = "receive_hint",
  VOTES_UPDATED = "votes_updated",
  ERROR = "error",
}

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private serverUrl =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

  // Ajouter un getter pour vérifier l'état de la connexion
  public get isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  // Initialiser la connexion
  public connect(): void {
    if (this.socket) return;

    this.socket = io(this.serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    this.setupDefaultListeners();
    console.log("Socket.IO connection initialized");
  }

  // Déconnecter
  public disconnect(): void {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
    console.log("Socket.IO disconnected");
  }

  // Configurer les écouteurs par défautx
  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket.IO connected with ID:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    // Écouteur d'erreurs global
    this.socket.on(SocketEvents.ERROR, (error) => {
      console.error("Socket.IO server error:", error);
    });
  }

  // Méthode pour s'abonner à un événement
  public on<T>(event: SocketEvents, callback: (data: T) => void): () => void {
    if (!this.socket) {
      console.error("Socket not connected");
      return () => {};
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());

      // S'abonner à l'événement socket
      this.socket.on(event, (data: T) => {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
          callbacks.forEach((cb) => cb(data));
        }
      });
    }

    const callbacks = this.listeners.get(event)!;
    callbacks.add(callback);

    // Fonction pour se désabonner
    return () => {
      const callbackSet = this.listeners.get(event);
      if (callbackSet) {
        callbackSet.delete(callback);
      }
    };
  }

  // Émettre un événement
  public emit<T, R = SocketResponse<T>>(
    event: SocketEvents,
    data?: any
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit(event, data, (response: R) => {
        resolve(response);
      });
    });
  }

  // Méthodes spécifiques pour les actions du jeu

  // Rejoindre une salle en tant que joueur
  public joinRoom(roomId: string, playerData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.connect();
      }

      if (!this.socket) {
        return reject(new Error("Socket connection failed"));
      }

      this.socket.emit(
        "join_room",
        { roomId, player: playerData },
        (response: any) => {
          console.log("Réponse brute du serveur:", response);

          // Vérifier si la réponse est une erreur
          if (response && typeof response === "object" && response.error) {
            console.error("Erreur serveur:", response.error);
            reject(new Error(response.error));
            return;
          }

          // Vérifier si la réponse est un ID valide
          if (response && typeof response === "string") {
            resolve(response);
          } else {
            console.error("Réponse invalide du serveur:", response);
            reject(new Error("Format de réponse serveur invalide"));
          }
        }
      );
    });
  }

  // Rejoindre une salle en tant que spectateur
  // public async joinRoomAsSpectator(
  //   roomId: string,
  //   spectator: Omit<Spectator, "id">
  // ): Promise<string> {
  //   try {
  //     const payload: JoinRoomPayload = { roomId, spectator };
  //     const response = await this.emit<string>(SocketEvents.JOIN_ROOM, payload);

  //     if ("success" in response && !response.success) {
  //       throw new Error(response.error || "Failed to join room as spectator");
  //     }

  //     return response as unknown as string;
  //   } catch (error) {
  //     console.error("Error joining room as spectator:", error);
  //     throw error;
  //   }
  // }

  // Dans socket.ts ou socketService.ts
  public joinRoomAsSpectator(
    roomId: string,
    spectatorData: Omit<Spectator, "id">,
    existingId?: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        this.connect();
      }

      // Préparer les données à envoyer au serveur
      const dataToSend = {
        roomId,
        spectator: {
          ...spectatorData,
          id: existingId, // Utiliser l'ID existant s'il est fourni
        },
      };

      if (!this.socket) {
        return reject(new Error("Socket connection failed"));
      }

      this.socket.emit(
        "join_room",
        dataToSend,
        (response: string | { error: string }) => {
          if (typeof response === "string") {
            resolve(response); // Le serveur renvoie l'ID du spectateur
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }

  // Définir l'état "prêt" d'un joueur
  public async setPlayerReady(
    roomId: string,
    playerId: string,
    ready: boolean
  ): Promise<void> {
    try {
      const payload: PlayerReadyPayload = { roomId, playerId, ready };
      await this.emit(SocketEvents.PLAYER_READY, payload);
    } catch (error) {
      console.error("Error setting player ready state:", error);
      throw error;
    }
  }

  // Démarrer la partie
  public async startGame(roomId: string): Promise<void> {
    try {
      const payload: StartGamePayload = { roomId };
      await this.emit(SocketEvents.START_GAME, payload);
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  }

  // Soumettre du code (réponse)
  public async submitCode(
    roomId: string,
    playerId: string,
    code: string
  ): Promise<boolean> {
    try {
      const payload: SubmitCodePayload = { roomId, playerId, code };
      const response = await this.emit<{ correct: boolean }>(
        SocketEvents.SUBMIT_CODE,
        payload
      );

      if ("data" in response) {
        return response.data?.correct || false;
      }

      return false;
    } catch (error) {
      console.error("Error submitting code:", error);
      return false;
    }
  }

  // Demander un indice
  public async requestHint(roomId: string, playerId: string): Promise<string> {
    try {
      const payload = { roomId, playerId };
      const response = await this.emit<string>(
        SocketEvents.REQUEST_HINT,
        payload
      );

      if ("data" in response) {
        return response.data || "";
      }

      return "";
    } catch (error) {
      console.error("Error requesting hint:", error);
      return "";
    }
  }

  // Voter (pour les spectateurs)
  public async castVote(
    roomId: string,
    spectatorId: string,
    option: string
  ): Promise<void> {
    try {
      const payload: VotePayload = { roomId, spectatorId, option };
      await this.emit(SocketEvents.CAST_VOTE, payload);
    } catch (error) {
      console.error("Error casting vote:", error);
      throw error;
    }
  }

  // Quitter une salle
  public async leaveRoom(
    roomId: string,
    id: string,
    isSpectator: boolean
  ): Promise<void> {
    try {
      const payload = { roomId, id, isSpectator };
      await this.emit(SocketEvents.LEAVE_ROOM, payload);
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const socketService = new SocketService();
export default socketService;
