let userService = {};
const User = require('../model/user');
const Document = require('../model/documentSchema');

const vaultUtilInstance = require('../utils/vault');
const {
  createUser,
  newAccount,
  calculateCostOfTransaction,
} = require('../utils/blockchain');
const transaction = require('../utils/blockchain/transaction');
const BigNumber = require('big-number/big-number');

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

userService.getAllData = async () => {
  try {
    // Time data
    const data = await Document.aggregate([
      {
        $project: {
          _id: 0,
          date: { $subtract: ['$createdAt', new Date(0)] },
          timeTaken: '$timeElapsed',
          // transactionHash: {
          //   $group: {
          //     _id: { $week: '$createdAt' },
          //     txHash: { $addToSet: '$transactionHash' },
          //   },
          // },
        },
      },
    ]);

    const array = [];
    data.map((d) => {
      array.push(Object.values(d));
    });

    // cost Data
    let filesCountData = [];
    const avgCostData = [];
    const userData = await Document.aggregate([
      {
        $group: {
          _id: { $week: '$createdAt' },
          txHash: { $addToSet: '$transactionHash' },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    for (let d of userData) {
      let cost = new BigNumber(0);
      for (let hash of d.txHash) {
        const transactionData = await transaction.readTransactionLogs(
          hash,
          'setData',
        );
        let costOfTransaction = await calculateCostOfTransaction(
          transactionData.effectiveGasPrice,
          transactionData.gasUsed,
        );

        cost = costOfTransaction.plus(cost);
      }
      // console.log(cost.toString());
      const avgCost = cost.div(new BigNumber(d.txHash.length));
      filesCountData.push(d.txHash.length);
      avgCostData.push(avgCost);
    }

    let result = {};
    result.timeTaken = array;
    result.avgCost = avgCostData;
    result.filesCountData = filesCountData;
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = userService;
