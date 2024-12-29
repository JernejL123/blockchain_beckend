const Blockchain = require('./blockchain');
const P2P = require('./p2p');
const API = require('./api');

const blockchain = new Blockchain();
const p2p = new P2P(blockchain, 3001);
const api = new API(blockchain, p2p, 3000);
