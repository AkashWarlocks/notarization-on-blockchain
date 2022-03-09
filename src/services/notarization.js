const smartContractFunctionCall = require('../utils/blockchain/function-call');
const User = require('../model/user');
const vaultUtilInstance = require('../utils/vault');
const { createUser, newAccount } = require('../utils/blockchain');
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

notarizationService.verifyHash = async (userId, documentHash) => {
  try {
    /**
     * 1. Get User data for sender as well as user from vault
     * 2. Call smartContract function
     * 3. send response
     */

    //Call vault service
    let userKeyPair = await vaultUtilInstance.getKeyPairFromVault(userId);

    let data = await smartContractFunctionCall(
      'notarization',
      'verify_document',
      [userKeyPair.publicKey, documentHash],
      userKeyPair,
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
