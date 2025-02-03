const { parentPort } = require('worker_threads');
const crypto = require('crypto');

// Mining 
parentPort.on('message', ({ previousBlock, data, difficulty }) => {
    let nonce = 0;
    let hash;
    const timestamp = Date.now();
    const index = previousBlock.index + 1;

    do {
        nonce++;
        hash = crypto
            .createHash('sha256')
            .update(index + previousBlock.hash + timestamp + JSON.stringify(this.data) + difficulty + nonce)
            .digest('hex');
    } while (hash.substring(0, difficulty) !== Array(difficulty + 1).join("0"));

    const newBlock = {
        index,
        previousHash: previousBlock.hash,
        timestamp,
        data,
        difficulty,
        nonce,
        hash,
    };

    parentPort.postMessage(newBlock); // Pošlje mined block na main thread
});


