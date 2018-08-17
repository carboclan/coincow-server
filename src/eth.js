const Web3Wallet = require('web3-wallet');
const loadContracts = require('../coincow-contracts/utils/contracts');

const privateKey = process.env.PRI;
const url = process.env.URL || 'http://parity.coincow.farm:8545';

const web3 = Web3Wallet.create(
  privateKey && Web3Wallet.wallet.fromPrivateKey(privateKey),
  url
);

module.exports = {
  web3,
  contracts: loadContracts(web3).contracts
};