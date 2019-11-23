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
  socket.on("disconnect", () => {
    const opponent = matching.get(socket);
    matching.delete(socket);
    matching.delete(opponent);
  });
  socket.on("wait", ({ board }) => {
    if (!waiting) {
      console.log("1st");
      waiting = { socket, board };
    } else {
      console.log("2nd");
      matching.set(socket, waiting.socket);
      matching.set(waiting.socket, socket);
      waiting.socket.emit("match", { turn: true, board: board });
      socket.emit("match", { turn: false, board: waiting.board });
      waiting = null;
    }
  });
  socket.on("move", (data) => {
    matching.get(socket).emit("move", data);
  });

  // setInterval(() => {
  //   socket.emit("hoge");
  // }, 1000);
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
