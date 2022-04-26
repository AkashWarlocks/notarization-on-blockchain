let userService = {};
const User = require('../model/user');
const vaultUtilInstance = require('../utils/vault');
const { createUser, newAccount } = require('../utils/blockchain');

userService.createUser = async (email, name) => {
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

module.exports = userService;
