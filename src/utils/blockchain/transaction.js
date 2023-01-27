const { getWeb3Instance, getCommon, notarizationABI } = require('./index');
const { Transaction } = require('@ethereumjs/tx');
const { CONTRACT_EVENTS } = require('../constants');

const axios = require('../axios');
const { BlockchainError, UserError } = require('../error');
let transaction = {};

// Function to get the number of transaction count of the user: using publicKey
transaction.getTxCount = async (publicKey, web3) => {
  try {
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
    const encodedData = await contractInstance.methods[method](
      ...data,
    ).encodeABI();

    return encodedData;
  } catch (error) {
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
  web3,
  apiInformation,
) => {
  try {
    const estimatedGasLimit = await web3.eth.estimateGas({
      from: userKeypair.publicKey,
      nonce,
      to: contractAddress,
      data: encodedData,
    });

    const price = await web3.eth.getGasPrice();

    let { url, method, data, headers, params, resultKey } = apiInformation;

    const response = await axios(
      url,
      '',
      method,
      headers,
      data,
      params,
      'json',
    );
    return { estimatedGasLimit, gasPrice: response.data[resultKey], price };
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
 * @param {Object} web3
 * @param {string} provider
 * @returns raw : transaction string
 */
transaction.signTransaction = async (
  txCount,
  data,
  userKeypair,
  contractAddress,
  gasLimit,
  estimatedGasPrice,
  web3,
  common,
) => {
  try {
    // console.log({
    //   estimatedGasPrice: web3.utils.hexToNumber(estimatedGasPrice),
    //   limit: gasLimit,
    // });
    // Set Transaction Object
    const txObject = {
      chainId: 97,
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(gasLimit), // Raise the gas limit to a much higher amount
      gasPrice: web3.utils.toHex(estimatedGasPrice),
      // gasPrice: '0x404673b3e',
      to: contractAddress,
      data,
    };

    // // To get details of network used
    // const common = await getCommon(provider);

    // console.log({ common });
    // Initialize Transaction object and freeze the tx object
    let tx = Transaction.fromTxData(txObject, { common });

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

transaction.sendSignedTransaction = async (signedTransaction, web3) => {
  try {
    const transaction = await web3.eth.sendSignedTransaction(signedTransaction);
    // console.log(transaction);
    return transaction;
  } catch (error) {
    console.log('in error');
    let receipt = null;
    console.log({ error });
    if (error.receipt) {
      //console.log('in error');
      receipt = await this.getTransactionReceipt(error.receipt.transactionHash);
    }

    throw new BlockchainError('Cannot send signed transaction', 400, {});
  }
};

transaction.getTransactionReceipt = async (txHash, web3) => {
  try {
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

transaction.readTransactionLogs = async (txHash, method, web3, resultArray) => {
  try {
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    let array = receipt.logs.slice(0, receipt.logs.length - resultArray);
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
        // const web3 = await getWeb3Instance();
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
