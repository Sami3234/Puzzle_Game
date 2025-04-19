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
let imagesLoaded = false;
let useColorMode = true; // Set to true to force color mode instead of images

// Add power-ups and special effects
let powerUpActive = false;

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
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

// Define gradients for each level
const levelColors = [
    { primary: '#3498db', secondary: '#8e44ad', text: 'Level 1 - Easy' },
    { primary: '#e74c3c', secondary: '#f39c12', text: 'Level 2 - Beginner' },
    { primary: '#2ecc71', secondary: '#27ae60', text: 'Level 3 - Medium' },
    { primary: '#f1c40f', secondary: '#e67e22', text: 'Level 4 - Regular' },
    { primary: '#9b59b6', secondary: '#8e44ad', text: 'Level 5 - Challenging' },
    { primary: '#1abc9c', secondary: '#16a085', text: 'Level 6 - Hard' },
    { primary: '#34495e', secondary: '#2c3e50', text: 'Level 7 - Expert' },
    { primary: '#d35400', secondary: '#c0392b', text: 'Level 8 - Master' },
    { primary: '#7f8c8d', secondary: '#2c3e50', text: 'Level 9 - Advanced' },
    { primary: '#2980b9', secondary: '#3498db', text: 'Level 10 - Ultimate' }
];

// Pattern colors for tiles
const tilePatterns = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#34495e', '#d35400', 
    '#7f8c8d', '#2980b9', '#c0392b', '#27ae60',
    '#8e44ad', '#f1c40f', '#16a085', '#2c3e50'
];

// Level time settings (in seconds): 60s for level 1, 120s for level 2, etc.
const levelTimes = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];

// Grid sizes for different levels
const levelGridSizes = [3, 3, 4, 4, 4, 5, 5, 5, 6, 6];

// Add more sound effects
const tileMoveSound = new Audio('https://example.com/tile-move.mp3');
const levelCompleteSound = new Audio('https://example.com/level-complete.mp3');

// Initialize the game
function init() {
    // Show loading overlay
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    loadProgress();
    createLevelButtons();
    
    // Hide loading overlay after a short delay
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                showWelcomeModal();
            }, 500);
        } else {
            showWelcomeModal();
        }
        setupEventListeners();
    }, 1500);
}

// Load game progress from localStorage
function loadProgress() {
    try {
        const savedProgress = localStorage.getItem('puzzleProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            unlockedLevels = progress.unlockedLevels || [1];
            completedLevels = progress.completedLevels || [];
        }
    } catch (error) {
        console.error('Error loading progress:', error);
        unlockedLevels = [1];
        completedLevels = [];
    }
}

