const playerBoard = document.getElementById('player-board');
const opponentBoard = document.getElementById('opponent-board');
const status = document.getElementById('status');
const readyButton = document.getElementById('ready');

const socket = new WebSocket('wss://battle-insa.onrender.com');

let isPlayerTurn = false;
let boatsPlaced = false;
let ready = false;

// Création des grilles
function createBoard(board, clickHandler = null) {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        if (clickHandler) {
            cell.addEventListener('click', () => clickHandler(i));
        }
        board.appendChild(cell);
    }
}

function updateStatus(message) {
    status.textContent = message;
}

// Placement des bateaux
const boats = [];
function placeBoat(index) {
    if (boats.length >= 5 || boats.includes(index)) return; // Maximum 5 bateaux
    const cell = playerBoard.children[index];
    cell.classList.add('boat');
    boats.push(index);
    if (boats.length === 5) {
        updateStatus('Tous vos bateaux sont placés. Cliquez sur "Prêt" pour continuer.');
    }
}

// Envoi de l'état "prêt" au serveur
readyButton.addEventListener('click', () => {
    if (boats.length < 5) {
        updateStatus('Placez d\'abord vos 5 bateaux !');
        return;
    }
    if (!ready) {
        ready = true;
        socket.send(JSON.stringify({ type: 'ready', boats }));
        updateStatus('En attente de l\'adversaire...');
    }
});

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
        cell.classList.add(cell.classList.contains('boat') ? 'hit' : 'miss');
        updateStatus("Votre adversaire a attaqué !");
    } else if (message.type === 'turn') {
        isPlayerTurn = true;
        updateStatus(message.content);
    }
};

createBoard(playerBoard, placeBoat);
createBoard(opponentBoard);
