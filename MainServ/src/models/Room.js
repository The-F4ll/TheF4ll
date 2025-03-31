import { mountainLevels } from "../config/constants.js";
import { Player } from "./Player.js";
import { challenges } from "../config/challenges.js";

export class Room {
  constructor(id) {
    this.id = id;
    this.players = {};
    this.stage = 0;
    this.failed = false;
    this.started = false;
    this.completed = false;
    this.messages = [];
    this.nextId = 1;
    this.startTime = null;
    this.currentLevel = mountainLevels[0];
  }

  addPlayer(name, socketId) {
    const playerId = this.nextId++;
    this.players[playerId] = new Player(playerId, name, socketId);
    return playerId;
  }

  removePlayer(playerId) {
    delete this.players[playerId];
  }

  getPlayer(playerId) {
    return this.players[playerId];
  }

  setPlayerReady(playerId, ready) {
    const player = this.players[playerId];
    if (player) {
      player.setReady(ready);
    }
  }

  allPlayersReady() {
    return Object.values(this.players).every((p) => p.ready);
  }

  startGame() {
    if (!this.allPlayersReady()) return false;
    this.started = true;
    this.startTime = Date.now();
    return true;
  }

  submitPlayerCode(playerId, code) {
    const player = this.players[playerId];
    if (!player) return false;

    player.submitCode(code);
    const currentChallenge =
      challenges[playerId][this.stage % challenges[playerId].length];
    const timeElapsed = Date.now() - this.startTime;

    if (timeElapsed > currentChallenge.timeLimit) {
      this.failed = true;
      return false;
    }

    player.setValidated(currentChallenge.validation(code));
    return true;
  }

  checkGameState() {
    const allSubmitted = Object.values(this.players).every(
      (p) => p.code !== ""
    );
    const allValidated = Object.values(this.players).every((p) => p.validated);

    if (allSubmitted) {
      if (allValidated) {
        this.stage++;
        if (this.stage < mountainLevels.length) {
          this.currentLevel = mountainLevels[this.stage];
          this.startTime = Date.now();
          Object.values(this.players).forEach((p) => {
            p.code = "";
            p.validated = false;
          });
        } else {
          this.completed = true;
        }
      } else {
        this.failed = true;
      }
    }
  }

  addMessage(playerId, message) {
    const player = this.players[playerId];
    if (!player) return;

    this.messages.push({
      id: Date.now(),
      playerId,
      playerName: player.name,
      role: player.role,
      message,
      timestamp: Date.now(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      players: Object.values(this.players).map((p) => p.toJSON()),
      stage: this.stage,
      started: this.started,
      failed: this.failed,
      completed: this.completed,
      currentLevel: this.currentLevel,
      messages: this.messages,
    };
  }
}
