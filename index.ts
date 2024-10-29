// server.ts
import WebSocket, { WebSocketServer } from 'ws';


const PORT: number = parseInt(process.env.PORT || '8080', 10); // Default to 8080 for local development

const server: WebSocketServer = new WebSocketServer({ port: PORT }, () => {
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

server.on('connection', (ws: WebSocket) => {
    // console.log('New client connected');

    ws.on('message', (message: string) => {
        // Broadcast the stroke data to all other connected clients
        server.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                // console.log(`Received stroke data: ${message}`);
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        // console.log('Client disconnected');
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });
});
