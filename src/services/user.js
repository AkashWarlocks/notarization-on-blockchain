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
const { set, get } = require('../utils/redis');
const smartContractFunctionCall = require('../utils/blockchain/function-call');

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
    const redisData = await get('common-data');
    // console.log({ redisData });

    let parsedData = JSON.parse(redisData);
    let result = {};
    if (parsedData === null) {
      const data = await Document.aggregate([
        {
          $match: { provider: 'polygon' },
        },
        {
          $sort: {
            createdAt: 1,
          },
        },
        {
          $limit: 50,
        },
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
      data.map((d, i) => {
        // console.log(i);
        // console.log(d);
        array.push({ x: d.date, y: d.timeTaken });
      });

      // cost Data
      let filesCountData = [];
      const avgCostData = [];
      const userData = await Document.aggregate([
        {
          $match: { provider: 'polygon' },
        },
        {
          $group: {
            _id: { $week: '$createdAt' },
            txHash: { $addToSet: '$transactionHash' },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ]);

      for (let d of userData) {
        let cost = new BigNumber(0);
        for (let hash of d.txHash) {
          const transactionData = await smartContractFunctionCall(
            null,
            'setData',
            { hash },
            null,
            'data',
            d.provider,
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
        avgCostData.push(parseFloat(avgCost.toString()));
      }

      result.timeTaken = array;
      result.avgCost = avgCostData;
      result.filesCountData = filesCountData;
      await set('common-data', JSON.stringify(result), 86400);
    } else {
      result = parsedData;
    }
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = userService;
