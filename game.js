const gameState = {
    totalPercentage: 100,
    currentOffer: 0,
    round: 1,
    maxRounds: 6,
    gameOver: false,
    currentPlayer: 1,
    lastOfferingPlayer: null,
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
    elements.responseControls.style.display = 'none';
    logGameEvent('gameStart', { initialPercentage: gameState.totalPercentage });
    updatePlayerLabels();
}

function updateDisplay() {
    elements.totalDisplay.textContent = gameState.totalPercentage;
    elements.offerAmount.max = gameState.totalPercentage;
}

function updatePlayerLabels() {
    elements.player1Label.classList.toggle('active', gameState.currentPlayer === 1);
    elements.player2Label.classList.toggle('active', gameState.currentPlayer === 2);

    if (!gameState.gameOver) {
        if (gameState.currentOffer === 0) {
            elements.offerControls.style.display = 'block';
            elements.responseControls.style.display = 'none';
            elements.gameStatus.textContent = `Player ${gameState.currentPlayer}, make your offer!`;
        } else {
            elements.offerControls.style.display = 'none';
            elements.responseControls.style.display = 'block';
            elements.gameStatus.textContent = `Player ${gameState.currentPlayer}, accept or reject the offer?`;
        }
    }
}

function addToHistory(message) {
    const historyItem = document.createElement('li');
    historyItem.textContent = message;
    elements.historyList.insertBefore(historyItem, elements.historyList.firstChild);
}

function logGameEvent(eventType, data) {
    const event = {
        type: eventType,
        timestamp: new Date().toISOString(),
        round: gameState.round,
        data: data
    };
    gameState.gameLog.rounds.push(event);
    saveGameLog();
}

function saveGameLog() {
    const logs = JSON.parse(localStorage.getItem('vlaaiGameLogs') || '[]');
    const index = logs.findIndex(log => log.gameId === gameState.gameLog.gameId);
    if (index >= 0) {
        logs[index] = gameState.gameLog;
    } else {
        logs.push(gameState.gameLog);
    }
    localStorage.setItem('vlaaiGameLogs', JSON.stringify(logs));
}

function handleOffer() {
    if (gameState.gameOver) return;
    const offerAmount = parseInt(elements.offerAmount.value);
    if (offerAmount < 0 || offerAmount > gameState.totalPercentage) {
        elements.gameStatus.textContent = `Please make a valid offer between 0% and ${gameState.totalPercentage}%`;
        return;
    }

    gameState.currentOffer = offerAmount;
    gameState.lastOfferingPlayer = gameState.currentPlayer;

    addToHistory(`Round ${gameState.round}: Player ${gameState.currentPlayer} wants to keep ${offerAmount}% and give ${gameState.totalPercentage - offerAmount}% to the other player`);
    logGameEvent('playerOffer', {
        player: gameState.currentPlayer,
        percentageKept: offerAmount,
        percentageOffered: gameState.totalPercentage - offerAmount
    });

    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updatePlayerLabels();
}

function handleResponse(accepted) {
    if (accepted) {
        handleAcceptedOffer();
        return;
    }
    handleRejectedOffer();
    gameState.currentOffer = 0;
    updatePlayerLabels();
}

function handleAcceptedOffer() {
    if (gameState.gameOver) return;
    const offeringPlayer = gameState.lastOfferingPlayer;
    const receivingPlayer = gameState.currentPlayer;

    addToHistory(`Player ${gameState.currentPlayer} accepted: Player ${offeringPlayer} keeps ${gameState.currentOffer}%, Player ${receivingPlayer} gets ${gameState.totalPercentage - gameState.currentOffer}%`);
    elements.gameStatus.textContent = `Deal! Player ${offeringPlayer} keeps ${gameState.currentOffer}%, Player ${receivingPlayer} gets ${gameState.totalPercentage - gameState.currentOffer}%`;

    logGameEvent('offerAccepted', {
        offeringPlayer,
        receivingPlayer,
        offerPercentageKept: gameState.currentOffer,
        offerPercentageGiven: gameState.totalPercentage - gameState.currentOffer
    });

    gameState.currentOffer = 0;
    endGame('accepted');
}

function handleRejectedOffer() {
    const offeringPlayer = gameState.lastOfferingPlayer;
    const rejectingPlayer = gameState.lastOfferingPlayer === 1 ? 2 : 1;

    addToHistory(`Player ${rejectingPlayer} rejected Player ${offeringPlayer}'s offer`);
    logGameEvent('offerRejected', { offeringPlayer, rejectingPlayer });

    gameState.round++;
    if (gameState.round > gameState.maxRounds) {
        elements.gameStatus.textContent = "Game Over! Maximum rounds reached. Neither player gets any vlaai!";
        endGame('maxRoundsReached');
    } else {
        elements.gameStatus.textContent = `Round ${gameState.round}: Player ${gameState.currentPlayer}, make your offer!`;
    }
}

function endGame(outcome) {
    gameState.gameOver = true;
    elements.offerControls.style.display = 'none';
    elements.responseControls.style.display = 'none';
    gameState.gameLog.finalOutcome = outcome;
    saveGameLog();
}

// Export game logs
window.exportGameLogs = function () {
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

// Collect data from game and chat
function collectExperimentData() {
    const gameLogs = JSON.parse(localStorage.getItem('vlaaiGameLogs') || '[]');

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

    const chatLogs = window.chatLogs || {}; // <-- updated from chat.js

    return {
        experimentId: gameState.gameLog.gameId,
        completedAt: new Date().toISOString(),
        gameLogs,
        currentGame,
        chatLogs
    };
}

// Download experiment data
function downloadExperimentData(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonStr = JSON.stringify(data, null, 2);
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

// Finish Experiment Handler
function finishExperiment() {
    const experimentData = collectExperimentData();
    downloadExperimentData(experimentData);
    localStorage.removeItem('vlaaiGameLogs');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Page Load
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    document.getElementById('finishExperiment').addEventListener('click', finishExperiment);
});
