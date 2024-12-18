const playerBoard = document.getElementById('player-board');
const opponentBoard = document.getElementById('opponent-board');
const status = document.getElementById('status');
const readyButton = document.getElementById('ready-button');

const socket = new WebSocket("wss://battle-insa.onrender.com");

let isMyTurn = false;
let myShips = new Array(100).fill(0);
let isPlacing = true;

// Fonction pour créer une grille
function createBoard(board, clickable = false) {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        board.appendChild(cell);
        if (clickable) {
            cell.addEventListener('click', () => placeShip(i));
        }
    }
}

createBoard(playerBoard, true);
createBoard(opponentBoard);

// Placement des bateaux
function placeShip(index) {
    if (!isPlacing) return;

    if (myShips[index] === 0) {
        myShips[index] = 1;
        playerBoard.children[index].classList.add('ship');
    } else {
        myShips[index] = 0;
        playerBoard.children[index].classList.remove('ship');
    }
}

// Envoi des bateaux au serveur
readyButton.addEventListener('click', () => {
    socket.send(JSON.stringify({ type: 'placeShips', grid: myShips }));
    isPlacing = false;
    status.textContent = "En attente de l'adversaire...";
});

// Gestion des messages
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'setup') {
        status.textContent = "Placez vos bateaux.";
    } else if (message.type === 'start') {
        status.textContent = isMyTurn ? "Votre tour !" : "Tour de l’adversaire...";
    } else if (message.type === 'update') {
        const board = message.opponent ? playerBoard : opponentBoard;
        board.children[message.cell].classList.add(message.hit ? 'hit' : 'miss');
        isMyTurn = message.currentPlayer === 0;
        status.textContent = isMyTurn ? "Votre tour !" : "Tour de l’adversaire...";
    }
};

opponentBoard.addEventListener('click', (e) => {
    if (!isMyTurn || isPlacing) return;
    const index = Array.from(opponentBoard.children).indexOf(e.target);
    socket.send(JSON.stringify({ type: 'attack', cell: index }));
});
