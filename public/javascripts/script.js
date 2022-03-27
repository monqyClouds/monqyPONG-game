// Canvas Related
const { body } = document;
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
let width = 500;
let height = 700;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const socket = io("/pong");
let isReferee = false;
let isOpponentReady = false;
let paddleIndex = 0;

const isMobile = window.matchMedia("(max-width: 600px)")
const gameOverEl = document.createElement("div");

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [225, 225];
let trajectoryX = [0, 0];
let playerMoved = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;
// let computerSpeed = 4;

// Score for Both Players
let score = [0, 0];
const winningScore = 2;
let isGameOver = true;
let isNewGame = true;

// Create Canvas Element
function createCanvas() {
	canvas.id = "canvas";
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	renderCanvas();
}

// Wait for Opponents
function renderIntro() {
	// Canvas Background
	context.fillStyle = "black";
	context.fillRect(0, 0, width, height);

	// Intro Text
	context.fillStyle = "white";
	context.font = "32px Courier New";
	context.fillText("Waiting for opponent...", 20, canvas.height / 2 - 30);
}

// Render Everything on Canvas
function renderCanvas() {
	// Canvas Background
	context.fillStyle = "black";
	context.fillRect(0, 0, width, height);

	// Paddle Color
	context.fillStyle = "white";

	// Bottom Paddle
	context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

	// Top Paddle
	context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

	// Dashed Center Line
	context.beginPath();
	context.setLineDash([4]);
	context.moveTo(0, 350);
	context.lineTo(500, 350);
	context.strokeStyle = "grey";
	context.stroke();

	// Ball
	context.beginPath();
	context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
	context.fillStyle = "white";
	context.fill();

	// Score
	context.font = "32px Courier New";
	context.fillText(score[0], 20, canvas.height / 2 + 50);
	context.fillText(score[1], 20, canvas.height / 2 - 30);
}

// Reset Ball to Center
function ballReset() {
	ballX = width / 2;
	ballY = height / 2;
	speedY = 3;

	socket.emit("ballMove", {
		ballX,
		ballY,
		score,
	});
}

// Adjust Ball Movement
function ballMove() {
	// Vertical Speed
	ballY += speedY * ballDirection;
	// Horizontal Speed
	if (playerMoved) {
		ballX += speedX;
	}
	socket.emit("ballMove", {
		ballX,
		ballY,
		score,
	});
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
	// Bounce off Left Wall
	if (ballX < 0 && speedX < 0) {
		speedX = -speedX;
	}
	// Bounce off Right Wall
	if (ballX > width && speedX > 0) {
		speedX = -speedX;
	}
	// Bounce off player paddle (bottom)
	if (ballY > height - paddleDiff) {
		if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
			// Add Speed on Hit
			if (playerMoved) {
				speedY += 1;
				// Max Speed
				if (speedY > 5) {
					speedY = 5;
				}
			}
			ballDirection = -ballDirection;
			trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
			speedX = trajectoryX[0] * 0.3;
		} else {
			// Reset Ball, add to Computer Score
			score[1]++;
			ballReset();
		}
	}
	// Bounce off computer paddle (top)
	if (ballY < paddleDiff) {
		if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
			// Add Speed on Hit
			if (playerMoved) {
				speedY += 1;
				// Max Speed
				if (speedY > 5) {
					speedY = 5;
				}
			}
			ballDirection = -ballDirection;
			trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
			speedX = trajectoryX[1] * 0.3;
		} else {
			score[0]++;
			ballReset();
		}
	}
}

// Computer Movement
// function computerAI() {
//   if (playerMoved) {
//     if (paddleX[1] + paddleDiff < ballX) {
//       paddleX[1] += computerSpeed;
//     } else {
//       paddleX[1] -= computerSpeed;
//     }
//     if (paddleX[1] < 0) {
//       paddleX[1] = 0;
//     } else if (paddleX[1] > (width - paddleWidth)) {
//       paddleX[1] = width - paddleWidth;
//     }
//   }
// }

function showGameOverEl(winner) {
	// Hide canvas
	canvas.hidden = true;

	// Container
	gameOverEl.textContent = "";
	gameOverEl.classList.add("game-over-container");

	// Title
	const title = document.createElement("h1");
	title.textContent = `${winner} Wins!`;

	// Button
	const playAgainBtn = document.createElement("button");
	playAgainBtn.textContent = "Play Again";
	playAgainBtn.addEventListener("click", () => {
		socket.emit("playAgain", true);
		startGame()
	});
	
	// Append
	gameOverEl.append(title, playAgainBtn);
	body.appendChild(gameOverEl);
}

function gameOver() {
	if (score[0] === winningScore || score[1] === winningScore) {
		isGameOver = true;
		// Set winner
		const winner = score[0] === winningScore ? "Player 1" : "Player 2";
		isOpponentReady = false;

		showGameOverEl(winner);
	}
}

// Called Every Frame
function animate() {
	if (isReferee) {
		ballMove();
		ballBoundaries();
	}
	renderCanvas();
	gameOver();

	if (!isGameOver) {
		window.requestAnimationFrame(animate);
	}
}

// Start Game, Reset Everything
function loadGame() {
	createCanvas();
	renderIntro();
	socket.emit("ready");
}

function resetScore() {
	score = [0, 0];
}

function startGame() {
	if (isGameOver && !isNewGame) {
		gameOverEl.remove();
		resetScore();
		canvas.hidden = false;
	}

	if (!isOpponentReady) { 
		renderIntro();
		return;
	}

	isGameOver = false;
	isNewGame = false;
	paddleIndex = isReferee ? 0 : 1;
	window.requestAnimationFrame(animate);
	canvas.addEventListener("mousemove", paddleControl);

	canvas.addEventListener("touchmove", paddleControl)

	function paddleControl(e) {
		e.preventDefault();
		playerMoved = true;
		paddleX[paddleIndex] = e.offsetX;
		if (paddleX[paddleIndex] < 0) {
			paddleX[paddleIndex] = 0;
		}
		if (paddleX[paddleIndex] > width - paddleWidth) {
			paddleX[paddleIndex] = width - paddleWidth;
		}
		socket.emit("paddleMove", {
			xPosition: paddleX[paddleIndex],
		});
		// Hide Cursor
		canvas.style.cursor = "none";
	}
}

// On Load
loadGame();

socket.on("connect", () => {
	console.log("Connected as ...", socket.id);
});

socket.on("startGame", (refereeId) => {
	console.log("Referee is ", refereeId);
	isOpponentReady = true;
	isReferee = socket.id === refereeId;
	startGame();
});

// socket.on("restartGame", () => {
// 	isOpponentReady = true;
// })

socket.on("paddleMove", (paddleData) => {
	const opponentPaddleIndex = 1 - paddleIndex;
	paddleX[opponentPaddleIndex] = paddleData.xPosition;
});

socket.on("ballMove", (ballData) => {
	({ ballX, ballY, score } = ballData);
});
