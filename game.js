// Game state management
const gameState = {
    totalPercentage: 100,
    currentOffer: 0,
    round: 1,
    maxRounds: 3,
    gameOver: false,
    currentPlayer: 1, // Track current player (1 or 2)
    lastOfferingPlayer: null, // Track last offering player
    gameLog: {
        gameId: new Date().toISOString(),
        rounds: [],
        finalOutcome: null,
        timestamp: new Date().toISOString()
    }
};

// DOM Elements
const elements = {
    totalDisplay: document.getElementById('cakeValue'),
    offerAmount: document.getElementById('offerAmount'),
    makeOffer: document.getElementById('makeOffer'),
    acceptOffer: document.getElementById('acceptOffer'),
    rejectOffer: document.getElementById('rejectOffer'),
    gameStatus: document.getElementById('gameStatus'),
    historyList: document.getElementById('historyList'),
    player1Label: document.getElementById('player1Label'),
    player2Label: document.getElementById('player2Label'),
    offerControls: document.getElementById('offerControls'),
    responseControls: document.getElementById('responseControls')
};

// Initialize game
function initializeGame() {
    updateDisplay();
    elements.makeOffer.addEventListener('click', handleOffer);
    elements.acceptOffer.addEventListener('click', () => handleResponse(true));
    elements.rejectOffer.addEventListener('click', () => handleResponse(false));
    
    // Hide response controls initially
    elements.responseControls.style.display = 'none';
    
    // Log game start
    logGameEvent('gameStart', { initialPercentage: gameState.totalPercentage });
    
    updatePlayerLabels();
}

// Update the display with current game state
function updateDisplay() {
    elements.totalDisplay.textContent = gameState.totalPercentage;
    elements.offerAmount.max = gameState.totalPercentage;
}

// Update player labels to show current player
function updatePlayerLabels() {
    elements.player1Label.classList.toggle('active', gameState.currentPlayer === 1);
    elements.player2Label.classList.toggle('active', gameState.currentPlayer === 2);
    
    // Show/hide appropriate controls
    if (!gameState.gameOver) {
        if (gameState.currentOffer === 0) {
            // Show offer controls to current player
            elements.offerControls.style.display = 'block';
            elements.responseControls.style.display = 'none';
            elements.gameStatus.textContent = `Player ${gameState.currentPlayer}, make your offer!`;
        } else {
            // Show response controls to other player
            elements.offerControls.style.display = 'none';
            elements.responseControls.style.display = 'block';
            elements.gameStatus.textContent = `Player ${gameState.currentPlayer}, accept or reject the offer?`;
        }
    }
}

// Add an entry to the game history and log
function addToHistory(message) {
    const historyItem = document.createElement('li');
    historyItem.textContent = message;
    elements.historyList.insertBefore(historyItem, elements.historyList.firstChild);
}

// Log game events
function logGameEvent(eventType, data) {
    const event = {
        type: eventType,
        timestamp: new Date().toISOString(),
        round: gameState.round,
        data: data
    };
    gameState.gameLog.rounds.push(event);
    
    // Save to localStorage
    saveGameLog();
}

// Save game log to localStorage
function saveGameLog() {
    const logs = JSON.parse(localStorage.getItem('vlaaiGameLogs') || '[]');
    const existingLogIndex = logs.findIndex(log => log.gameId === gameState.gameLog.gameId);
    
    if (existingLogIndex >= 0) {
        logs[existingLogIndex] = gameState.gameLog;
    } else {
        logs.push(gameState.gameLog);
    }
    
    localStorage.setItem('vlaaiGameLogs', JSON.stringify(logs));
}

// Handle player's offer
function handleOffer() {
    if (gameState.gameOver) return;

    const offerAmount = parseInt(elements.offerAmount.value);

    // Validate offer
    if (offerAmount < 0 || offerAmount > gameState.totalPercentage) {
        elements.gameStatus.textContent = `Please make a valid offer between 0% and ${gameState.totalPercentage}%`;
        return;
    }

    gameState.currentOffer = offerAmount;
    gameState.lastOfferingPlayer = gameState.currentPlayer;

    // log offer
    addToHistory(`Round ${gameState.round}: Player ${gameState.currentPlayer} wants to keep ${offerAmount}% and give ${gameState.totalPercentage - offerAmount}% to the other player`);

    // Log to game log
    logGameEvent('playerOffer', {
        player: gameState.currentPlayer,
        percentageKept: offerAmount,
        percentageOffered: gameState.totalPercentage - offerAmount
    });
    

    // Switch to response player
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updatePlayerLabels();
}


