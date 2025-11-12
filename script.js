const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let specialFruit = { x: 5, y: 5 };
let score = 0;
let level = 1;
let speed = 150;
let soundOn = true;
let currentTheme = "night";
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScore").textContent = `Rekor: ${highScore}`;

const eatSound = new Audio("eat.mp3");
const gameOverSound = new Audio("gameover.mp3");

document.getElementById("toggleSound").addEventListener("click", () => {
  soundOn = !soundOn;
  document.getElementById("toggleSound").textContent = soundOn ? "🔊 Ses: Açık" : "🔇 Ses: Kapalı";
});

document.getElementById("toggleTheme").addEventListener("click", () => {
  currentTheme = currentTheme === "night" ? "day" : "night";
  document.body.className = currentTheme;
  document.getElementById("toggleTheme").textContent = currentTheme === "night" ? "🎨 Tema: Gece" : "🎨 Tema: Gündüz";
});

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Normal meyve
  ctx.fillStyle = "red";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Özel meyve
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(
    specialFruit.x * gridSize + gridSize / 2,
    specialFruit.y * gridSize + gridSize / 2,
    gridSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

 // Yılan gövdesi (yuvarlak)
ctx.fillStyle = "lime";
for (let i = 1; i < snake.length - 1; i++) {
  ctx.beginPath();
  ctx.arc(
    snake[i].x * gridSize + gridSize / 2,
    snake[i].y * gridSize + gridSize / 2,
    gridSize / 2.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}


  // Yılan kafası
  ctx.fillStyle = "green";
  ctx.beginPath();
  ctx.arc(
    snake[0].x * gridSize + gridSize / 2,
    snake[0].y * gridSize + gridSize / 2,
    gridSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Yılan kuyruğu
  ctx.fillStyle = "lightgreen";
  ctx.beginPath();
  ctx.arc(
    snake[snake.length - 1].x * gridSize + gridSize / 2,
    snake[snake.length - 1].y * gridSize + gridSize / 2,
    gridSize / 2.5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  snake.unshift(head);

  // Meyve yeme
  if (head.x === food.x && head.y === food.y) {
    if (soundOn) eatSound.play();
    score++;
    updateScore();
    food = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)),
      y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
  } else if (head.x === specialFruit.x && head.y === specialFruit.y) {
    if (soundOn) eatSound.play();
    if (snake.length > 1) snake.pop();
    specialFruit = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)),
      y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
  } else {
    snake.pop();
  }

  // Duvara çarpma
  if (
    head.x < 0 || head.x >= canvas.width / gridSize ||
    head.y < 0 || head.y >= canvas.height / gridSize
  ) {
    if (soundOn) gameOverSound.play();
    resetGame();
  }

  // Kendine çarpma
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      if (soundOn) gameOverSound.play();
      resetGame();
    }
  }
}

function updateScore() {
  document.getElementById("score").textContent = `Puan: ${score}`;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("highScore").textContent = `Rekor: ${highScore}`;
  }
  if (score % 5 === 0) {
    level++;
    document.getElementById("level").textContent = `Seviye: ${level}`;
    speed = Math.max(50, speed - 10);
    clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
  }
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  level = 1;
  speed = 150;
  document.getElementById("score").textContent = `Puan: ${score}`;
  document.getElementById("level").textContent = `Seviye: ${level}`;
  clearInterval(gameLoop);
  gameLoop = setInterval(draw, speed);
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && direction.x === 0) direction = { x: 1, y: 0 };
});

// Mobil dokunmatik kontroller
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchend", handleTouchEnd);
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction.x === 0) direction = { x: 1, y: 0 };
    else if (dx < 0 && direction.x === 0) direction = { x: -1, y: 0 };
  } else {
    if (dy > 0 && direction.y === 0) direction = { x: 0, y: 1 };
    else if (dy < 0 && direction.y === 0) direction = { x: 0, y: -1 };
  }
}

let gameLoop = setInterval(draw, speed);
