const { time } = require("console");
const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  calculateHash() {
    return SHA256(
      this.fromAddress,
      this.toAddress,
      this.amount,
      this.timestamp
    ).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions from other wallets!");
    }

    const hashTransaction = this.calculateHash();
    const sig = signingKey.sign(hashTransaction, "base64");
    this.signature = sig.toDER("hex");
  }

  isValid() {
    if (this.fromAddress === null) return true;
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }
    if (!this.timestamp || this.timestamp.length === 0) {
      throw new Error("Invalid timestamp");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  constructor(timestamp, transactions, previousHash) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.timestamp +
        this.transactions +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: " + this.hash);
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) return false;
    }

    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 20;
  }

  createGenesisBlock() {
    return new Block("08/03/2021", "Genesis block", "0x00");
  }

  getLatestBlock() {
    const chain = this.chain;
    return chain[chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined!");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  addTransaction(transaction) {
    if (
      !transaction.fromAddress ||
      !transaction.toAddress ||
      !transaction.amount ||
      transaction.amount <= 0
    ) {
      throw new Error("Incorrect transaction data");
    } else if (!transaction.isValid()) {
      throw new Error("Invalid transaction");
    } else if (
      transaction.amount > this.getBalanceOfAddress(transaction.fromAddress)
    ) {
      throw new Error("Invalid amount");
    } else {
      this.pendingTransactions.push(transaction);
    }
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        } else if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) return false;
      if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      if (!currentBlock.hasValidTransactions()) return false;
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
