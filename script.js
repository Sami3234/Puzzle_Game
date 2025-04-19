// Game Variables
let currentLevel = 1;
let moves = 0;
let time = 0;
let timer = null;
let isSoundOn = true;
let isMusicOn = true;
let unlockedLevels = [1];
let completedLevels = [];
let maxTime = 60; // Default 1 minute for level 1

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

// Image URLs for each level - different images for each level
const levelImages = [
    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=500',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=500',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=500',
    'https://images.unsplash.com/photo-1682685797439-a05dd915cee5?q=80&w=500',
    'https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=500',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500',
    'https://images.unsplash.com/photo-1508919801845-fc2ae1bc2a28?q=80&w=500',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=500',
    'https://images.unsplash.com/photo-1604077198996-4eb67c32cf34?q=80&w=500',
    'https://images.unsplash.com/photo-1560759226-14da22a643ef?q=80&w=500'
];

// Fallback image in case the main images fail to load
const fallbackImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500';

// Level time settings (in seconds): 60s for level 1, 120s for level 2, etc.
const levelTimes = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];

// Grid sizes for different levels
const levelGridSizes = [3, 3, 4, 4, 4, 5, 5, 5, 6, 6];

// Initialize the game
function init() {
    loadProgress();
    createLevelButtons();
    showWelcomeModal();
    setupEventListeners();
    preloadImages();
}

// Preload all images to avoid loading issues
function preloadImages() {
    const imagePromises = levelImages.map((url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        });
    });

    Promise.allSettled(imagePromises).then(() => {
        console.log('Images preloaded');
    });
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
        
        // Add emoji indicators for locked and completed levels
        if (unlockedLevels.includes(i)) {
            button.classList.add('unlocked');
            button.textContent = i;
            if (completedLevels.includes(i)) {
                button.classList.add('completed');
                button.textContent = '✅ ' + i;
            }
        } else {
            button.classList.add('locked');
            button.textContent = '🔒 ' + i;
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
        
        // Start background music if enabled
        if (isMusicOn) {
            backgroundMusic.play().catch(error => {
                console.log('Audio playback error:', error);
            });
        }
    });

    // Menu buttons
    document.getElementById('menu-btn').addEventListener('click', () => {
        menuModal.classList.add('active');
    });
    
    document.getElementById('game-menu-btn')?.addEventListener('click', () => {
        menuModal.classList.add('active');
    });

    // Back buttons
    document.getElementById('back-to-levels')?.addEventListener('click', () => {
        showPage(levelSelectPage);
    });
    
    document.getElementById('back-to-preview')?.addEventListener('click', () => {
        clearInterval(timer);
        showPage(previewPage);
    });

    // Start puzzle button
    document.getElementById('start-puzzle')?.addEventListener('click', () => {
        startGame();
    });

    // Win modal buttons
    document.getElementById('next-level')?.addEventListener('click', () => {
        winModal.classList.remove('active');
        if (currentLevel < 10) {
            selectLevel(currentLevel + 1);
        } else {
            showPage(levelSelectPage);
        }
    });
    
    document.getElementById('back-to-levels-win')?.addEventListener('click', () => {
        winModal.classList.remove('active');
        showPage(levelSelectPage);
    });

    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        document.getElementById('sound-toggle').textContent = isSoundOn ? 'Sound: ON' : 'Sound: OFF';
        document.getElementById('sound-toggle').className = isSoundOn ? 'sound-on' : 'sound-off';
    });

    // Music toggle
    document.getElementById('music-toggle').addEventListener('click', () => {
        isMusicOn = !isMusicOn;
        document.getElementById('music-toggle').textContent = isMusicOn ? 'Music: ON' : 'Music: OFF';
        document.getElementById('music-toggle').className = isMusicOn ? 'music-on' : 'music-off';
        
        if (isMusicOn) {
            backgroundMusic.play().catch(error => {
                console.log('Audio playback error:', error);
            });
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
    maxTime = levelTimes[level - 1];
    showPage(previewPage);
    
    // Load level image with error handling
    previewImage.style.backgroundImage = `url(${levelImages[level - 1]})`;
    const testImg = new Image();
    testImg.onerror = () => {
        previewImage.style.backgroundImage = `url(${fallbackImage})`;
    };
    testImg.src = levelImages[level - 1];
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
    const gridSize = levelGridSizes[currentLevel - 1];
    
    // Update grid template columns based on grid size
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    const tileSize = 100 / gridSize;
    const totalTiles = gridSize * gridSize;
    
    // Create tiles (except the last one, which will be empty)
    for (let i = 0; i < totalTiles - 1; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.width = `${tileSize}%`;
        tile.style.height = `${tileSize}%`;
        
        // Calculate background position
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        // Set the background image with fallback
        const testImg = new Image();
        testImg.onload = () => {
            tile.style.backgroundImage = `url(${levelImages[currentLevel - 1]})`;
            tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
            tile.style.backgroundPosition = `${col * (100/(gridSize-1))}% ${row * (100/(gridSize-1))}%`;
        };
        testImg.onerror = () => {
            tile.style.backgroundImage = `url(${fallbackImage})`;
            tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
            tile.style.backgroundPosition = `${col * (100/(gridSize-1))}% ${row * (100/(gridSize-1))}%`;
        };
        testImg.src = levelImages[currentLevel - 1];
        
        // Add data attributes for position tracking
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        tile.addEventListener('click', () => moveTile(tile));
        puzzleContainer.appendChild(tile);
    }
    
    // Add empty tile
    const emptyTile = document.createElement('div');
    emptyTile.className = 'tile empty';
    emptyTile.style.width = `${tileSize}%`;
    emptyTile.style.height = `${tileSize}%`;
    emptyTile.dataset.row = gridSize - 1;
    emptyTile.dataset.col = gridSize - 1;
    puzzleContainer.appendChild(emptyTile);
    
    // Shuffle tiles
    shuffleTiles(gridSize);
}

// Shuffle the tiles
function shuffleTiles(gridSize) {
    const tiles = Array.from(puzzleContainer.children);
    const emptyTile = tiles[tiles.length - 1];
    
    // Perform random moves to shuffle
    for (let i = 0; i < 100; i++) {
        const adjacentTiles = getAdjacentTiles(emptyTile, gridSize);
        if (adjacentTiles.length > 0) {
            const randomTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)];
            swapTiles(randomTile, emptyTile);
        }
    }
}

