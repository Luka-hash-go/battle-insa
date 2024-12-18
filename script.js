const playerBoard = document.getElementById('player-board');
const opponentBoard = document.getElementById('opponent-board');
const status = document.getElementById('status');
const readyButton = document.getElementById('ready');

const socket = new WebSocket('wss://battle-insa.onrender.com');

let isPlayerTurn = false;

// Crée une grille
function createBoard(board) {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        board.appendChild(cell);
    }
}

function updateStatus(message) {
    status.textContent = message;
}

// Envoi d'une attaque
opponentBoard.addEventListener('click', (event) => {
    if (!isPlayerTurn) return;
    const cellIndex = Array.from(opponentBoard.children).indexOf(event.target);
    if (cellIndex >= 0) {
        socket.send(JSON.stringify({ type: 'attack', cell: cellIndex }));
        isPlayerTurn = false;
        updateStatus("Attente de l'adversaire...");
    }
});

// Réception des messages du serveur
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'status') {
        updateStatus(message.content);
    } else if (message.type === 'start') {
        isPlayerTurn = message.turn;
        updateStatus(isPlayerTurn ? "C'est votre tour !" : "Tour de l'adversaire...");
    } else if (message.type === 'attack') {
        // Marque l'attaque reçue
        const cell = playerBoard.children[message.cell];
        cell.classList.add('hit');
        updateStatus("Votre adversaire a attaqué !");
    } else if (message.type === 'turn') {
        isPlayerTurn = true;
        updateStatus(message.content);
    }
};

createBoard(playerBoard);
createBoard(opponentBoard);
