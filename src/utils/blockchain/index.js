const Web3 = require('web3');
const _Common = require('@ethereumjs/common');
let s = _Common;
const { Chain, CustomChain, Common } = require('@ethereumjs/common');
const config = require('../../config');
const BigNumber = require('bignumber.js').BigNumber;
const { set, get } = require('../redis');

// let web3 = null;

let web3Data = {
  polygon: {
    web3: null,
    contractInstance: null,
    common: null,
  },
  binance: {
    web3: null,
    contractInstance: null,
    common: null,
  },
  ethereum: {
    web3: null,
    contractInstance: null,
    common: null,
  },
};

let common = null;
let notarization_contract_instance = null;
const notarizationABI = require('./contracts/notarization_ABI.json');
const { WEB3_PROVIDERS } = require('../constants');
const { BlockchainError } = require('../error');

const initializeWeb3 = async (provider) => {
  try {
    console.log(provider.name);
    // Initialize web3 instance using INFURA URL
    // Basically connect to blockchain we want using web3 sdk
    const web3Provider = new Web3.providers.HttpProvider(provider.web3);
    let web3 = new Web3(web3Provider);

    let block = await web3.eth.getBlockNumber();
    console.log({ [provider.name]: block });

    web3.eth.handleRevert = true;

    let contractInstance = await initializeContract(
      web3,
      provider.contract.notarization,
    );

    return { web3, contractInstance };
  } catch (error) {
    throw error;
  }
};

const getWeb3Instance = async (provider) => {
  try {
    const instance = web3Data[provider];
    return instance;
  } catch (error) {
    throw error;
  }
};

const getCommon = async (provider) => {
  try {
    let common = null;

    switch (provider) {
      case 'polygon':
        common = Common.custom(CustomChain.PolygonMumbai, { baseChain: 5 });
        break;
      case 'ethereum':
        common = new Common({
          chain: Chain.Goerli,
        });
        break;
      case 'binance':
        common = Common.custom({ chainId: 97 }, { hardfork: 'istanbul' });
        break;
    }

    return common;
  } catch (error) {
    throw new BlockchainError('Cannot get Chain', 400, { error });
  }
};

// Function to initialize smart contracts
// Take ABI from the file and address of contract when deployed -> pass to the sdk function.
const initializeContract = async (web3Provider, contractAddress) => {
  try {
    let contract_instance = new web3Provider.eth.Contract(
      notarizationABI,
      contractAddress,
    );

    return contract_instance;
  } catch (error) {
    throw error;
  }
};

const initializeCommon = async (provider) => {
  try {
    let common = null;

    switch (provider) {
      case 'polygon':
        common = Common.custom(CustomChain.PolygonMumbai, { baseChain: 5 });
        break;
      case 'ethereum':
        common = new Common({
          chain: Chain.Goerli,
        });
        break;
      case 'binance':
        common = Common.custom({ chainId: 97 }, { hardfork: 'istanbul' });
        break;
    }

    return common;
  } catch (error) {
    throw error;
  }
};

const getContractInstance = async (provider) => {
  try {
    let contractInstance = web3Data[provider].contractInstance;
    return contractInstance;
  } catch (error) {
    throw error;
  }
};

const connectBlockchains = async () => {
  try {
    let providers = WEB3_PROVIDERS;
    // Connect to different blockchains parallely
    [web3Data.polygon, web3Data.ethereum, web3Data.binance] = await Promise.all(
      [
        initializeWeb3(providers.polygon),
        initializeWeb3(providers.ethereum),
        initializeWeb3(providers.binance),
      ],
    );

    // set common for different blockchains parallely
    [
      web3Data.polygon.common,
      web3Data.ethereum.common,
      web3Data.binance.common,
    ] = await Promise.all([
      initializeCommon('polygon'),
      initializeCommon('ethereum'),
      initializeCommon('binance'),
    ]);
  } catch (error) {
    throw error;
  }
};

const newAccount = async () => {
  try {
    const newUser = await web3.eth.accounts.create();

    await web3.eth.accounts.wallet.add({
      privateKey: newUser.privateKey,
      address: newUser.address,
    });

    return newUser;
  } catch (error) {
    throw error;
  }
};

const calculateCostOfTransaction = async (effectiveGasPrice, gasUsed) => {
  try {
    const a = new BigNumber(effectiveGasPrice);
    const b = new BigNumber(gasUsed);
    const c = new BigNumber(1e18);

    let costOfTransaction = a.multipliedBy(b).dividedBy(c);

    return costOfTransaction;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  initializeWeb3,
  getWeb3Instance,
  getContractInstance,
  getCommon,
  newAccount,
  calculateCostOfTransaction,
  connectBlockchains,
  common,
  notarization_contract_instance,
  notarizationABI,
};
