const { createServer } = require("http");
const path = require("path");

const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"))
})

const PORT = 3000;

io.on("connection", (socket) => {
  console.log(`A user connected`);
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});