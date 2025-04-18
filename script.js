document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const puzzleContainer = document.getElementById("puzzle-container");
  const timerDisplay = document.getElementById("time");
  const scoreDisplay = document.getElementById("score");
  const levelDisplay = document.getElementById("current-level");
  const movesDisplay = document.getElementById("moves");
  const message = document.getElementById("message");
  const startBtn = document.getElementById("startBtn");
  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const changeLevelBtn = document.getElementById("changeLevelBtn");
  const soundBtn = document.getElementById("soundBtn");
  const startNowBtn = document.getElementById("start-now-btn");
  const welcomePopup = document.getElementById("welcome-popup");
  const levelSelector = document.querySelector(".level-selector");
  const gameArea = document.querySelector(".game-area");
  const previewContainer = document.getElementById("preview-container");
  const levelButtons = document.querySelectorAll(".level-btn");

  // Audio elements
  const moveSound = document.getElementById("moveSound");
  const winSound = document.getElementById("winSound");
  const loseSound = document.getElementById("loseSound");
  const backgroundMusic = document.getElementById("backgroundMusic");

  // Game variables
  let time = 60;
  let timerInterval;
  let positions = [];
  let score = 0;
  let moves = 0;
  let currentLevel = 1;
  let emptyIndex = 8;
  let soundEnabled = true;
  let unlockedLevels = new Set([1]);
  let imageUrls = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg"
  ];
  let currentImageUrl = "";
  let imageLoaded = false;
  let preloadedImages = new Map();

  // Preload all images
  function preloadImages() {
    imageUrls.forEach((url, index) => {
      const img = new Image();
      img.onload = () => {
        preloadedImages.set(index, img);
        if (index === 0) {
          currentImageUrl = url;
          imageLoaded = true;
          previewContainer.style.backgroundImage = `url(${url})`;
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        // Fallback to a different image
        const fallbackUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg";
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          preloadedImages.set(index, fallbackImg);
          if (index === 0) {
            currentImageUrl = fallbackUrl;
            imageLoaded = true;
            previewContainer.style.backgroundImage = `url(${fallbackUrl})`;
          }
        };
        fallbackImg.src = fallbackUrl;
      };
      img.src = url;
    });
  }

  // Level time settings
  const levelTimes = {
    1: 90, // Level 1
    2: 80, // Level 2
    3: 70, // Level 3
    4: 60, // Level 4
    5: 50, // Level 5
    6: 40, // Level 6
    7: 35, // Level 7
    8: 30, // Level 8
    9: 25, // Level 9
    10: 20 // Level 10
  };

  // Initialize the game
  init();

  function init() {
    // Preload images
    preloadImages();

    // Set up event listeners
    startNowBtn.addEventListener("click", () => {
      welcomePopup.style.display = "none";
      if (soundEnabled) backgroundMusic.play();
    });

    levelButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const level = parseInt(btn.dataset.level);
        if (unlockedLevels.has(level)) {
          selectLevel(level);
        } else {
          if (soundEnabled) loseSound.play();
          message.textContent = "Complete previous levels to unlock this one!";
          message.classList.add("animate__animated", "animate__shakeX");
          setTimeout(() => {
            message.textContent = "";
            message.classList.remove("animate__animated", "animate__shakeX");
          }, 2000);
        }
      });
    });

    startBtn.addEventListener("click", startGame);
    tryAgainBtn.addEventListener("click", startGame);
    changeLevelBtn.addEventListener("click", showLevelSelector);
    soundBtn.addEventListener("click", toggleSound);

    // Update level buttons based on unlocked levels
    updateLevelButtons();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊 Sound On" : "🔇 Sound Off";
    if (soundEnabled) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  }

  function updateLevelButtons() {
    levelButtons.forEach((btn) => {
      const level = parseInt(btn.dataset.level);
      if (unlockedLevels.has(level)) {
        btn.classList.remove("locked");
        btn.classList.add("unlocked");
      } else {
        btn.classList.remove("unlocked");
        btn.classList.add("locked");
      }
    });
  }

  function selectLevel(level) {
    currentLevel = level;
    levelDisplay.textContent = level;
    time = levelTimes[level];
    timerDisplay.textContent = time;

    // Set different image for each level
    currentImageUrl = imageUrls[level - 1];
    imageLoaded = preloadedImages.has(level - 1);
    if (imageLoaded) {
      previewContainer.style.backgroundImage = `url(${currentImageUrl})`;
      previewContainer.classList.add("show");
    }

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
        color = "var(--primary-color)";
        break;
      case 2:
        color = "var(--secondary-color)";
        break;
      case 3:
        color = "var(--tertiary-color)";
        break;
      default:
        color = `hsl(${currentLevel * 30}, 100%, 50%)`;
    }

    document.querySelectorAll("button:not(.level-btn)").forEach((btn) => {
      btn.style.background = `linear-gradient(45deg, ${color}, var(--secondary-color))`;
    });

    levelDisplay.style.color = color;
  }

  function showLevelSelector() {
    clearInterval(timerInterval);
    gameArea.classList.add("hidden");
    levelSelector.classList.remove("hidden");
    message.textContent = "";
    previewContainer.classList.remove("show");
  }

  function startGame() {
    clearInterval(timerInterval);
    time = levelTimes[currentLevel];
    timerDisplay.textContent = time;
    message.textContent = "";
    startBtn.disabled = true;
    tryAgainBtn.disabled = false;
    moves = 0;
    movesDisplay.textContent = moves;
    previewContainer.classList.remove("show");

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
          timerDisplay.classList.remove("animate__animated", "animate__heartBeat");
        }, 1000);
      }

      if (time <= 0) {
        clearInterval(timerInterval);
        if (soundEnabled) loseSound.play();
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

      // Try to load the image again
      const img = new Image();
      img.onload = () => {
        imageLoaded = true;
        preloadedImages.set(currentLevel - 1, img);
        shuffleAndCreateTiles();
      };
      img.onerror = () => {
        // Fallback to a different image
        const fallbackUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg";
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          imageLoaded = true;
          preloadedImages.set(currentLevel - 1, fallbackImg);
          currentImageUrl = fallbackUrl;
          shuffleAndCreateTiles();
        };
        fallbackImg.src = fallbackUrl;
      };
      img.src = currentImageUrl;
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
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [positions[emptyPos], positions[randomMove]] = [positions[randomMove], positions[emptyPos]];
    }

    // Create tiles
    positions.forEach((pos, index) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      if (pos !== emptyIndex) {
        tile.style.backgroundImage = `url(${currentImageUrl})`;
        tile.style.backgroundPosition = `-${(pos % 3) * 100}px -${Math.floor(pos / 3) * 100}px`;
        tile.setAttribute("data-index", index);
        tile.addEventListener("click", () => handleTileClick(index));

        // Add level-based animation
        if (currentLevel >= 4) {
          tile.style.animation = `tileMove ${0.5 + Math.random()}s infinite alternate`;
        } else if (currentLevel >= 2) {
          tile.style.transition = "all 0.5s ease";
        }
      } else {
        tile.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
      }

      puzzleContainer.appendChild(tile);
    });
  }

  function handleTileClick(index) {
    const emptyPos = positions.indexOf(emptyIndex);
    const clickedPos = positions.indexOf(index);
    const validMoves = getValidMoves(emptyPos);

    if (validMoves.includes(clickedPos)) {
      if (soundEnabled) moveSound.play();
      moves++;
      movesDisplay.textContent = moves;

      // Swap positions
      [positions[emptyPos], positions[clickedPos]] = [positions[clickedPos], positions[emptyPos]];

      // Update tiles
      const tiles = document.querySelectorAll(".tile");
      tiles.forEach((tile, i) => {
        const pos = positions[i];
        if (pos !== emptyIndex) {
          tile.style.backgroundPosition = `-${(pos % 3) * 100}px -${Math.floor(pos / 3) * 100}px`;
        }
      });

      // Check for win
      if (checkWin()) {
        clearInterval(timerInterval);
        if (soundEnabled) winSound.play();
        message.textContent = "🎉 Congratulations! You won!";
        message.classList.add("animate__animated", "animate__bounce");
        
        // Update score
        score += (time * currentLevel);
        scoreDisplay.textContent = score;

        // Unlock next level
        if (currentLevel < 10) {
          unlockedLevels.add(currentLevel + 1);
          updateLevelButtons();
        }

        // Show confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        startBtn.disabled = false;
        tryAgainBtn.disabled = true;
      }
    }
  }

  function checkWin() {
    return positions.every((pos, index) => pos === index);
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
});
