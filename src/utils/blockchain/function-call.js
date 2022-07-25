const { CONTRACT_ADDRESS } = require('../../config');
const {
  notarization_contract_instance,
  notarizationABI,
  getContractInstance,
  getWeb3Instance,
} = require('./index');
const {
  getTxCount,
  encodeData,
  signTransaction,
  sendSignedTransaction,
  getTransactionReceipt,
  estimatedGasLimit,
  callFunction,
} = require('./transaction');

const { CONTRACT_EVENTS } = require('../constants');

const smartContractFunctionCall = async (
  contractType,
  method,
  data,
  keypair,
  typeOfCall,
) => {
  try {
    //console.log({ contractType, method, data, keypair, typeOfCall });
    console.log(
      `Pushing transaction in ${contractType} on method ${method} by user ${keypair.publicKey} to the blockchain`,
    );
    const startTime = Date.now();
    const options = {
      from: keypair.publicKey,
    };
    let contract;
    let contractAddress;
    let contractInstances = await getContractInstance();

    // To set contract address and instance depending on the @contractType variable
    switch (contractType) {
      case 'notarization':
        contract = contractInstances.notarization_contract_instance;
        contractAddress = CONTRACT_ADDRESS;
        break;
      default:
        contract = contractInstances.notarization_contract_instance;
        break;
    }
    let result = null;

    if (typeOfCall === 'call') {
      result = await callFunction(contract, method, data, options);
    } else if (typeOfCall === 'send') {
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
      const txCount = await getTxCount(keypair.publicKey);

      const encodedData = await encodeData(contract, method, data);

      // 2. To estimate Gas
      const estimateGasPrice = await estimatedGasLimit(
        keypair,
        txCount,
        encodedData,
        contractAddress,
      );
      console.log({ estimateGasPrice });
      console.log('signing transaction');
      // 3.
      const signedTransaction = await signTransaction(
        `${txCount}`,
        encodedData,
        keypair,
        contractAddress,
        //estimateGasPrice.estimatedGasLimit,
        '819758',
        //`${estimateGasPrice.gasPrice.fastest}`,
        '30.817300933',
      );

      //
      const transaction = await sendSignedTransaction(signedTransaction);
      console.log({ transaction });

      console.log({ logs: transaction.logs });

      // Get Receipt of transaction based on transaction hash
      const receipt = await getTransactionReceipt(transaction.transactionHash);
      console.log({ receipt });
      console.log({ logs: receipt.logs });

      result = { ...result, transactionHash: receipt.transactionHash };
      let array = receipt.logs.slice(0, receipt.logs.length - 1);
      // let array = [receipt.logs[1]];

      /**
       * This logic to read the receipt and get the details related to the events or return data
       * from the smart contract function call.
       */

      console.log({ array });
      const web3 = await getWeb3Instance();

      // let decodedData = await web3.eth.abi.decodeLogs(
      //   [
      //     {
      //       name: 'owner',
      //       type: 'address',
      //     },
      //     {
      //       name: 'hash',
      //       type: 'string',
      //     },
      //     {
      //       name: 'timestamp',
      //       type: 'uint256',
      //     },
      //   ],
      //   '0x0000000000000000000000000000000000000000000000000014d5a406b44c100000000000000000000000000000000000000000000000000d9a75f0b4637ca00000000000000000000000000000000000000000000011faee0b7fb638fa408d0000000000000000000000000000000000000000000000000d85a04cadaf30900000000000000000000000000000000000000000000011faee20555a3fae8c9d',
      //   log.data.topics,
      // );

      // console.log({ decodedData });
      await Promise.all(
        array.map(async (log, i) => {
          let event = functionEvent[i];

          let contract = notarizationABI;
          let abi = contract.filter(
            (c) => c.type === 'event' && c.name === event.eventName,
          );
          console.log({ data: abi[0].inputs });
          console.log({ log });
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
          console.log({ decodedData });
          result = { ...result, [event.eventName]: decodedData };
        }),
      );
    }

    const timeElapsed = (Date.now() - startTime) / 1000;
    console.log('Pushed transaction', { timeElapsed });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = smartContractFunctionCall;
