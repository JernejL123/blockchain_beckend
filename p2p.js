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
            this.logPeers();

            ws.on('message', (message) => this.handleMessage(ws, message)); //Listener: Handles messages from peers connecting to your server.
            
            ws.send(JSON.stringify({ type: 'sync', data: this.blockchain.chain }));
        });

        console.log(`WebSocket server listening on port ${this.port}`);
    }

    sync() {
        setInterval(() => {
            this.peers.forEach((peerWs) => {
                if (peerWs.readyState === WebSocket.OPEN) {
                    console.log("syncing chains");
                    peerWs.send(JSON.stringify({ type: 'sync', data: this.blockchain.chain }));
                }
            });
        },5000);
    }

    handleMessage(ws, message) {
        try {
            const receivedData = JSON.parse(message);

            if (receivedData.type === 'block') {
                
                const newBlock = receivedData.data;
                console.log("recieved Data(block): ",newBlock);

                this.blockchain.addBlock(newBlock); 
            } else if (receivedData.type === 'sync') {
            
                const receivedChain = receivedData.data;
                this.checkAndReplaceChain(receivedChain, ws);
                
            }
        } catch (error) {
            console.error("Invalid JSON received:", error);
        }
    }


    checkAndReplaceChain(receivedChain, ws) {
        const recevedComulativeDiff = this.blockchain.calculateComulativeDifficulty(receivedChain);
        const thisComulativeDiff = this.blockchain.calculateComulativeDifficulty(this.blockchain.chain);
        
        console.log("SPREJETA KOMULATIVNA TEŽAVNOST:", recevedComulativeDiff);
        console.log("TRENUTNA KOMULATIVNA TEŽAVNOST:", thisComulativeDiff);

        if (recevedComulativeDiff > thisComulativeDiff) {
            console.log("Replacing chain with peer chain");
            this.blockchain.chain = receivedChain;
        } else if (recevedComulativeDiff < thisComulativeDiff) {
            console.log("Sending chain to peer");
            ws.send(JSON.stringify({ type: 'sync', data: this.blockchain.chain }));
        } else {
            console.log("Chains have equal comulative difficulty");
        }
    }
    

    connectToPeer(peerUrl) {
        const ws = new WebSocket(peerUrl);
        ws.on('open', () => this.peers.push(ws));
        ws.on('message', (message) => this.handleMessage(ws, message));//Listener: Handles messages from peers you actively connect to.
    }

    logPeers() {
        console.log('Connected Peers:');
        this.peers.forEach((peer, index) => {
            const remoteAddress = peer._socket.remoteAddress || 'Unknown';
            const remotePort = peer._socket.remotePort || 'Unknown';
            console.log(`Peer ${index + 1}: ${remoteAddress}:${remotePort}`);
        });
    }

}

module.exports = P2P;