// Handle response to offer
function handleResponse(accepted) {
    if (accepted) {
        handleAcceptedOffer();
        return; // don't switch players - game ends
    } 
    
    handleRejectedOffer();
    
    // Reset offer
    gameState.currentOffer = 0;
    
    // Switch back to other player
    //gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updatePlayerLabels();
}

// Handle accepted offer
function handleAcceptedOffer() {
    if (gameState.gameOver) return;

    const offeringPlayer = gameState.lastOfferingPlayer;
    const receivingPlayer = gameState.currentPlayer;
    
    addToHistory(`Player ${gameState.currentPlayer} accepted: Player ${offeringPlayer} keeps ${gameState.currentOffer}%, Player ${receivingPlayer} gets ${gameState.totalPercentage - gameState.currentOffer}%`);
    elements.gameStatus.textContent = `Deal! Player ${offeringPlayer} keeps ${gameState.currentOffer}%, Player ${receivingPlayer} gets ${gameState.totalPercentage - gameState.currentOffer}%`;
    
    // Log acceptance
    logGameEvent('offerAccepted', { 
        offeringPlayer: offeringPlayer,
        receivingPlayer: receivingPlayer,
        offerPercentageKept: gameState.currentOffer,
        offerPercentageGiven: gameState.totalPercentage - gameState.currentOffer
    });
    
    gameState.currentOffer = 0;
    endGame('accepted');
}

// Handle rejected offer
function handleRejectedOffer() {
    const offeringPlayer = gameState.lastOfferingPlayer;
    const rejectingPlayer = gameState.lastOfferingPlayer === 1 ? 2 : 1;

    addToHistory(`Player ${rejectingPlayer} rejected Player ${offeringPlayer}'s offer`);

    logGameEvent('offerRejected', {
        offeringPlayer,
        rejectingPlayer
    });

    gameState.round++;

    if (gameState.round > gameState.maxRounds) {
        elements.gameStatus.textContent = "Game Over! Maximum rounds reached. Neither player gets any vlaai!";
        endGame('maxRoundsReached');
    } else {
        elements.gameStatus.textContent = `Round ${gameState.round}: Player ${gameState.currentPlayer}, make your offer!`;
    }
}



// End the game
function endGame(outcome) {
    gameState.gameOver = true;
    elements.offerControls.style.display = 'none';
    elements.responseControls.style.display = 'none';
    
    // Update final outcome in game log
    gameState.gameLog.finalOutcome = outcome;
    saveGameLog();
}

// Initialize the game when the page loads
//document.addEventListener('DOMContentLoaded', initializeGame);

// Export game logs function (can be called from console)
window.exportGameLogs = function() {
    const logs = localStorage.getItem('vlaaiGameLogs');
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vlaai_game_logs.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Function to collect all experiment data
function collectExperimentData() {
    // Get game logs
    const gameLogs = JSON.parse(localStorage.getItem('vlaaiGameLogs') || '[]');
    
    // Get current game state
    const currentGame = {
        gameState: {
            round: gameState.round,
            currentPlayer: gameState.currentPlayer,
            gameOver: gameState.gameOver,
            finalOutcome: gameState.gameLog.finalOutcome
        },
        history: Array.from(elements.historyList.children).map(li => li.textContent),
        timestamp: new Date().toISOString()
    };

    // Get chat logs if chat was used
    const chatLogs = chatState?.messages || [];

    // Combine all data
    const experimentData = {
        experimentId: gameState.gameLog.gameId,
        completedAt: new Date().toISOString(),
        gameLogs: gameLogs,
        currentGame: currentGame,
        chatLogs: chatLogs
    };

    return experimentData;
}

// Function to download experiment data
function downloadExperimentData(data) {
    // Create a formatted timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Convert data to JSON string
    const jsonStr = JSON.stringify(data, null, 2);
    
    // Create and trigger download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vlaai_experiment_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to handle experiment completion
function finishExperiment() {
    // Collect all data
    const experimentData = collectExperimentData();
    
    // Download the data
    downloadExperimentData(experimentData);
    
    // Clear all stored data
    localStorage.removeItem('vlaaiGameLogs');
    
    // Small delay to ensure download starts before refresh
    setTimeout(() => {
        // Refresh the page to reset the experiment
        window.location.reload();
    }, 1000);
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Add finish experiment button handler
    document.getElementById('finishExperiment').addEventListener('click', finishExperiment);
}); 