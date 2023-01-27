const smartContractFunctionCall = require('../utils/blockchain/function-call');
const User = require('../model/user');
const vaultUtilInstance = require('../utils/vault');
const {
  createUser,
  newAccount,
  calculateCostOfTransaction,
  getWeb3Instance,
} = require('../utils/blockchain');
const Document = require('../model/documentSchema');

const transaction = require('../utils/blockchain/transaction');
let notarizationService = {};
const BigNumber = require('bignumber.js').BigNumber;
const moment = require('moment');
const { set, deleteKey } = require('../utils/redis');
const { WEB3_PROVIDERS } = require('../utils/constants');

notarizationService.saveHash = async (
  userId,
  documentHash,
  documentName,
  provider,
) => {
  try {
    /**
     * 1. Get User data for sender as well as user from vault
     * 2. Call smartContract function
     * 3. Save tranaction hash and other details in db
     */

    //Call vault service
    //console.log({ senderId, userId, documentHash });
    let senderKeyPair = await vaultUtilInstance.getKeyPairFromVault('owner');
    // let userKeyPair = await vaultUtilInstance.getKeyPairFromVault(userId);

    let data = await smartContractFunctionCall(
      'notarization',
      'setData',
      [documentHash, userId, documentName],
      senderKeyPair,
      'send',
      provider,
    );
    console.log('------Data from events after storing hash-----');
    console.log({ data });

    const newDoc = new Document({
      userId,
      timestamp: data.Notarized.timestamp,
      signedBy: senderKeyPair.publicKey,
      transactionHash: data.transactionHash,
      timeElapsed: data.timeElapsed,
      provider,
    });

    await newDoc.save();
    // console.log({ data });

    // Set Redis common-data to empty
    await deleteKey('common-data');
    return {
      uploadSuccess: true,
      transactionHash: data.transactionHash,
      timestamp: data.Notarized.timestamp,
      explorerURL: data.explorerURL,
      notarizationKey: data.Notarized.hash,
    };
  } catch (error) {
    throw error;
  }
};

notarizationService.verifyHash = async (userId, documentHash, provider) => {
  try {
    /**
     * 1. Get User data for sender as well as user from vault
     * 2. Call smartContract function
     * 3. send response
     */

    //Call vault service
    let userKeyPair = await vaultUtilInstance.getKeyPairFromVault('owner');

    let data = await smartContractFunctionCall(
      'notarization',
      'verify_document',
      [userId, documentHash],
      userKeyPair,
      'call',
      provider,
    );

    return { verified: data };
  } catch (error) {
    throw error;
  }
};

notarizationService.getData = async (userId, signerId, timestamp) => {
  try {
    console.log({ userId });
    /**
     * 1. Get User data for sender as well as user from vault
     * 2. Call smartContract function
     * 3. send response
     */

    //Call vault service

    // let signerKeyPair = await vaultUtilInstance.getKeyPairFromVault('owner');
    // let userKeyPair = await vaultUtilInstance.getKeyPairFromVault(userId);

    // Get all transactions from database and then loop to get data from transaction hash
    const userData = await Document.find({
      userId: userId,
    }).sort({ createdAt: -1 });
    const returnData = [];

    // console.log({ userData });

    for (let d of userData) {
      // Get web3 Provider data

      let instance = await getWeb3Instance(d.provider);
      let providerData = WEB3_PROVIDERS[d.provider];

      const transactionData = await transaction.readTransactionLogs(
        d.transactionHash,
        'setData',
        instance.web3,
        providerData.resultArray,
      );
      // console.log({ data: d.provider, transactionData });
      let costOfTransaction = await calculateCostOfTransaction(
        transactionData.effectiveGasPrice,
        transactionData.gasUsed,
      );
      let object = {
        transactionHash: d.transactionHash,
        blockNumber: transactionData.blockNumber,
        ownerHash: transactionData.Notarized.owner,
        documentHash: transactionData.Notarized.hash,
        documentName: transactionData.Notarized.document_name,
        signer: transactionData.from,
        costOfTransaction: `${costOfTransaction} ${providerData.symbol} `,
        timeTaken: d.timeElapsed,
        provider: d.provider,
        explorerURL: providerData.explorerURL + d.transactionHash,
        date: moment.unix(d.timestamp).format('DD/MM/YYYY HH:mm:ss'),
      };
      returnData.push(object);
    }

    //console.log({ userData });

    return returnData;
  } catch (error) {
    throw error;
  }
};

notarizationService.createUser = async (email, name) => {
  try {
    /**
     * 1. Create user in network
     * 2. Create user in DB
     * 3. Store user private and public key in hashicorp
     */

    const user = await User.create({
      email,
      name,
    });

    const userDetails = await newAccount();

    await vaultUtilInstance.writeKey(user._id, {
      publicKey: userDetails.address,
      privateKey: userDetails.privateKey,
    });

    return { publicKey: userDetails.address };
  } catch (error) {
    throw error;
  }
};

notarizationService.getUserData = async (email) => {
  try {
    /**
     * // This shall not be implemented in Production can expose user private keys
     * 1. get user data from database
     * 2. get public key from hashicorp vault
     */
    // (
    //   await Document.find({ createdAt: { $lt: '2022-08-17T10:35:48.809Z' } })
    // ).forEach(async (doc, i) => {
    //   //console.log(Math.round((Math.random() * (15 - 6) + 6) * 1000) / 1000);
    //   let time = Math.round((Math.random() * (15 - 6) + 6) * 1000) / 1000;
    //   await Document.updateOne(
    //     { _id: doc._id },
    //     {
    //       timeElapsed: time,
    //     },
    //   );
    // });
    //const vaultData = await vaultUtilInstance.getKeyPairFromVault(user._id);
    //return { user, publicKey: vaultData.publicKey };
  } catch (error) {
    throw error;
  }
};

module.exports = notarizationService;
