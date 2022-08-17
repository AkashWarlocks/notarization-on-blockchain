const smartContractFunctionCall = require('../utils/blockchain/function-call');
const User = require('../model/user');
const vaultUtilInstance = require('../utils/vault');
const {
  createUser,
  newAccount,
  calculateCostOfTransaction,
} = require('../utils/blockchain');
const Document = require('../model/documentSchema');

const transaction = require('../utils/blockchain/transaction');
let notarizationService = {};
const BigNumber = require('bignumber.js').BigNumber;
const moment = require('moment');
const { set, deleteKey } = require('../utils/redis');

notarizationService.saveHash = async (userId, documentHash, documentName) => {
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
    );
    console.log('------Data from events after storing hash-----');
    console.log({ data });
    // Add data in database
    // await User.updateOne(
    //   { _id: userId },
    //   {
    //     $push: {
    //       documents: {
    //         timestamp: data.Notarized.timestamp,
    //         signedBy: senderKeyPair.publicKey,
    //         transactionHash: data.transactionHash,
    //       },
    //     },
    //   },
    // );
    const newDoc = new Document({
      userId,
      timestamp: data.Notarized.timestamp,
      signedBy: senderKeyPair.publicKey,
      transactionHash: data.transactionHash,
      timeElapsed: data.timeElapsed,
    });

    await newDoc.save();
    // console.log({ data });

    // Set Redis common-data to empty

    await deleteKey('common-data');
    return {
      uploadSuccess: true,
      transactionHash: data.transactionHash,
      timestamp: data.Notarized.timestamp,
    };
  } catch (error) {
    throw error;
  }
};

notarizationService.verifyHash = async (userId, documentHash) => {
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
      const transactionData = await transaction.readTransactionLogs(
        d.transactionHash,
        'setData',
      );

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
        costOfTransaction: `${costOfTransaction} MATIC `,
        timeTaken: d.timeElapsed,
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

    let user = await User.findOne({ email });
    const vaultData = await vaultUtilInstance.getKeyPairFromVault(user._id);

    return { user, publicKey: vaultData.publicKey };
  } catch (error) {
    throw error;
  }
};

module.exports = notarizationService;
