const express = require('express');
const cors = require('cors');

class API {
    constructor(blockchain, p2p, port) {
        this.blockchain = blockchain;
        this.p2p = p2p;
        this.port = port;
        this.app = express();
        this.initServer();
    }

    initServer() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.get('/blocks', (req, res) => res.send(this.blockchain.chain));

        this.app.post('/mine', (req, res) => {
            const newBlock = this.blockchain.mineBlock(req.body.data);
            this.blockchain.addBlock(newBlock);
            this.p2p.peers.forEach(peer => peer.send(JSON.stringify({ type: 'block', data: newBlock })));
            res.send(newBlock);
        });

        this.app.post('/addPeer', (req, res) => {
            this.p2p.connectToPeer(req.body.peer);
            res.send('Peer added');
        });

        this.app.listen(this.port, () => console.log(`API server running on port ${this.port}`));
    }
}

module.exports = API;
