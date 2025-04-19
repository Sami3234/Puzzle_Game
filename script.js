// Game Variables
let currentLevel = 1;
let moves = 0;
let time = 0;
let timer = null;
let isSoundOn = true;
let isMusicOn = true;
let unlockedLevels = [1];
let completedLevels = [];

// DOM Elements
const welcomeModal = document.getElementById('welcome-modal');
const levelSelectPage = document.getElementById('level-select-page');
const previewPage = document.getElementById('preview-page');
const gamePage = document.getElementById('game-page');
const menuModal = document.getElementById('menu-modal');
const instructionsModal = document.getElementById('instructions-modal');
const winModal = document.getElementById('win-modal');

const levelsGrid = document.getElementById('levels-grid');
const previewImage = document.getElementById('preview-image');
const puzzleContainer = document.getElementById('puzzle-container');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const levelDisplay = document.getElementById('level');
const messageDisplay = document.getElementById('message');

const moveSound = document.getElementById('move-sound');
const winSound = document.getElementById('win-sound');
const backgroundMusic = document.getElementById('background-music');

// Image URLs for each level
const levelImages = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Imran_Khan_%28cropped%29.jpg/800px-Imran_Khan_%28cropped%29.jpg'
];

// Initialize the game
function init() {
    loadProgress();
    createLevelButtons();
    showWelcomeModal();
    setupEventListeners();
}

// Load game progress from localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem('puzzleProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        unlockedLevels = progress.unlockedLevels || [1];
        completedLevels = progress.completedLevels || [];
    }
}

// Save game progress to localStorage
function saveProgress() {
    const progress = {
        unlockedLevels,
        completedLevels
    };
    localStorage.setItem('puzzleProgress', JSON.stringify(progress));
}

// Create level selection buttons
function createLevelButtons() {
    levelsGrid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const button = document.createElement('button');
        button.className = 'level-btn';
        button.textContent = i;
        
        if (unlockedLevels.includes(i)) {
            button.classList.add('unlocked');
            if (completedLevels.includes(i)) {
                button.classList.add('completed');
            }
        } else {
            button.classList.add('locked');
        }
        
        button.addEventListener('click', () => selectLevel(i));
        levelsGrid.appendChild(button);
    }
}

// Show welcome modal
function showWelcomeModal() {
    welcomeModal.classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Welcome modal
    document.getElementById('start-game').addEventListener('click', () => {
        welcomeModal.classList.remove('active');
        showPage(levelSelectPage);
    });

    // Menu button
    document.getElementById('menu-btn').addEventListener('click', () => {
        menuModal.classList.add('active');
    });

    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        document.getElementById('sound-toggle').className = isSoundOn ? 'sound-on' : 'sound-off';
    });

    // Music toggle
    document.getElementById('music-toggle').addEventListener('click', () => {
        isMusicOn = !isMusicOn;
        if (isMusicOn) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });

    // Instructions button
    document.getElementById('instructions-btn').addEventListener('click', () => {
        menuModal.classList.remove('active');
        instructionsModal.classList.add('active');
    });

    // Reset progress button
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all progress?')) {
            unlockedLevels = [1];
            completedLevels = [];
            saveProgress();
            createLevelButtons();
            menuModal.classList.remove('active');
        }
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
}

// Show a specific page
function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    page.classList.add('active');
}

// Select a level
function selectLevel(level) {
    if (!unlockedLevels.includes(level)) return;
    
    currentLevel = level;
    showPage(previewPage);
    previewImage.style.backgroundImage = `url(${levelImages[level - 1]})`;
}

// Start the game
function startGame() {
    showPage(gamePage);
    moves = 0;
    time = 0;
    updateDisplay();
    createPuzzle();
    startTimer();
}

// Create the puzzle
function createPuzzle() {
    puzzleContainer.innerHTML = '';
    const gridSize = 3;
    const tileSize = 100 / gridSize;
    
    // Create tiles
    for (let i = 0; i < gridSize * gridSize; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.width = `${tileSize}%`;
        tile.style.height = `${tileSize}%`;
        
        // Calculate background position
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        tile.style.backgroundImage = `url(${levelImages[currentLevel - 1]})`;
        tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
        tile.style.backgroundPosition = `${col * tileSize}% ${row * tileSize}%`;
        
        tile.addEventListener('click', () => moveTile(i));
        puzzleContainer.appendChild(tile);
    }
    
    // Shuffle tiles
    shuffleTiles();
}

// Shuffle the tiles
function shuffleTiles() {
    const tiles = Array.from(puzzleContainer.children);
    const emptyTile = tiles.pop();
    
    // Perform random moves to shuffle
    for (let i = 0; i < 100; i++) {
        const validMoves = getValidMoves(tiles.indexOf(emptyTile));
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        swapTiles(tiles.indexOf(emptyTile), randomMove);
    }
}

// Get valid moves for a tile
function getValidMoves(index) {
    const gridSize = 3;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const moves = [];
    
    if (row > 0) moves.push(index - gridSize);
    if (row < gridSize - 1) moves.push(index + gridSize);
    if (col > 0) moves.push(index - 1);
    if (col < gridSize - 1) moves.push(index + 1);
    
    return moves;
}

// Swap two tiles
function swapTiles(index1, index2) {
    const tiles = Array.from(puzzleContainer.children);
    const temp = tiles[index1].style.backgroundPosition;
    tiles[index1].style.backgroundPosition = tiles[index2].style.backgroundPosition;
    tiles[index2].style.backgroundPosition = temp;
}

// Move a tile
function moveTile(index) {
    const tiles = Array.from(puzzleContainer.children);
    const emptyTile = tiles.find(tile => !tile.style.backgroundPosition);
    
    if (!emptyTile) return;
    
    const emptyIndex = tiles.indexOf(emptyTile);
    const validMoves = getValidMoves(emptyIndex);
    
    if (validMoves.includes(index)) {
        swapTiles(index, emptyIndex);
        moves++;
        updateDisplay();
        playSound(moveSound);
        
        if (checkWin()) {
            winGame();
        }
    }
}

// Check if the puzzle is solved
function checkWin() {
    const tiles = Array.from(puzzleContainer.children);
    const gridSize = 3;
    const tileSize = 100 / gridSize;
    
    for (let i = 0; i < tiles.length; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const expectedPosition = `${col * tileSize}% ${row * tileSize}%`;
        
        if (tiles[i].style.backgroundPosition !== expectedPosition) {
            return false;
        }
    }
    
    return true;
}

// Win the game
function winGame() {
    clearInterval(timer);
    playSound(winSound);
    
    if (!completedLevels.includes(currentLevel)) {
        completedLevels.push(currentLevel);
        if (!unlockedLevels.includes(currentLevel + 1) && currentLevel < 10) {
            unlockedLevels.push(currentLevel + 1);
        }
        saveProgress();
    }
    
    winModal.classList.add('active');
    document.getElementById('win-level').textContent = currentLevel;
    document.getElementById('win-moves').textContent = moves;
    document.getElementById('win-time').textContent = formatTime(time);
}

// Start the timer
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        time++;
        updateDisplay();
    }, 1000);
}

// Update the display
function updateDisplay() {
    timerDisplay.textContent = formatTime(time);
    movesDisplay.textContent = moves;
    levelDisplay.textContent = currentLevel;
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Play a sound
function playSound(sound) {
    if (isSoundOn) {
        sound.currentTime = 0;
        sound.play();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init); 