// Save game progress to localStorage
function saveProgress() {
    try {
        const progress = {
            unlockedLevels,
            completedLevels
        };
        localStorage.setItem('puzzleProgress', JSON.stringify(progress));
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// Create level selection buttons
function createLevelButtons() {
    if (!levelsGrid) return;
    
    levelsGrid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const button = document.createElement('button');
        button.className = 'level-btn';
        
        // Use level colors for the buttons
        if (unlockedLevels.includes(i)) {
            button.classList.add('unlocked');
            button.textContent = i;
            
            // Add gradient background
            button.style.background = `linear-gradient(135deg, ${levelColors[i-1].primary}, ${levelColors[i-1].secondary})`;
            
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
    if (welcomeModal) {
        welcomeModal.classList.add('active');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Welcome modal
    document.getElementById('start-game')?.addEventListener('click', () => {
        welcomeModal.classList.remove('active');
        showPage(levelSelectPage);
        
        // Start background music if enabled
        if (isMusicOn && backgroundMusic) {
            backgroundMusic.play().catch(error => {
                console.log('Audio playback error:', error);
            });
        }
    });

    // Menu buttons
    document.getElementById('menu-btn')?.addEventListener('click', () => {
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
    document.getElementById('sound-toggle')?.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.textContent = isSoundOn ? 'Sound: ON' : 'Sound: OFF';
            soundToggle.className = isSoundOn ? 'sound-on' : 'sound-off';
        }
    });

    // Music toggle
    document.getElementById('music-toggle')?.addEventListener('click', () => {
        isMusicOn = !isMusicOn;
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.textContent = isMusicOn ? 'Music: ON' : 'Music: OFF';
            musicToggle.className = isMusicOn ? 'music-on' : 'music-off';
        }
        
        if (isMusicOn && backgroundMusic) {
            backgroundMusic.play().catch(error => {
                console.log('Audio playback error:', error);
            });
        } else if (backgroundMusic) {
            backgroundMusic.pause();
        }
    });

    // Instructions button
    document.getElementById('instructions-btn')?.addEventListener('click', () => {
        menuModal.classList.remove('active');
        instructionsModal.classList.add('active');
    });

    // Reset progress button
    document.getElementById('reset-btn')?.addEventListener('click', () => {
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
    if (!page) return;
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    page.classList.add('active');
}

// Select a level
function selectLevel(level) {
    if (!unlockedLevels.includes(level)) return;
    
    currentLevel = level;
    maxTime = levelTimes[level - 1];
    
    if (previewPage) {
        showPage(previewPage);
    }
    
    // Set preview to use level colors
    if (previewImage) {
        setColorPreview(previewImage, level);
    }
}

// Set color preview for a level
function setColorPreview(element, level) {
    if (!element) return;
    
    const colors = levelColors[level - 1];
    const gridSize = levelGridSizes[level - 1];
    
    element.style.backgroundImage = `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.color = 'white';
    element.style.fontSize = '1.5rem';
    element.style.fontWeight = 'bold';
    element.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)';
    element.innerHTML = `<div>${colors.text}<br>${gridSize}×${gridSize} Grid</div>`;
}

// Start the game
function startGame() {
    if (!gamePage) return;
    
    showPage(gamePage);
    moves = 0;
    time = 0;
    updateDisplay();
    createPuzzle();
    startTimer();
}

// Create the puzzle
function createPuzzle() {
    if (!puzzleContainer) return;
    
    puzzleContainer.innerHTML = '';
    const gridSize = levelGridSizes[currentLevel - 1];
    
    // Update grid template columns based on grid size
    puzzleContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    const tileSize = 100 / gridSize;
    const totalTiles = gridSize * gridSize;
    
    // Create tiles (except the last one, which will be empty)
    for (let i = 0; i < totalTiles - 1; i++) {
        createTile(i, gridSize, tileSize);
    }
    
    // Add empty tile
    const emptyTile = document.createElement('div');
    emptyTile.className = 'tile empty';
    emptyTile.style.width = `${tileSize}%`;
    emptyTile.style.height = `${tileSize}%`;
    emptyTile.dataset.row = gridSize - 1;
    emptyTile.dataset.col = gridSize - 1;
    emptyTile.dataset.index = totalTiles - 1;
    puzzleContainer.appendChild(emptyTile);
    
    // Shuffle tiles after a short delay
    setTimeout(() => {
        shuffleTiles(gridSize);
    }, 300);
}

// Create a single tile
function createTile(index, gridSize, tileSize) {
    if (!puzzleContainer) return;
    
    const tile = document.createElement('div');
    tile.className = 'tile numbered';
    tile.style.width = `${tileSize}%`;
    tile.style.height = `${tileSize}%`;
    
    // Calculate position
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Create color pattern
    const colorIndex = index % tilePatterns.length;
    tile.style.backgroundColor = tilePatterns[colorIndex];
    
    // Add number to tile
    tile.textContent = index + 1;
    
    // Add gradient background for the level
    const levelColor = levelColors[currentLevel - 1];
    const gradientDegree = (index * 30) % 360;
    tile.style.background = `linear-gradient(${gradientDegree}deg, ${levelColor.primary}, ${levelColor.secondary})`;
    
    // Add data attributes for position tracking
    tile.dataset.row = row;
    tile.dataset.col = col;
    tile.dataset.index = index;
    
    tile.addEventListener('click', () => moveTile(tile));
    puzzleContainer.appendChild(tile);
}

// Shuffle the tiles
function shuffleTiles(gridSize) {
    if (!puzzleContainer) return;
    
    const tiles = Array.from(puzzleContainer.children);
    const emptyTile = tiles.find(tile => tile.classList.contains('empty'));
    
    if (!emptyTile) return;
    
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
    if (!puzzleContainer) return [];
    
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
    if (!puzzleContainer) return;
    
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
        playSound(tileMoveSound);
        
        // Add a bounce animation
        tile.classList.add('bounce');
        setTimeout(() => {
            tile.classList.remove('bounce');
        }, 300);
        
        // Randomly activate a power-up
        randomPowerUp();
        
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
    
    // Add animation class for smooth movement
    tile1.classList.add('moving');
    setTimeout(() => {
        tile1.classList.remove('moving');
    }, 200);
}

// Check if the puzzle is solved
function checkWin() {
    if (!puzzleContainer) return false;
    
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
    playSound(levelCompleteSound);
    
    if (!completedLevels.includes(currentLevel)) {
        completedLevels.push(currentLevel);
        if (!unlockedLevels.includes(currentLevel + 1) && currentLevel < 10) {
            unlockedLevels.push(currentLevel + 1);
        }
        saveProgress();
    }
    
    if (winModal) {
        winModal.classList.add('active');
        
        const winLevel = document.getElementById('win-level');
        const winMoves = document.getElementById('win-moves');
        const winTime = document.getElementById('win-time');
        
        if (winLevel) winLevel.textContent = currentLevel;
        if (winMoves) winMoves.textContent = moves;
        if (winTime) winTime.textContent = formatTime(time);
    }
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
            if (messageDisplay) {
                messageDisplay.textContent = "Time's up! Try again.";
                messageDisplay.style.color = "red";
            }
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

// Function to activate a power-up
function activatePowerUp() {
    if (powerUpActive) return;
    powerUpActive = true;
    
    // Temporarily highlight all tiles
    puzzleContainer.classList.add('highlight');
    setTimeout(() => {
        puzzleContainer.classList.remove('highlight');
        powerUpActive = false;
    }, 5000);
}

// Add a random power-up activation
function randomPowerUp() {
    if (Math.random() < 0.1) { // 10% chance to activate
        activatePowerUp();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', init); 