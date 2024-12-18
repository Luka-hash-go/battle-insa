const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Serveur WebSocket lancé sur le port ${PORT}`);
});

let players = [];
let readyPlayers = 0;
let playerData = [{ boats: [] }, { boats: [] }];
let currentTurn = 0;

server.on('connection', (socket) => {
    console.log('[NOUVEAU CLIENT] Connecté');

    if (players.length < 2) {
        const playerIndex = players.length;
        players.push(socket);
        console.log(`Joueur ${playerIndex + 1} connecté`);

        socket.send(JSON.stringify({ type: 'status', content: `Joueur ${playerIndex + 1} connecté` }));

        socket.on('message', (message) => {
            const data = JSON.parse(message);
            console.log('[MESSAGE REÇU]', data);

            if (data.type === 'ready') {
                playerData[playerIndex].boats = data.boats;
                readyPlayers++;
                console.log(`Joueur ${playerIndex + 1} est prêt`);

                if (readyPlayers === 2) {
                    // Démarre le jeu une fois que les deux joueurs sont prêts
                    players.forEach((player, index) => {
                        player.send(JSON.stringify({ type: 'start', turn: index === 0 }));
                    });
                }
            } else if (data.type === 'attack') {
                const opponentIndex = playerIndex === 0 ? 1 : 0;
                players[opponentIndex].send(JSON.stringify({ type: 'attack', cell: data.cell }));
                currentTurn = opponentIndex;

                players[currentTurn].send(JSON.stringify({ type: 'turn', content: "C'est à votre tour de jouer !" }));
            }
        });

        socket.on('close', () => {
            console.log('[CLIENT DÉCONNECTÉ]');
            players = players.filter((player) => player !== socket);
        });
    } else {
        socket.send(JSON.stringify({ type: 'status', content: 'Partie déjà complète.' }));
        socket.close();
    }
});