// Get adjacent tiles to the empty tile
function getAdjacentTiles(emptyTile, gridSize) {
    const tiles = Array.from(puzzleContainer.children);
    const emptyRow = parseInt(emptyTile.dataset.row);
    const emptyCol = parseInt(emptyTile.dataset.col);
    
    return tiles.filter(tile => {
        if (tile === emptyTile) return false;
        
        const tileRow = parseInt(tile.dataset.row);
        const tileCol = parseInt(tile.dataset.col);
        
        // Check if the tile is adjacent to the empty tile
        return (
            (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
            (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow)
        );
    });
}

// Move a tile
function moveTile(tile) {
    const tiles = Array.from(puzzleContainer.children);
    const emptyTile = tiles.find(t => t.classList.contains('empty'));
    
    if (!emptyTile) return;
    
    const tileRow = parseInt(tile.dataset.row);
    const tileCol = parseInt(tile.dataset.col);
    const emptyRow = parseInt(emptyTile.dataset.row);
    const emptyCol = parseInt(emptyTile.dataset.col);
    
    // Check if the tile is adjacent to the empty tile
    if (
        (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
        (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow)
    ) {
        // Swap position
        swapTiles(tile, emptyTile);
        
        // Update moves counter
        moves++;
        updateDisplay();
        
        // Play move sound
        playSound(moveSound);
        
        // Check if puzzle is solved
        if (checkWin()) {
            winGame();
        }
    }
}

// Swap two tiles
function swapTiles(tile1, tile2) {
    // Swap data attributes
    [tile1.dataset.row, tile2.dataset.row] = [tile2.dataset.row, tile1.dataset.row];
    [tile1.dataset.col, tile2.dataset.col] = [tile2.dataset.col, tile1.dataset.col];
    
    // Swap position in the grid
    const temp = tile1.style.gridArea;
    tile1.style.gridArea = tile2.style.gridArea;
    tile2.style.gridArea = temp;
    
    // Swap background position
    const tempBg = tile1.style.backgroundPosition;
    tile1.style.backgroundPosition = tile2.style.backgroundPosition;
    tile2.style.backgroundPosition = tempBg;
}

// Check if the puzzle is solved
function checkWin() {
    const tiles = Array.from(puzzleContainer.children);
    const gridSize = levelGridSizes[currentLevel - 1];
    
    // Check each tile position
    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        const expectedRow = Math.floor(i / gridSize);
        const expectedCol = i % gridSize;
        
        // If any tile is not in the correct position, the puzzle is not solved
        if (row !== expectedRow || col !== expectedCol) {
            // Special case: the empty tile should be at the bottom right
            if (tile.classList.contains('empty') && 
                row === gridSize - 1 && 
                col === gridSize - 1) {
                continue;
            }
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
    time = 0;
    
    timer = setInterval(() => {
        time++;
        
        // Check if time limit is reached
        if (time >= maxTime) {
            clearInterval(timer);
            messageDisplay.textContent = "Time's up! Try again.";
            messageDisplay.style.color = "red";
        }
        
        updateDisplay();
    }, 1000);
}

// Update the display
function updateDisplay() {
    if (timerDisplay) timerDisplay.textContent = formatTime(time);
    if (movesDisplay) movesDisplay.textContent = `Moves: ${moves}`;
    if (levelDisplay) levelDisplay.textContent = `Level: ${currentLevel}`;
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Play a sound
function playSound(sound) {
    if (isSoundOn && sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log('Audio playback error:', error);
        });
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init); 