const { Blockchain, Transaction } = require("./blockchain.js");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const myKey = ec.keyFromPrivate(
  "7ece54aaf2cb68d23dbc7f62961b4e76212560290a1cdefbf25f323c880a2c04"
);
const myWalletAddress = myKey.getPublic("hex");

let Rcoin = new Blockchain();

console.log("Mining block 1...");
Rcoin.minePendingTransactions(myWalletAddress);

console.log("Your balance is: " + Rcoin.getBalanceOfAddress(myWalletAddress));

console.log("Mining block 2...");
Rcoin.minePendingTransactions(myWalletAddress);

console.log("Your balance is: " + Rcoin.getBalanceOfAddress(myWalletAddress));

const tx1 = new Transaction(myWalletAddress, "jeff", 10);
tx1.signTransaction(myKey);
Rcoin.addTransaction(tx1);

console.log("Mining block 3...");
Rcoin.minePendingTransactions(myWalletAddress);

console.log("Your balance is: " + Rcoin.getBalanceOfAddress(myWalletAddress));

console.log(JSON.stringify(Rcoin.chain, null, 4));
