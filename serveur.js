/*const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Serveur WebSocket lancé sur le port ${PORT}`);
});

let players = [];
let currentTurn = 0; // 0 = Joueur 1, 1 = Joueur 2
let playerData = [{ boats: [] }, { boats: [] }];

server.on('connection', (socket) => {
    console.log('[NOUVEAU CLIENT] Connecté');

    // Ajout du joueur s'il reste de la place
    if (players.length < 2) {
        players.push(socket);
        socket.send(JSON.stringify({ type: 'status', content: `Joueur ${players.length} connecté` }));
        console.log(`Joueur ${players.length} connecté`);

        if (players.length === 2) {
            // Démarre la partie une fois les 2 joueurs connectés
            players.forEach((player, index) => {
                player.send(JSON.stringify({ type: 'start', turn: index === 0 }));
            });
        }
    } else {
        socket.send(JSON.stringify({ type: 'status', content: 'Partie déjà complète.' }));
        socket.close();
    }

    // Gestion des messages des joueurs
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('[MESSAGE REÇU]', data);

        if (data.type === 'attack') {
            // Envoie l'attaque à l'autre joueur
            const opponent = players.find((player) => player !== socket);
            opponent.send(JSON.stringify({ type: 'attack', cell: data.cell }));

            // Passe au tour suivant
            currentTurn = currentTurn === 0 ? 1 : 0;
            players[currentTurn].send(JSON.stringify({ type: 'turn', content: "C'est à votre tour de jouer !" }));
        }
    });

    socket.on('close', () => {
        console.log('[CLIENT DÉCONNECTÉ]');
        players = players.filter((player) => player !== socket);
    });
});*/

const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Serveur WebSocket lancé sur le port ${PORT}`);
});

let players = [];
let currentTurn = 0; // 0 = Joueur 1, 1 = Joueur 2
let playerData = [{ boats: [], hits: [] }, { boats: [], hits: [] }]; // Données des joueurs (bateaux et cases touchées)

server.on('connection', (socket) => {
    console.log('[NOUVEAU CLIENT] Connecté');

    // Ajout du joueur s'il reste de la place
    if (players.length < 2) {
        const playerIndex = players.length;
        players.push(socket);
        socket.send(JSON.stringify({ type: 'status', content: `Joueur ${playerIndex + 1} connecté` }));
        console.log(`Joueur ${playerIndex + 1} connecté`);

        // Une fois les deux joueurs connectés, démarre la partie
        if (players.length === 2) {
            players.forEach((player, index) => {
                player.send(JSON.stringify({ type: 'start', turn: index === 0 }));
            });
        }
    } else {
        socket.send(JSON.stringify({ type: 'status', content: 'Partie déjà complète.' }));
        socket.close();
    }

    // Gestion des messages des joueurs
    socket.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('[MESSAGE REÇU]', data);

        if (data.type === 'ready') {
            // Stocker les bateaux du joueur
            const playerIndex = players.indexOf(socket);
            playerData[playerIndex].boats = data.boats;
            console.log(`Bateaux du joueur ${playerIndex + 1} :`, data.boats);

            // Vérifie si les deux joueurs sont prêts
            if (playerData.every((player) => player.boats.length > 0)) {
                players.forEach((player, index) => {
                    player.send(JSON.stringify({ type: 'status', content: 'Les deux joueurs sont prêts. La partie commence !' }));
                    if (index === currentTurn) {
                        player.send(JSON.stringify({ type: 'turn', content: "C'est à votre tour de jouer !" }));
                    }
                });
            }
        }

        if (data.type === 'attack') {
            const playerIndex = players.indexOf(socket);
            const opponentIndex = playerIndex === 0 ? 1 : 0;

            const attackedCell = data.cell;
            const opponentBoats = playerData[opponentIndex].boats;

            let hit = false;
            if (opponentBoats.includes(attackedCell)) {
                hit = true;
                playerData[opponentIndex].hits.push(attackedCell);
            }

            // Envoie le résultat de l'attaque aux deux joueurs
            socket.send(JSON.stringify({ type: 'result', cell: attackedCell, hit }));
            players[opponentIndex].send(JSON.stringify({ type: 'attacked', cell: attackedCell, hit }));

            // Passe le tour au joueur suivant
            currentTurn = currentTurn === 0 ? 1 : 0;
            players[currentTurn].send(JSON.stringify({ type: 'turn', content: "C'est à votre tour de jouer !" }));
        }
    });

    socket.on('close', () => {
        console.log('[CLIENT DÉCONNECTÉ]');
        players = players.filter((player) => player !== socket);
        playerData = [{ boats: [], hits: [] }, { boats: [], hits: [] }];
        currentTurn = 0;
    });
});

