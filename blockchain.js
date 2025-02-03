const { Worker } = require('worker_threads');
const crypto = require('crypto');
const P2P = require('./p2p'); 

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
            .update(this.index + this.previousHash + JSON.stringify(this.data) + this.timestamp + this.difficulty + this.nonce)
            .digest('hex');
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1; // zacetni difficulty
        this.blockGenerationInterval =  2; // sec
        this.adjustmentInterval = 2; // blocks
        this.isMining = false;
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
        if (newBlock.timestamp > Date.now() + 60 * 1000 ) return false; //validacija casovne znacke za trenutni cas(60sek)
        if (newBlock.timestamp < previousBlock.timestamp - 60 * 1000) return false; //validacija casovne znacke glede na prejsnji blok
        return true;
    }

    calculateComulativeDifficulty(chain) {
        let comulativeDifficulty = 0;
    
        for (let i = 1; i < chain.length; i++) {
            if (!this.isValidNewBlock(chain[i], chain[i - 1])) {
                return "error chain not valid"; 
            }
            comulativeDifficulty += Math.pow(2, chain[i].difficulty);
        }
        return comulativeDifficulty;
    }
    


    calculateDifficulty() {
        const latestBlock = this.getLatestBlock();

        if (this.chain.length < this.adjustmentInterval) {
            return this.difficulty; 
        } 
        else {
            const timeTaken = latestBlock.timestamp - this.chain[this.chain.length - this.adjustmentInterval].timestamp; 
            console.log("ACTUAL TIME",timeTaken);
            const timeExpected = this.blockGenerationInterval * this.adjustmentInterval * 100;
            console.log("EXPECTED TIME",timeExpected);

            if (timeTaken < timeExpected / 2) {
                console.log("DIFFICULTY INCREMENTED");
                return this.difficulty += 1;
            }
            else if (timeTaken > timeExpected * 2 && this.difficulty > 0){
                console.log("DIFFICULTY DECREMENTED");
                return this.difficulty -= 1;
            } else {
                console.log("DIFFICULTY STAYED THE SAME");
                return this.difficulty; 
            }
        }
    }

    mineBlock(data) {
        return new Promise((resolve, reject) => {
            const previousBlock = this.getLatestBlock();
            const difficulty = this.calculateDifficulty();
    
            this.isMining = true;
            const worker = new Worker('./mineWorker.js');
            worker.postMessage({ previousBlock, data, difficulty });
    
            worker.on('message', (newBlock) => {
                console.log('Block mined:', newBlock);
                resolve(newBlock); // Resolve promise z novim blockom
                worker.terminate();
                this.isMining = false;
            });
    
            worker.on('error', (err) => {
                console.error('Worker error:', err);
                reject(err); // Reject promise ce je napaka
                this.isMining = false;
            });
        });
    }
    
}

module.exports = Blockchain;