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

const PORT = 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
})


io.on("connection", (socket) => {
  console.log(`A user connected`);
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
});