/*
p2pServer.js
*/

const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./Blockchain');
const Block = require('./Block');
const dotenv = require('dotenv');
dotenv.config();

const HTTP_PORT = process.env.HTTP_PORT || 3008;

class P2pServer {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.peers = [];
    this.server = express();
    this.server.use(bodyParser.json());
    this.server.post('/addBlock', this.handleAddBlock.bind(this));
    this.server.get('/blocks', this.handleGetBlocks.bind(this));
    this.server.get('/', function(req,res) {
        res.sendFile(__dirname + "/public/main.html")
    })
  }

  start() {
    this.server.listen(HTTP_PORT, () => {
      console.log(`Listening on port ${HTTP_PORT}`);
    });
  }

  handleAddBlock(req, res) {
    const newBlockData = req.body;
    const newBlock = new Block(
      this.blockchain.getLatestBlock().index + 1,
      this.blockchain.getLatestBlock().hash,
      new Date().toISOString(),
      newBlockData,
      ''
    );

    newBlock.hash = newBlock.calculateHash();
    this.blockchain.addBlock(newBlock);
    this.broadcastBlock(newBlock);

    console.log(`New block added: ${JSON.stringify(newBlock)}`);
    // res.send();
    res.json(JSON.stringify(newBlock));
  }

  handleGetBlocks(req, res) {
    res.json(this.blockchain.chain);
    // res.json(this.blockchain.chain + "/"+ this.peers);
  }

  addPeer(peer) {
    this.peers.push(peer);
    this.syncChains();
  }

  syncChains() {
    for (const peer of this.peers) {
      fetch(`${peer}/blocks`)
        .then(response => response.json())
        .then(chain => {
          if (this.blockchain.isValidChain(chain) && chain.length > this.blockchain.chain.length) {
            this.blockchain.replaceChain(chain);
            console.log('Blockchain synchronized');
          }
        })
        .catch(error => console.log(`Error syncing blockchain with peer ${peer}: ${error.message}`));
    }
  }

  broadcastBlock(block) {
    for (const peer of this.peers) {
      fetch(`${peer}/addBlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block.data)
      })
        .then(response => response.json())
        .then(() => console.log(`Block broadcasted to ${peer}`))
        .catch(error => console.log(`Error broadcasting block to peer ${peer}: ${error.message}`));
    }
  }
}

module.exports = P2pServer;
