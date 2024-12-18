const playerBoard = document.getElementById('player-board');
const opponentBoard = document.getElementById('opponent-board');
const status = document.getElementById('status');
const readyButton = document.getElementById('ready-button');

const socket = new WebSocket('wss://battle-insa.onrender.com');

let isPlayerTurn = false;
let boatsPlaced = false;
let ready = false;
let boats = []; // Positions des bateaux


// Mise à jour de l'état affiché
function updateStatus(message) {
    status.textContent = message;
}

// Crée une grille avec gestion des clics
function createBoard(board, clickHandler = null) {
    board.innerHTML = ''; // Vide la grille existante
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i; // Associe un index à chaque cellule
        if (clickHandler) {
            cell.addEventListener('click', () => clickHandler(i));
        }
        board.appendChild(cell);
    }
}


// Placement  des bateaux
function placeBoat(index) {
    if (boats.length >= 5) {
        updateStatus("Vous avez déjà placé vos 5 bateaux.");
        return;
    }
    if (boats.includes(index)) {
        updateStatus("Ce bateau est déjà placé ici !");
        return;
    }
    const cell = playerBoard.querySelector(`[data-index='${index}']`);
    cell.classList.add('boat'); // Change la couleur pour représenter un bateau
    boats.push(index); // Ajoute l'index aux positions des bateaux

    if (boats.length === 5) {
        updateStatus('Tous vos bateaux sont placés. Cliquez sur "Prêt" pour continuer.');
    } else {
        updateStatus(`Bateau placé ! Encore ${5 - boats.length} à placer.`);
    }
}

    //const cell = playerBoard.children[index];
    //cell.classList.add('boat'); // Change la couleur pour représenter un bateau
    //boats.push(index); // Ajoute l'index aux positions des bateaux

   

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
        cell.classList.add('hit');
        updateStatus("Votre adversaire a attaqué !");
    } else if (message.type === 'turn') {
        isPlayerTurn = true;
        updateStatus(message.content);
    }
};

createBoard(playerBoard);
createBoard(opponentBoard);
