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

// Image URLs for each level - using GitHub-friendly image hosting
const levelImages = [
    'https://i.imgur.com/kCpL5D3.jpg', // Colorful abstract 1
    'https://i.imgur.com/zVVPh2n.jpg', // Mountains
    'https://i.imgur.com/xUoiZJx.jpg', // Colorful gradient
    'https://i.imgur.com/oNoTgAe.jpg', // Beach sunset
    'https://i.imgur.com/rHnZmAr.jpg', // Forest
    'https://i.imgur.com/d9hjBCL.jpg', // Woman portrait
    'https://i.imgur.com/MZIerRe.jpg', // City night
    'https://i.imgur.com/vVGaI4Q.jpg', // Tech abstract
    'https://i.imgur.com/NYfY1D5.jpg', // Flowers 
    'https://i.imgur.com/vzFHgGu.jpg'  // Abstract colors
];

// Fallback image in case the main images fail to load
const fallbackImage = 'https://i.imgur.com/ZUe4GKj.jpg'; // Simple pattern

// Level time settings (in seconds): 60s for level 1, 120s for level 2, etc.
const levelTimes = [60, 120, 180, 240, 300, 360, 420, 480, 540, 600];

// Grid sizes for different levels
const levelGridSizes = [3, 3, 4, 4, 4, 5, 5, 5, 6, 6];

// Initialize the game
function init() {
    // Show loading overlay
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    loadProgress();
    createLevelButtons();
    preloadImages().then(() => {
        // Hide loading overlay when preloading is complete
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
    }).catch(error => {
        console.error('Error preloading images:', error);
        // Still hide the overlay even if there was an error
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
    });
}

// Preload all images to avoid loading issues
function preloadImages() {
    return new Promise((resolve) => {
        // Create an array to hold all images
        const preloadedImages = [];
        let loadedCount = 0;
        const totalImages = levelImages.length;
        
        // Create a function to update loading status
        const imageLoaded = () => {
            loadedCount++;
            if (loadedCount >= totalImages) {
                imagesLoaded = true;
                resolve();
            }
        };

        // Preload all level images
        levelImages.forEach((url, index) => {
            const img = new Image();
            img.onload = () => {
                preloadedImages[index] = img;
                imageLoaded();
            };
            img.onerror = () => {
                // If error, use fallback and continue
                console.error(`Failed to load image: ${url}`);
                const fallbackImg = new Image();
                fallbackImg.src = fallbackImage;
                preloadedImages[index] = fallbackImg;
                
                // Replace the failed URL with fallback in the levelImages array
                levelImages[index] = fallbackImage;
                imageLoaded();
            };
            img.src = url;
        });

        // Also preload the fallback
        const fallbackImg = new Image();
        fallbackImg.src = fallbackImage;
        
        // If no images load within 5 seconds, resolve anyway
        setTimeout(() => {
            if (!imagesLoaded) {
                console.warn('Image preloading timeout - continuing anyway');
                resolve();
            }
        }, 5000);
    });
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
    
    // Load level image with error handling
    if (previewImage) {
        const imgUrl = levelImages[level - 1] || fallbackImage;
        setBackgroundSafely(previewImage, imgUrl);
    }
}

// Safe way to set background images
function setBackgroundSafely(element, url) {
    if (!element) return;
    
    // Set default background first
    element.style.backgroundColor = '#e0e0e0';
    
    // Create a temporary image to check loading
    const tempImg = new Image();
    
    tempImg.onload = () => {
        element.style.backgroundImage = `url(${url})`;
    };
    
    tempImg.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        element.style.backgroundImage = `url(${fallbackImage})`;
    };
    
    tempImg.src = url;
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
    
    // Get current level image or fallback
    const currentImage = levelImages[currentLevel - 1] || fallbackImage;
    
    // Create tiles (except the last one, which will be empty)
    for (let i = 0; i < totalTiles - 1; i++) {
        createTile(i, gridSize, tileSize, currentImage);
    }
    
    // Add empty tile
    const emptyTile = document.createElement('div');
    emptyTile.className = 'tile empty';
    emptyTile.style.width = `${tileSize}%`;
    emptyTile.style.height = `${tileSize}%`;
    emptyTile.dataset.row = gridSize - 1;
    emptyTile.dataset.col = gridSize - 1;
    puzzleContainer.appendChild(emptyTile);
    
    // Shuffle tiles after a short delay to ensure images are loaded
    setTimeout(() => {
        shuffleTiles(gridSize);
    }, 500);
}

// Create a single tile
function createTile(index, gridSize, tileSize, imageUrl) {
    if (!puzzleContainer) return;
    
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.width = `${tileSize}%`;
    tile.style.height = `${tileSize}%`;
    
    // Calculate background position
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    // Try setting the background image directly
    try {
        // Set the background image directly with appropriate sizing and position
        tile.style.backgroundImage = `url(${imageUrl})`;
        tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
        tile.style.backgroundPosition = `${col * (100/(gridSize-1))}% ${row * (100/(gridSize-1))}%`;
    } catch (error) {
        console.error('Error setting background image:', error);
        // If error occurs, use fallback colored tiles
        useFallbackTileStyle(tile, index, row, col, gridSize);
    }
    
    // Add data attributes for position tracking
    tile.dataset.row = row;
    tile.dataset.col = col;
    
    tile.addEventListener('click', () => moveTile(tile));
    puzzleContainer.appendChild(tile);
    
    // Handle load errors - check if image load is successful after short timeout
    setTimeout(() => {
        // If image doesn't appear to be showing correctly (no background image or error loading)
        const computedStyle = window.getComputedStyle(tile);
        if (
            !computedStyle.backgroundImage || 
            computedStyle.backgroundImage === 'none' || 
            tile.offsetHeight < 10 // Sanity check for rendering
        ) {
            useFallbackTileStyle(tile, index, row, col, gridSize);
        }
    }, 300);
}

// Apply fallback colored style for tiles when images fail
function useFallbackTileStyle(tile, index, row, col, gridSize) {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const colorIndex = (row * gridSize + col) % colors.length;
    
    // Remove background image and add color
    tile.style.backgroundImage = 'none';
    tile.style.backgroundColor = colors[colorIndex];
    
    // Add class and text for number
    tile.classList.add('numbered');
    tile.textContent = index + 1;
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
    
    // Visual position swap
    const tempStyle = {
        top: tile1.style.top,
        left: tile1.style.left,
        order: tile1.style.order
    };
    
    tile1.style.top = tile2.style.top;
    tile1.style.left = tile2.style.left;
    tile1.style.order = tile2.style.order;
    
    tile2.style.top = tempStyle.top;
    tile2.style.left = tempStyle.left;
    tile2.style.order = tempStyle.order;
    
    // Swap background position if not empty tile
    if (!tile1.classList.contains('empty') && !tile2.classList.contains('empty')) {
        const tempBg = tile1.style.backgroundPosition;
        tile1.style.backgroundPosition = tile2.style.backgroundPosition;
        tile2.style.backgroundPosition = tempBg;
    }
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
    playSound(winSound);
    
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

// Initialize the game when the page loads
window.addEventListener('load', init); 