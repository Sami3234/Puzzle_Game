const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const progressBar = document.getElementById('progress-bar');
const levelPopup = document.getElementById('level-popup');
const startNextLevelButton = document.getElementById('start-next-level');
const speedControl = document.getElementById('speed');
const startScreen = document.getElementById('start-screen');
const startGameButton = document.getElementById('start-game');

// Game variables
let snake = [{ x: 200, y: 200 }];
let direction = { x: 0, y: 0 };
let food = { x: 100, y: 100 };
let score = 0;
let level = 1;
let speed = 200;
let obstacles = [];
let foodBlinkCounter = 0;
const foodBlinkInterval = 10; // Adjust this value to control blinking speed

// Game settings
const box = 20;
const canvasSize = 400;
const maxLevel = 5;
const snakeColors = ['#ff6b6b', '#f0e130', '#6bffb3', '#6b6bff', '#ff6bff'];

// Start the game
startGameButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameLoop = setInterval(draw, speed);
});

// Draw the game
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw the snake
    snake.forEach((part, index) => {
        if (index === 0) { // Head of the snake
            ctx.fillStyle = '#ff6b6b'; // Vibrant color for the head
            ctx.beginPath();
            ctx.moveTo(part.x + box / 2, part.y); // Top point of the triangle
            ctx.lineTo(part.x, part.y + box); // Bottom left
            ctx.lineTo(part.x + box, part.y + box); // Bottom right
            ctx.closePath();
            ctx.fill();
        } else { // Body of the snake
            ctx.fillStyle = snakeColors[index % snakeColors.length];
            ctx.beginPath();
            ctx.arc(part.x + box / 2, part.y + box / 2, box / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw the food
    if (foodBlinkCounter % foodBlinkInterval < foodBlinkInterval / 2) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    foodBlinkCounter++;

    // Draw the obstacles
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, box, box);
    });

    // Move the snake
    const head = { x: snake[0].x + direction.x * box, y: snake[0].y + direction.y * box };
    snake.unshift(head);

    // Check for collision with food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score + ' | Level: ' + level;
        updateProgressBar();
        placeFood();
        if (score % 20 === 0 && level < maxLevel) {
            level++;
            speed = Math.max(50, speed - 20);
            snake = [{ x: 200, y: 200 }]; // Reset snake size
            placeObstacles();
            clearInterval(gameLoop);
            showLevelPopup();
        }
    } else {
        snake.pop();
    }

    // Check for collision with walls, itself, or obstacles
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || snake.slice(1).some(part => part.x === head.x && part.y === head.y) || obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        resetGame();
    }
}

// Update the progress bar
function updateProgressBar() {
    const progress = (score % 20) / 20 * 100;
    progressBar.style.width = progress + '%';
}

// Show level popup
function showLevelPopup() {
    levelPopup.classList.add('active');
}

// Start the next level
startNextLevelButton.addEventListener('click', () => {
    levelPopup.classList.remove('active');
    gameLoop = setInterval(draw, speed);
});

// Adjust speed based on slider
speedControl.addEventListener('input', (event) => {
    const minSpeed = 20; // Minimum speed
    const maxSpeed = 200; // Maximum speed
    const sliderValue = parseInt(event.target.value);
    speed = maxSpeed - ((sliderValue / 100) * (maxSpeed - minSpeed));
    clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
});

// Place food at a random position
function placeFood() {
    food.x = Math.floor(Math.random() * (canvasSize / box)) * box;
    food.y = Math.floor(Math.random() * (canvasSize / box)) * box;
}

// Place obstacles at random positions
function placeObstacles() {
    obstacles = [];
    for (let i = 0; i < level + 2; i++) { // Increase obstacles with each level
        const obstacle = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
        // Ensure obstacles do not overlap with the snake or food
        if (!snake.some(part => part.x === obstacle.x && part.y === obstacle.y) && (obstacle.x !== food.x || obstacle.y !== food.y)) {
            obstacles.push(obstacle);
        }
    }
}

// Reset the game
function resetGame() {
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    score = 0;
    level = 1;
    speed = 200;
    scoreDisplay.textContent = 'Score: ' + score + ' | Level: ' + level;
    progressBar.style.width = '0%';
    placeFood();
    placeObstacles();
    clearInterval(gameLoop);
    gameLoop = setInterval(draw, speed);
}

// Change direction based on key press
window.addEventListener('keydown', event => {
    changeDirection(event.key);
});

// Change direction based on button press
function changeDirection(key) {
    if (key === 'ArrowUp' && direction.y === 0) direction = { x: 0, y: -1 };
    if (key === 'ArrowDown' && direction.y === 0) direction = { x: 0, y: 1 };
    if (key === 'ArrowLeft' && direction.x === 0) direction = { x: -1, y: 0 };
    if (key === 'ArrowRight' && direction.x === 0) direction = { x: 1, y: 0 };
}

// Add event listeners for mobile controls
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

upButton.addEventListener('click', () => changeDirection('ArrowUp'));
downButton.addEventListener('click', () => changeDirection('ArrowDown'));
leftButton.addEventListener('click', () => changeDirection('ArrowLeft'));
rightButton.addEventListener('click', () => changeDirection('ArrowRight'));

// Start the game loop
let gameLoop = setInterval(draw, speed);

// Initialize the game
placeFood();
placeObstacles(); 