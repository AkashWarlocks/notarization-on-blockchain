const smartContractFunctionCall = require('../utils/blockchain/function-call');
const User = require('../model/user');
const vaultUtilInstance = require('../utils/vault');
const { createUser, newAccount } = require('../utils/blockchain');
const Document = require('../model/documentSchema');

const transaction = require('../utils/blockchain/transaction');
let notarizationService = {};
const BigNumber = require('bignumber.js').BigNumber;
const moment = require('moment');

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
    });

    await newDoc.save();
    // console.log({ data });
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

    await Promise.all(
      userData.map(async (d) => {
        const transactionData = await transaction.readTransactionLogs(
          d.transactionHash,
          'setData',
        );

        //console.log({ transactionData });
        const a = new BigNumber(transactionData.effectiveGasPrice);
        const b = new BigNumber(transactionData.gasUsed);
        const c = new BigNumber(10e18);
        console.log(`${a.multipliedBy(b)}`);
        //console.log(`${a.mult(b)}`);

        let costOfTransaction = a.multipliedBy(b).dividedBy(c);
        let object = {
          transactionHash: d.transactionHash,
          blockNumber: transactionData.blockNumber,
          ownerHash: transactionData.Notarized.owner,
          documentHash: transactionData.Notarized.hash,
          documentName: transactionData.Notarized.document_name,
          signer: transactionData.from,
          costOfTransaction: `${costOfTransaction} MATIC `,
          date: moment.unix(d.timestamp).format('DD/MM/YYYY HH:mm:ss'),
        };
        returnData.push(object);
      }),
    );

    //console.log({ userData });

    // let data = await smartContractFunctionCall(
    //   'notarization',
    //   'getData',
    //   [timestamp, userKeyPair.publicKey, signerKeyPair.publicKey],
    //   signerKeyPair,
    //   'call',
    // );
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
