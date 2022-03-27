let readyPlayerCount = 0;

function listen(io) {
	const pongNameSpace = io.of("/pong");
	const playAgainVote = new Map();

	pongNameSpace.on("connection", (socket) => {
		console.log(`A user connected ${socket.id}`);
		let room;

		const toPlayAgain = () => {
			if (playAgainVote === 2) {
				console.log();
			}
		};

		socket.on("ready", () => {
			room = "room" + Math.floor(readyPlayerCount / 2);
			socket.join(room);
			console.log("Player ready ", socket.id);
			readyPlayerCount++;

			console.log(room);

			if (readyPlayerCount % 2 === 0) {
				pongNameSpace.in(room).emit("startGame", socket.id);
			}
		});

		socket.on("paddleMove", (paddleData) => {
			socket.to(room).emit("paddleMove", paddleData);
		});

		socket.on("ballMove", (ballData) => {
			socket.to(room).emit("ballMove", ballData);
		});

		socket.on("playAgain", (vote) => {
			const playerRoom = playAgainVote.get(room);

			if (vote !== true) {
				socket.to(room).emit("endGame");
				socket.leave(room);
				
				if (playerRoom) playAgainVote.delete(room);
				return;
			}

			const playerId = socket.id;

			if (!playerRoom) {
				playAgainVote.set(room, playerId);
			} else {
				pongNameSpace.in(room).emit("startGame", socket.id);
				playAgainVote.delete(room);
				console.log(playerRoom);
			} 
		});

		socket.on("disconnect", (reason) => { 
			console.log(`Client ${socket.id} disconnect: ${reason}`);
			socket.leave(room);
		});
	});
}

module.exports = { listen };
