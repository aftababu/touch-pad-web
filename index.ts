import WebSocket, { WebSocketServer } from "ws";

const WS_PORT: number = parseInt(process.env.WS_PORT || "8080", 10);

const server: WebSocketServer = new WebSocketServer({ port: WS_PORT }, () => {
    console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
});
const sessionClients: Map<string, Set<WebSocket>> = new Map();

server.on('connection', (ws: WebSocket, req) => {
    const urlParams = new URLSearchParams(req.url?.split('?')[1]);
    const sessionId = urlParams.get('id');
// console.log(sessionId);
    if (!sessionId) {
        ws.close(1008, 'Session ID required');
        return;
    }

    if (!sessionClients.has(sessionId)) {
        sessionClients.set(sessionId, new Set());
    }
    sessionClients.get(sessionId)?.add(ws);


    ws.on('message', (message: string) => {
        sessionClients.get(sessionId)?.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                // console.log(`Sending message to client: ${sessionId}`,message);
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        sessionClients.get(sessionId)?.delete(ws);
        if (sessionClients.get(sessionId)?.size === 0) {
            sessionClients.delete(sessionId);
        }

        console.log(`Client disconnected from session: ${sessionId}`);
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });
});