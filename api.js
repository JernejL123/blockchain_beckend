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

        this.app.get('/blocks', (req, res) => {
            try {
                res.send(this.blockchain.chain);
            } catch (error) {
                res.status(500).json({ message: 'Error sending blocks'})
            }
        });


        this.app.post('/mine', async (req, res) => {
            try {
                const newBlock = await this.blockchain.mineBlock(req.body.data); // pocaka na mining
                this.blockchain.addBlock(newBlock); // doda block v svoj chain
        
                const message = { type: 'block', data: newBlock }; 
                const serializedMessage = JSON.stringify(message);
        
                console.log('Sending message to peers:', message);
                this.p2p.peers.forEach(peer => peer.send(serializedMessage));
        
                res.json({ message: 'New block mined and broadcasted', block: newBlock });
            } catch (error) {
                console.error('Error mining block:', error);
                res.status(500).json({ message: 'Error mining block', error: error.message });
            }
        });
        

        this.app.post('/addPeer', (req, res) => {
            try {
                this.p2p.connectToPeer(req.body.peer);
                res.send('Peer added');
            } catch (error){
                res.status(500).json({ message: 'Error adding peer'})
            }
            
        });

        this.app.listen(this.port, () => console.log(`API server running on port ${this.port}`));
    }
}

module.exports = API;
