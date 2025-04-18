document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const puzzleContainer = document.getElementById("puzzle-container");
  const timerDisplay = document.getElementById("time");
  const scoreDisplay = document.getElementById("score");
  const levelDisplay = document.getElementById("current-level");
  const message = document.getElementById("message");
  const startBtn = document.getElementById("startBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const changeLevelBtn = document.getElementById("changeLevelBtn");
  const levelSelector = document.querySelector(".level-selector");
  const gameArea = document.querySelector(".game-area");
  const previewContainer = document.getElementById("preview-container");
  const levelButtons = document.querySelectorAll(".level-btn");

  // Game variables
  let time = 60;
  let timerInterval;
  let positions = [];
  let score = 0;
  let currentLevel = 1;
  let emptyIndex = 8; // Position of empty tile
  let imageUrls = [
    "https://picsum.photos/id/10/300/300", // Nature
    "https://picsum.photos/id/11/300/300", // City
    "https://picsum.photos/id/12/300/300", // Animal
    "https://picsum.photos/id/13/300/300", // Space
    "https://picsum.photos/id/14/300/300" // Art
  ];
  let currentImageUrl = "";
  let imageLoaded = false;

  // Level time settings
  const levelTimes = {
    1: 90, // Easy
    2: 60, // Medium
    3: 45, // Hard
    4: 30, // Expert
    5: 20 // Crazy
  };

  // Initialize the game
  init();

  function init() {
    // Set up event listeners
    levelButtons.forEach((btn) => {
      btn.addEventListener("click", () =>
        selectLevel(parseInt(btn.dataset.level))
      );
    });

    startBtn.addEventListener("click", startGame);
    tryAgainBtn.addEventListener("click", startGame);
    changeLevelBtn.addEventListener("click", showLevelSelector);
  }

  function selectLevel(level) {
    currentLevel = level;
    levelDisplay.textContent = level;
    time = levelTimes[level];
    timerDisplay.textContent = time;

    // Set different image for each level
    currentImageUrl = imageUrls[level - 1];
    imageLoaded = false;
    previewContainer.style.backgroundImage = `url(${currentImageUrl})`;

    // Show game area and hide level selector
    levelSelector.classList.add("hidden");
    gameArea.classList.remove("hidden");

    // Update UI based on level
    updateLevelUI();
  }

  function updateLevelUI() {
    // Change colors based on level
    const root = document.documentElement;
    let color;

    switch (currentLevel) {
      case 1:
        color = "var(--easy-color)";
        break;
      case 2:
        color = "var(--medium-color)";
        break;
      case 3:
        color = "var(--hard-color)";
        break;
      case 4:
        color = "var(--expert-color)";
        break;
      case 5:
        color = "var(--crazy-color)";
        break;
    }

    document.querySelectorAll("button:not(.level-btn)").forEach((btn) => {
      btn.style.backgroundColor = color;
    });

    levelDisplay.style.color = color;
  }

  function showLevelSelector() {
    clearInterval(timerInterval);
    gameArea.classList.add("hidden");
    levelSelector.classList.remove("hidden");
    message.textContent = "";
  }

  function startGame() {
    clearInterval(timerInterval);
    time = levelTimes[currentLevel];
    timerDisplay.textContent = time;
    message.textContent = "";
    startBtn.disabled = true;
    tryAgainBtn.disabled = false;

    // Reset score if it's a new game
    if (!tryAgainBtn.disabled) {
      score = 0;
      scoreDisplay.textContent = score;
    }

    startTimer();
    createTiles();
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      time--;
      timerDisplay.textContent = time;

      // Flash timer when time is running out
      if (time <= 10) {
        timerDisplay.classList.add("animate__animated", "animate__heartBeat");
        setTimeout(() => {
          timerDisplay.classList.remove(
            "animate__animated",
            "animate__heartBeat"
          );
        }, 1000);
      }

      if (time <= 0) {
        clearInterval(timerInterval);
        message.textContent = "⏰ Time's up! Try again.";
        message.classList.add("animate__animated", "animate__shakeX");
        startBtn.disabled = false;
        tryAgainBtn.disabled = true;
      }
    }, 1000);
  }

  function createTiles() {
    puzzleContainer.innerHTML = "";
    positions = [...Array(9).keys()];

    // Show loading message
    if (!imageLoaded) {
      const loadingMsg = document.createElement("div");
      loadingMsg.textContent = "Loading image...";
      loadingMsg.style.color = "#fff";
      loadingMsg.style.gridColumn = "1 / -1";
      loadingMsg.style.gridRow = "1 / -1";
      loadingMsg.style.display = "flex";
      loadingMsg.style.alignItems = "center";
      loadingMsg.style.justifyContent = "center";
      puzzleContainer.appendChild(loadingMsg);

      // Preload image
      const img = new Image();
      img.src = currentImageUrl;
      img.onload = () => {
        imageLoaded = true;
        shuffleAndCreateTiles();
      };
      img.onerror = () => {
        // Fallback to a different image if remote fails
        currentImageUrl = "https://picsum.photos/300/300";
        imageLoaded = true;
        shuffleAndCreateTiles();
      };
    } else {
      shuffleAndCreateTiles();
    }
  }

  function shuffleAndCreateTiles() {
    puzzleContainer.innerHTML = "";

    // Shuffle based on difficulty level
    const shuffleCount = currentLevel * 10 + 20;
    for (let i = 0; i < shuffleCount; i++) {
      const emptyPos = positions.indexOf(emptyIndex);
      const validMoves = getValidMoves(emptyPos);
      const randomMove =
        validMoves[Math.floor(Math.random() * validMoves.length)];
      [positions[emptyPos], positions[randomMove]] = [
        positions[randomMove],
        positions[emptyPos]
      ];
    }

    // Create tiles
    positions.forEach((pos, index) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      if (pos !== emptyIndex) {
        tile.style.backgroundImage = `url(${currentImageUrl})`;
        tile.style.backgroundPosition = `-${(pos % 3) * 100}px -${
          Math.floor(pos / 3) * 100
        }px`;
        tile.setAttribute("data-index", index);
        tile.addEventListener("click", () => handleTileClick(index));

        // Add level-based animation
        if (currentLevel >= 4) {
          tile.style.animation = `tileMove ${
            0.5 + Math.random()
          }s infinite alternate`;
        } else if (currentLevel >= 2) {
          tile.style.transition = "all 0.5s ease";
        }
      } else {
        tile.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      }

      puzzleContainer.appendChild(tile);
    });

    // Update preview
    previewContainer.style.backgroundImage = `url(${currentImageUrl})`;
  }

  function getValidMoves(position) {
    const moves = [];
    const row = Math.floor(position / 3);
    const col = position % 3;

    // Up
    if (row > 0) moves.push(position - 3);
    // Down
    if (row < 2) moves.push(position + 3);
    // Left
    if (col > 0) moves.push(position - 1);
    // Right
    if (col < 2) moves.push(position + 1);

    return moves;
  }

  function handleTileClick(index) {
    const emptyPos = positions.indexOf(emptyIndex);
    const validMoves = getValidMoves(emptyPos);

    if (validMoves.includes(index)) {
      // Add move animation
      const tile = puzzleContainer.children[index];
      tile.classList.add("moving");
      setTimeout(() => tile.classList.remove("moving"), 500);

      // Update positions
      [positions[index], positions[emptyPos]] = [
        positions[emptyPos],
        positions[index]
      ];

      // Update score
      score += currentLevel * 5;
      scoreDisplay.textContent = score;

      // Recreate tiles with new positions
      createTiles();
      checkWin();
    } else {
      // Invalid move feedback
      const tile = puzzleContainer.children[index];
      tile.classList.add("animate__animated", "animate__headShake");
      setTimeout(() => {
        tile.classList.remove("animate__animated", "animate__headShake");
      }, 1000);
    }
  }

  function checkWin() {
    const isWin = positions.every((val, i) => val === i);

    if (isWin) {
      clearInterval(timerInterval);

      // Calculate bonus points based on time left
      const timeBonus = Math.floor(time * currentLevel * 0.5);
      score += timeBonus;
      scoreDisplay.textContent = score;

      // Show win message
      message.textContent = `🎉 You Win! Time Bonus: +${timeBonus} points`;
      message.classList.add(
        "animate__animated",
        "animate__bounceIn",
        "win-animation"
      );

      // Confetti effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ffff00",
          "#ff00ff",
          "#00ffff"
        ]
      });

      startBtn.disabled = false;
      tryAgainBtn.disabled = true;

      // Auto-advance to next level after delay (if not max level)
      if (currentLevel < 5) {
        setTimeout(() => {
          currentLevel++;
          levelDisplay.textContent = currentLevel;
          updateLevelUI();
          startGame();
        }, 3000);
      }
    }
  }
});
