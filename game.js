// Game variables
let timeLeft;
let score = 0;
let moves = 0;
let currentLevel = 1;
let gameInterval;
let isSoundOn = true;
let unlockedLevels = [1];
let isGameStarted = false;

// DOM elements
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const levelDisplay = document.getElementById('current-level');
const messageDisplay = document.getElementById('message');
const puzzleContainer = document.getElementById('puzzle-container');
const startBtn = document.getElementById('startBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const soundBtn = document.getElementById('soundBtn');

// Audio elements
const moveSound = document.getElementById('moveSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const backgroundMusic = document.getElementById('backgroundMusic');

// Level time settings
const levelTimes = {
  1: 60, 2: 55, 3: 50, 4: 45, 5: 40,
  6: 35, 7: 30, 8: 25, 9: 20, 10: 15
};

// Image URLs
const imageUrls = {
  1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg',
  10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_in_December_2023.jpg/800px-Imran_Khan_in_December_2023.jpg'
};

// Initialize the game
function init() {
  // Load unlocked levels from localStorage
  const savedLevels = localStorage.getItem('unlockedLevels');
  if (savedLevels) {
    unlockedLevels = JSON.parse(savedLevels);
  }

  // Update level buttons
  updateLevelButtons();

  // Set up event listeners
  startBtn.addEventListener('click', () => {
    isGameStarted = true;
    startBtn.disabled = true;
    startTimer();
  });
  
  tryAgainBtn.addEventListener('click', resetGame);
  soundBtn.addEventListener('click', toggleSound);

  // Initialize sound
  backgroundMusic.volume = 0.3;
  moveSound.volume = 0.5;
  winSound.volume = 0.5;
  loseSound.volume = 0.5;

  // Preload images
  preloadImages();
}

// Preload images
function preloadImages() {
  Object.values(imageUrls).forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// Show specific page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

// Start game with specific level
function startGame(level) {
  if (level) {
    currentLevel = level;
    levelDisplay.textContent = currentLevel;
  }
  
  showPage('game-page');
  resetGame();
}

// Reset game state
function resetGame() {
  clearInterval(gameInterval);
  timeLeft = levelTimes[currentLevel];
  score = 0;
  moves = 0;
  isGameStarted = false;
  
  updateUI();
  createTiles();
  
  startBtn.disabled = false;
  tryAgainBtn.disabled = true;
  messageDisplay.textContent = '';
  messageDisplay.classList.remove('win-animation');
}

// Create puzzle tiles
function createTiles() {
  puzzleContainer.innerHTML = '';
  const imageUrl = imageUrls[currentLevel];
  
  const tiles = [];
  for (let i = 0; i < 8; i++) {
    tiles.push(i + 1);
  }
  tiles.push(0); // Empty tile
  
  // Shuffle tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  
  // Create tile elements
  tiles.forEach((tile, index) => {
    const tileElement = document.createElement('div');
    tileElement.className = 'tile';
    tileElement.dataset.value = tile;
    
    if (tile !== 0) {
      const row = Math.floor(index / 3);
      const col = index % 3;
      tileElement.style.backgroundImage = `url(${imageUrl})`;
      tileElement.style.backgroundPosition = `-${col * 100}% -${row * 100}%`;
    }
    
    // Add touch event listeners
    tileElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    tileElement.addEventListener('click', () => handleTileClick(tileElement));
    puzzleContainer.appendChild(tileElement);
  });
}

// Touch handling
let touchStartX, touchStartY;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  e.preventDefault();
}

// Handle tile click
function handleTileClick(tile) {
  if (isGameStarted) {
    const emptyTile = document.querySelector('.tile[data-value="0"]');
    const tileIndex = Array.from(puzzleContainer.children).indexOf(tile);
    const emptyIndex = Array.from(puzzleContainer.children).indexOf(emptyTile);
    
    const row = Math.floor(tileIndex / 3);
    const col = tileIndex % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;
    
    if ((Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)) {
      // Swap tiles
      const temp = tile.style.backgroundPosition;
      tile.style.backgroundPosition = emptyTile.style.backgroundPosition;
      emptyTile.style.backgroundPosition = temp;
      
      // Update data values
      const tempValue = tile.dataset.value;
      tile.dataset.value = emptyTile.dataset.value;
      emptyTile.dataset.value = tempValue;
      
      // Update game state
      moves++;
      movesDisplay.textContent = moves;
      
      // Play sound
      if (isSoundOn) {
        moveSound.currentTime = 0;
        moveSound.play();
      }
      
      // Check for win
      checkWin();
    }
  }
}

// Check if puzzle is solved
function checkWin() {
  const tiles = Array.from(puzzleContainer.children);
  const isSolved = tiles.every((tile, index) => {
    return tile.dataset.value === (index + 1).toString() || 
           (index === 8 && tile.dataset.value === '0');
  });
  
  if (isSolved) {
    clearInterval(gameInterval);
    score = Math.max(0, timeLeft * 10 + (100 - moves));
    scoreDisplay.textContent = score;
    
    // Unlock next level
    if (!unlockedLevels.includes(currentLevel + 1) && currentLevel < 10) {
      unlockedLevels.push(currentLevel + 1);
      localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
      updateLevelButtons();
    }
    
    // Show win message
    messageDisplay.textContent = 'Congratulations! You won!';
    messageDisplay.classList.add('win-animation');
    
    // Play win sound and show confetti
    if (isSoundOn) {
      winSound.play();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    startBtn.disabled = true;
    tryAgainBtn.disabled = false;
  }
}

// Update UI elements
function updateUI() {
  timeDisplay.textContent = timeLeft;
  scoreDisplay.textContent = score;
  movesDisplay.textContent = moves;
  levelDisplay.textContent = currentLevel;
}

// Update level buttons
function updateLevelButtons() {
  const levelButtons = document.querySelectorAll('.level-btn');
  levelButtons.forEach((btn, index) => {
    const level = index + 1;
    if (unlockedLevels.includes(level)) {
      btn.classList.remove('locked');
      btn.classList.add('unlocked');
    } else {
      btn.classList.remove('unlocked');
      btn.classList.add('locked');
    }
  });
}

// Toggle sound
function toggleSound() {
  isSoundOn = !isSoundOn;
  soundBtn.textContent = isSoundOn ? '🔊 Sound On' : '🔇 Sound Off';
  
  if (isSoundOn) {
    backgroundMusic.play();
  } else {
    backgroundMusic.pause();
  }
}

// Start timer
function startTimer() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      messageDisplay.textContent = 'Time\'s up! Game Over!';
      if (isSoundOn) {
        loseSound.play();
      }
      startBtn.disabled = true;
      tryAgainBtn.disabled = false;
    }
  }, 1000);
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', init); 