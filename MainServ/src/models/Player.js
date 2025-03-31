import { playerRoles } from "../config/constants.js";

export class Player {
  constructor(id, name, socketId, role) {
    this.id = id;
    this.name = name || `Grimpeur ${id}`;
    this.socketId = socketId;
    this.code = "";
    this.validated = false;
    this.ready = false;
    this.role = role || playerRoles[id - 1];
  }

  setReady(ready) {
    this.ready = ready;
  }

  submitCode(code) {
    this.code = code;
  }

  setValidated(validated) {
    this.validated = validated;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      ready: this.ready,
      validated: this.validated,
    };
  }
}
