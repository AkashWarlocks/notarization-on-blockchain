const smartContractFunctionCall = require('../utils/blockchain/function-call');
const User = require('../model/user');
const vaultUtilInstance = require('../utils/vault');
let notarizationService = {};

notarizationService.saveHash = async (senderId, userId, documentHash) => {
  try {
    /**
     * 1. Get User data for sender as well as user from vault
     * 2. Call smartContract function
     * 3. Save tranaction hash and other details in db
     */

    //Call vault service
    //console.log({ senderId, userId, documentHash });
    let senderKeyPair = await vaultUtilInstance.getKeyPairFromVault(senderId);
    let userKeyPair = await vaultUtilInstance.getKeyPairFromVault(userId);

    let data = await smartContractFunctionCall(
      'notarization',
      'setData',
      [documentHash, userKeyPair.publicKey],
      senderKeyPair,
      'send',
    );
    console.log({ data });
    // Add data in database
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          documents: {
            timestamp: data.Notarized.timestamp,
            signedBy: senderId,
            transactionHash: data.transactionHash,
          },
        },
      },
    );

    // console.log({ data });
    return {
      transactionHash: data.transactionHash,
      timestamp: data.Notarized.timestamp,
    };
  } catch (error) {
    throw error;
  }
};

notarizationService.verifyHash = async (senderId, userId, documentHash) => {
  try {
    /**
     * 1. Get User data for sender as well as user from vault
     * 2. Call smartContract function
     * 3. send response
     */

    //Call vault service

    let senderKeyPair = await vaultUtilInstance.getKeyPairFromVault(senderId);
    let userKeyPair = await vaultUtilInstance.getKeyPairFromVault(userId);

    let data = await smartContractFunctionCall(
      'notarization',
      'verify_document',
      [userKeyPair.publicKey, documentHash],
      senderKeyPair,
      'call',
    );

    console.log({ data });
    return data;
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

    let signerKeyPair = await vaultUtilInstance.getKeyPairFromVault(signerId);
    let userKeyPair = await vaultUtilInstance.getKeyPairFromVault(userId);

    let data = await smartContractFunctionCall(
      'notarization',
      'getData',
      [timestamp, userKeyPair.publicKey, signerKeyPair.publicKey],
      signerKeyPair,
      'call',
    );
    return data;
  } catch (error) {
    throw error;
  }
};

module.exports = notarizationService;
