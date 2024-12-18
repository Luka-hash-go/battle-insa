const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;

const server = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Serveur WebSocket lancé sur le port ${PORT}`);
});

let players = [];
let currentTurn = 0; // 0 = Joueur 1, 1 = Joueur 2

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
});
