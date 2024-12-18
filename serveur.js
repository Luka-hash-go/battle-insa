const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Serveur lancé sur le port ${PORT}`);
});

let players = [];
let shipsPlaced = [false, false];
let grids = [{}, {}]; // Grilles des deux joueurs
let currentPlayer = 0; // Tour du joueur

// Gestion des connexions
server.on('connection', (socket) => {
    console.log('Nouveau joueur connecté');

    if (players.length >= 2) {
        socket.send(JSON.stringify({ type: 'error', content: 'Deux joueurs déjà connectés.' }));
        socket.close();
        return;
    }

    const playerIndex = players.length;
    players.push(socket);

    socket.send(JSON.stringify({ type: 'setup', player: playerIndex }));

    // Gestion des messages
    socket.on('message', (data) => {
        const message = JSON.parse(data);

        if (message.type === 'placeShips') {
            grids[playerIndex] = message.grid;
            shipsPlaced[playerIndex] = true;

            if (shipsPlaced.every((ready) => ready)) {
                players.forEach((player, idx) => {
                    player.send(JSON.stringify({ type: 'start', currentPlayer }));
                });
            }
        } else if (message.type === 'attack') {
            const opponent = (playerIndex + 1) % 2;
            const hit = grids[opponent][message.cell] === 1;

            grids[opponent][message.cell] = hit ? 2 : 3;

            players.forEach((player, idx) => {
                player.send(JSON.stringify({
                    type: 'update',
                    hit,
                    cell: message.cell,
                    opponent: idx === opponent,
                    currentPlayer: hit ? currentPlayer : opponent
                }));
            });

            if (!hit) currentPlayer = opponent;
        }
    });

    socket.on('close', () => {
        console.log('Joueur déconnecté');
        players = [];
        grids = [{}, {}];
        shipsPlaced = [false, false];
        currentPlayer = 0;
    });
});
