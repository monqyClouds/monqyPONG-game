const { createServer } = require("http");

const { Server: socketServer } = require("socket.io");

const { app } = require("./api");

const httpServer = createServer(app);
const io = new socketServer(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const sockets = require("./sockets");

const PORT = 3000;

httpServer.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
	sockets.listen(io);
});
