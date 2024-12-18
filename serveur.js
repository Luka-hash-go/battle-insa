const WebSocket = require('ws');
const http = require('http');

// Port défini par Render
const PORT = process.env.PORT || 10000;

// Création d'un serveur HTTP
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Serveur WebSocket opérationnel !");
});

// Création du serveur WebSocket attaché au serveur HTTP
const wss = new WebSocket.Server({ server });

let clients = [];

// Écoute des connexions des clients
wss.on('connection', (socket) => {
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

// Démarrage du serveur HTTP
server.listen(PORT, () => {
    console.log(`Serveur HTTP & WebSocket démarré sur le port ${PORT}`);
});
