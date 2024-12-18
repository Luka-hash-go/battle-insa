const WebSocket = require('ws');
const PORT = process.env.PORT || 12345; // Port pour Render

const server = new WebSocket.Server({ port: PORT }, () => {
    console.log(`Serveur WebSocket lancé sur le port ${PORT}`);
});

let clients = [];

// Écoute des connexions des clients
server.on('connection', (socket) => {
    console.log('[NOUVEAU CLIENT] Connecté');

    // Ajout du client à la liste
    clients.push(socket);

    // Gestion des messages reçus d'un client
    socket.on('message', (message) => {
        console.log('[MESSAGE REÇU]', message);

        // Diffusion du message aux autres clients
        clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Gestion de la déconnexion
    socket.on('close', () => {
        console.log('[CLIENT DÉCONNECTÉ]');
        clients = clients.filter((client) => client !== socket);
    });
});

console.log('[SERVEUR] WebSocket en écoute sur le port 5500');