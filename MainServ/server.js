const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

let rooms = {}; // { roomId: { players: {}, stage: 0, failed: false, nextId: 1 } }

io.on("connection", (socket) => {
  console.log(`New client: ${socket.id}`);

  socket.on("join_room", ({ roomId }) => {
    if (!rooms[roomId])
      rooms[roomId] = { players: {}, stage: 0, failed: false, nextId: 1 };

    const playerId = rooms[roomId].nextId++;

    rooms[roomId].players[playerId] = {
      socketId: socket.id,
      code: "",
      validated: false,
    };

    socket.join(roomId);
    socket.emit("assigned_id", playerId);
    io.to(roomId).emit("player_joined", Object.keys(rooms[roomId].players));
  });

  socket.on("submit_code", ({ roomId, playerId, code }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players[playerId].code = code;

    const expectedCodes = [
      (code) => code.includes("return") && code.includes("42"),
      (code) => code.includes("map") && code.includes("=>"),
      (code) => code.includes("filter") && code.includes("% 2 === 0"),
      (code) => code.includes("reduce") && code.includes("acc + curr"),
    ];

    const stageIndex = room.stage % expectedCodes.length;
    const isValid = expectedCodes[stageIndex](code);

    room.players[playerId].validated = isValid;

    const allSubmitted = Object.values(room.players).every(
      (p) => p.code !== ""
    );
    const allValidated = Object.values(room.players).every((p) => p.validated);

    if (allSubmitted) {
      if (allValidated) {
        room.stage++;
        io.to(roomId).emit("stage_cleared", room.stage);
      } else {
        room.failed = true;
        io.to(roomId).emit(
          "game_over",
          "Un ou plusieurs joueurs ont échoué. Toute l'équipe a perdu !"
        );
      }
      Object.values(room.players).forEach((p) => {
        p.code = "";
        p.validated = false;
      });
    } else {
      io.to(roomId).emit("waiting_others", playerId);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      for (const playerId in room.players) {
        if (room.players[playerId].socketId === socket.id) {
          delete room.players[playerId];
        }
      }
      io.to(roomId).emit("player_left", Object.keys(room.players));
    }
  });
});

server.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
