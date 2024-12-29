// Import required modules
const crypto = require('crypto');

// Blockchain Class
class Block {
    constructor(index, previousHash, timestamp, data, difficulty, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
        this.nonce = nonce;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.difficulty + this.nonce)
            .digest('hex');
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5; // Initial difficulty
        this.blockGenerationInterval = 10; // seconds
        this.adjustmentInterval = 10; // blocks
    }

    createGenesisBlock() {
        return new Block(0, "0", Date.now(), "Genesis Block", this.difficulty, 0);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.chain.push(newBlock);
        }
    }

    isValidNewBlock(newBlock, previousBlock) {
        if (newBlock.index !== previousBlock.index + 1) return false;
        if (newBlock.previousHash !== previousBlock.hash) return false;
        if (newBlock.hash !== newBlock.calculateHash()) return false;
        return true;
    }

    isChainValid(chain) {
        for (let i = 1; i < chain.length; i++) {
            if (!this.isValidNewBlock(chain[i], chain[i - 1])) {
                return false;
            }
        }
        return true;
    }

    calculateDifficulty() {
        const latestBlock = this.getLatestBlock();
        if (this.chain.length % this.adjustmentInterval === 0 && this.chain.length !== 0) {
            const expectedTime = this.blockGenerationInterval * this.adjustmentInterval;
            const actualTime = latestBlock.timestamp - this.chain[this.chain.length - this.adjustmentInterval].timestamp;
            if (actualTime < expectedTime / 2) return this.difficulty + 1;
            else if (actualTime > expectedTime * 2) return this.difficulty - 1;
        }
        return this.difficulty;
    }


    mineBlock(data) {
        const previousBlock = this.getLatestBlock();
        const index = previousBlock.index + 1;
        const timestamp = Date.now();
        const difficulty = this.calculateDifficulty();
        let nonce = 0;
        let hash;

        do {
            nonce++;
            hash = crypto
                .createHash('sha256')
                .update(index + previousBlock.hash + timestamp + JSON.stringify(data) + difficulty + nonce)
                .digest('hex');
        } while (hash.substring(0, difficulty) !== Array(difficulty + 1).join("0"));

        return new Block(index, previousBlock.hash, timestamp, data, difficulty, nonce);
    }
}

module.exports = Blockchain;












