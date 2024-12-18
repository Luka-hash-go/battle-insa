// Récupération des éléments HTML
const playerBoard = document.getElementById('player-board');
const opponentBoard = document.getElementById('opponent-board');
const status = document.getElementById('status');

// Connexion au serveur WebSocket
const socket = new WebSocket("wss://https://battle-insa.onrender.com"); // Remplace par l'IP du serveur si nécessaire

// Fonction pour créer une grille (10x10)
function createBoard(board) {
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div'); // Création d'une case
        board.appendChild(cell); // Ajout de la case à la grille
    }
}

// Gestion des messages reçus du serveur
socket.onmessage = (event) => {
    const message = JSON.parse(event.data); // Conversion du message en objet
    if (message.type === 'update') {
        // Met à jour la grille adverse
        updateBoard(opponentBoard, message.board);
    } else if (message.type === 'status') {
        // Met à jour le statut
        status.textContent = message.content;
    }
};

// Envoi d'un tir au serveur lorsque le joueur clique sur une case
opponentBoard.addEventListener('click', (event) => {
    const cellIndex = Array.from(opponentBoard.children).indexOf(event.target); // Index de la case
    if (cellIndex >= 0) {
        // Envoi du tir au serveur
        socket.send(JSON.stringify({ type: 'attack', cell: cellIndex }));
    }
});

// Création des grilles du joueur et de l'adversaire
createBoard(playerBoard);
createBoard(opponentBoard);
