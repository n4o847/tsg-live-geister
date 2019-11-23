const path = require("path");
const express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(process.cwd(), "build")));

let waiting = null;
const matching = new Map();

io.on("connection", (socket) => {
  socket.on("wait", (board) => {
    if (!waiting) {
      waiting = { socket, board };
    } else {
      matching.set(socket, socket.waiting);
      matching.set(socket.waiting, socket);
      socket.waiting.emit("match", {board: board});
      socket.emit("match", { board: socket.board });
      waiting = null;
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
