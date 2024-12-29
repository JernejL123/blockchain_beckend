const WebSocket = require('ws');

class P2P {
    constructor(blockchain, port) {
        this.blockchain = blockchain;
        this.peers = [];
        this.port = port;
        this.initServer();
    }

    initServer() {
        const wsServer = new WebSocket.Server({ port: this.port });

        wsServer.on('connection', (ws) => {
            console.log('New peer connection');
            this.peers.push(ws);

            ws.on('message', (message) => this.handleMessage(ws, message));
            ws.send(JSON.stringify({ type: 'sync', data: this.blockchain.chain }));
        });

        console.log(`WebSocket server listening on port ${this.port}`);
    }

    handleMessage(ws, message) {
        const receivedData = JSON.parse(message);

        if (receivedData.type === 'block') {
            const newBlock = receivedData.data;
            this.blockchain.addBlock(newBlock);
        } else if (receivedData.type === 'sync') {
            this.blockchain.chain = receivedData.data;
        }
    }

    connectToPeer(peerUrl) {
        const ws = new WebSocket(peerUrl);
        ws.on('open', () => this.peers.push(ws));
        ws.on('message', (message) => this.handleMessage(ws, message));
    }
}

module.exports = P2P;
