const { getWeb3Instance, getCommon, notarizationABI } = require('./index');
const EthereumTx = require('@ethereumjs/tx').Transaction;
const Common = require('@ethereumjs/common').default;
const { MATIC_BASE_URL, CONTRACT_ADDRESS } = require('../../config');
const { CONTRACT_EVENTS } = require('../constants');

const axios = require('../axios');
const { BlockchainError, UserError } = require('../error');
let transaction = {};

// Function to get the number of transaction count of the user: using publicKey
transaction.getTxCount = async (publicKey) => {
  try {
    const web3 = await getWeb3Instance();
    // console.log({ web3 });
    const txCount = await web3.eth.getTransactionCount(publicKey);
    return txCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Funtion: Returns: hex string is 32-bit function signature hash plus the
 * passed parameters in Solidity tightly packed format
 * @param {Object} contractInstance
 * @param {String} method
 * @param {Array} data
 * @returns
 */
transaction.encodeData = async (contractInstance, method, data) => {
  try {
    console.log({ method, data });
    const web3 = await getWeb3Instance();
    const encodedData = await contractInstance.methods[method](
      ...data,
    ).encodeABI();

    return encodedData;
  } catch (error) {
    console.log('in encode error');
    throw error;
  }
};

/**
 * Function to predict gas limit and gas price.
 * @param {Object} userKeypair
 * @param {String} nonce
 * @param {Hex} encodedData
 * @param {String} contractAddress
 * @returns
 */
transaction.estimatedGasLimit = async (
  userKeypair,
  nonce,
  encodedData,
  contractAddress,
) => {
  const web3 = await getWeb3Instance();

  try {
    const estimatedGasLimit = await web3.eth.estimateGas({
      from: userKeypair.publicKey,
      nonce,
      to: contractAddress,
      data: encodedData,
    });

    //const gasPrice = await this.getGasPrice();
    const response = await axios(MATIC_BASE_URL, '', 'GET', {}, {}, {}, 'json');
    return { estimatedGasLimit, gasPrice: response.data };
  } catch (error) {
    let code = error.message.replace(
      'Returned error: execution reverted: ',
      '',
    );
    error.code = code;
    throw new BlockchainError(error.message, 200, code);
  }
};

/**
 *
 * @param {string} txCount
 * @param {string} data
 * @param {object} userKeypair
 * @param {string} contractAddress
 * @param {string} gasLimit
 * @param {string} estimatedGasPrice
 * @returns raw : transaction string
 */
transaction.signTransaction = async (
  txCount,
  data,
  userKeypair,
  contractAddress,
  gasLimit,
  estimatedGasPrice,
) => {
  try {
    const web3 = await getWeb3Instance();

    console.log({
      gasLimit,
      estimatedGasPrice: web3.utils.toWei(estimatedGasPrice, 'gwei'),
    });

    const txObject = {
      chainId: 80001,
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(gasLimit), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(web3.utils.toWei(estimatedGasPrice, 'gwei')),
      to: contractAddress,
      data,
    };

    // To get details of network used
    const common = await getCommon();

    // console.log({ common });
    // Initialize Transaction object and freeze the tx object
    let tx = new EthereumTx(txObject, { common });

    const privateKey = userKeypair.privateKey.substr(2);

    // Convert string to hex : privateKey
    const pvtBuffer = Buffer.from(privateKey, 'hex');

    // Sign the transaction using the hex of private key
    tx = tx.sign(pvtBuffer);

    /**
     * Returns the serialized encoding of the legacy transaction.
     * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
     * */

    const serializedTx = tx.serialize();

    const raw = '0x' + serializedTx.toString('hex');

    return raw;
  } catch (error) {
    throw error;
  }
};

/**
 * Function to broadcast signed transaction on the chain
 * @param {Object} signedTransaction
 * @returns {Object} transaction: Transaction object details.
 */

transaction.sendSignedTransaction = async (signedTransaction) => {
  try {
    const web3 = await getWeb3Instance();

    const transaction = await web3.eth.sendSignedTransaction(signedTransaction);
    return transaction;
  } catch (error) {
    console.log('in error');
    let receipt = null;
    console.log({ error });
    if (error.receipt) {
      //console.log('in error');
      receipt = await this.getTransactionReceipt(error.receipt.transactionHash);
    }

    throw error;
  }
};

transaction.getTransactionReceipt = async (txHash) => {
  try {
    const web3 = await getWeb3Instance();

    const receipt = await web3.eth.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {}
};

/**
 * To call Particular type of method
 *
 * @param {Object} contractInstance - Instance of Contract
 * @param {String} method - Method of contract to be called
 * @param {Aray} data - Data needed to send to contract
 * @param {Object} options
 */
transaction.callFunction = async (contractInstance, method, data, options) => {
  try {
    const response = await contractInstance.methods[method](...data).call(
      options,
    );

    return response;
  } catch (error) {
    let code = error.message.replace(
      'Your request got reverted with the following reason string: ',
      '',
    );
    error.code = code;
    throw new BlockchainError(error.message, 400, code);
  }
};

transaction.readTransactionLogs = async (txHash, method) => {
  try {
    const web3 = await getWeb3Instance();

    const receipt = await web3.eth.getTransactionReceipt(txHash);

    let array = receipt.logs.slice(0, receipt.logs.length - 1);
    // console.log({ array });
    const functionEvent = CONTRACT_EVENTS[method];
    // console.log({ functionEvent });
    let result = null;
    await Promise.all(
      array.map(async (log, i) => {
        let event = functionEvent[i];

        let contract = notarizationABI;
        let abi = contract.filter(
          (c) => c.type === 'event' && c.name === event.eventName,
        );
        // console.log({ data: abi[0].inputs });
        // console.log({ log });
        const web3 = await getWeb3Instance();
        let topics = log.topics.slice(1);
        let decodedData = await web3.eth.abi.decodeLog(
          abi[0].inputs,
          log.data,
          topics,
        );

        // let decodedData = await web3.eth.abi.decodeParameters(
        //   abi[0].inputs,
        //   '0x000000000000000000000000000000000000000000000000000e760fd23801da0000000000000000000000000000000000000000000000000c9f3e2a2a76b36c000000000000000000000000000000000000000000001327ab45731bd33f174d0000000000000000000000000000000000000000000000000c90c81a583eb192000000000000000000000000000000000000000000001327ab53e92ba5771927',
        // );
        // console.log({ decodedData });
        result = { ...receipt, [event.eventName]: decodedData };
      }),
    );

    return result;
  } catch (error) {
    console.log(error);
    throw new UserError('Not able to read logs', 400, 'A1');
  }
};

module.exports = transaction;
