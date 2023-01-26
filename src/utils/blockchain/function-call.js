const { notarizationABI, getWeb3Instance } = require('./index');
const {
  getTxCount,
  encodeData,
  signTransaction,
  sendSignedTransaction,
  getTransactionReceipt,
  estimatedGasLimit,
  callFunction,
  readTransactionLogs,
} = require('./transaction');

const { CONTRACT_EVENTS, WEB3_PROVIDERS } = require('../constants');

const smartContractFunctionCall = async (
  contractType,
  method,
  data,
  keypair,
  typeOfCall,
  provider,
) => {
  try {
    console.log({ provider });
    //console.log({ contractType, method, data, keypair, typeOfCall });

    const startTime = Date.now();
    const options = {
      from: keypair.publicKey,
    };
    let contract;
    let contractAddress;
    let providerInformation = WEB3_PROVIDERS[provider];
    let web3Instace = await getWeb3Instance(provider);

    let web3 = web3Instace.web3;
    let contractInstances = web3Instace.contractInstance;
    let common = web3Instace.common;

    // To set contract address and instance depending on the @contractType variable
    switch (contractType) {
      case 'notarization':
        contract = contractInstances;
        contractAddress = providerInformation.contract.notarization;
        break;
      default:
        contract = providerInformation.contract.notarization_contract_instance;
        break;
    }
    let result = null;

    if (typeOfCall === 'call') {
      result = await callFunction(contract, method, data, options);
    } else if (typeOfCall === 'send') {
      console.log(
        `Pushing transaction in ${contractType} on method ${method} by user ${keypair.publicKey} to the blockchain`,
      );
      const functionEvent = CONTRACT_EVENTS[method];

      /**
       * Steps to sign a transaction on blockchain and then getting the event details.
       * 1. Get tranaction count of a user from blockchain.
       * 2. Encode the smart function call and data.
       * 3. get Estimated gas limit and gas price from polygon api and web3.
       * 4. Sign the transaction by sender's private key using Ethereum-Tx Library.
       * 5. Broadcast transaction on blockchain
       * 6. Get the transaction receipt (contains return values and event's data) using transaction hash.
       * 7. Parse the receipt and get event data to return.
       */

      // 1. To get User transaction counts
      const txCount = await getTxCount(keypair.publicKey, web3);

      // 2. Encode Data
      const encodedData = await encodeData(contract, method, data, web3);

      // 3. To estimate Gas
      const estimateGasPrice = await estimatedGasLimit(
        keypair,
        txCount,
        encodedData,
        contractAddress,
        web3,
        providerInformation.ethGasPriceAPI,
      );

      console.log('Signing transaction');

      //4. Sign Transaction
      const signedTransaction = await signTransaction(
        `${txCount}`,
        encodedData,
        keypair,
        contractAddress,
        estimateGasPrice.estimatedGasLimit,
        // 395501,
        estimateGasPrice.gasPrice,
        web3,
        common,
      );

      console.log('Sending Transaction');
      // 5. Send Transaction
      const transaction = await sendSignedTransaction(signedTransaction, web3);
      //  console.log({ transaction });
      // 6. Get Receipt of transaction based on transaction hash
      const receipt = await getTransactionReceipt(
        transaction.transactionHash,
        web3,
      );

      result = { ...result, transactionHash: receipt.transactionHash };
      // console.log(receipt.logs);
      // console.log(providerInformation.resultArray);
      let array = receipt.logs.slice(
        0,
        receipt.logs.length - providerInformation.resultArray,
      );
      // console.log({ array });
      /**
       * This logic to read the receipt and get the details related to the events or return data
       * from the smart contract function call.
       */

      await Promise.all(
        array.map(async (log, i) => {
          let event = functionEvent[i];

          let contract = notarizationABI;
          let abi = contract.filter(
            (c) => c.type === 'event' && c.name === event.eventName,
          );
          // console.log({ abi });
          let topics = log.topics.slice(1);
          // console.log({ topics });
          let decodedData = await web3.eth.abi.decodeLog(
            abi[0].inputs,
            log.data,
            topics,
          );

          result = { ...result, [event.eventName]: decodedData };
        }),
      );
    }
    // To Read Data from transaction Logs
    else if (typeOfCall === 'data') {
      const transactionData = await readTransactionLogs(
        data.hash,
        'setData',
        web3,
      );
    }

    const timeElapsed = (Date.now() - startTime) / 1000;
    console.log('Pushed transaction', { timeElapsed });
    result.timeElapsed = timeElapsed;
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = smartContractFunctionCall;
