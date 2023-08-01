/*
app.js
*/
const Blockchain = require('./Blockchain');
const P2pServer = require('./p2pServer');
const dotenv = require('dotenv');
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
// app.use(express.json());
// // enabling cors for all requests by using cors middleware
// app.use(cors());
// // Enable pre-flight
// app.options("*", cors());

const HTTP_PORT = process.env.HTTP_PORT || 3008;

const myBlockchain = new Blockchain();
const p2pServer = new P2pServer(myBlockchain);

p2pServer.start();

console.log(`My P2P server running on port ${HTTP_PORT}`);

// You can add peers using p2pServer.addPeer('http://localhost:3002') and so on.
