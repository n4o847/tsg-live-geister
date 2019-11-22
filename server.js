const path = require("path");
const express = require("express");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(process.cwd(), "build")));

io.on("connection", (socket) => {
  //
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
