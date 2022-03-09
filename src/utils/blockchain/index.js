const Web3 = require('web3');
const Common = require('@ethereumjs/common').default;
const { Chain, CustomChain, Hardfork } = require('@ethereumjs/common');
const config = require('../../config');
let web3 = null;
let common = null;
let notarization_contract_instance = null;
const notarizationABI = require('./contracts/notarization_ABI.json');
const notarizationContractAddress = config.CONTRACT_ADDRESS;

const initializeWeb3 = async () => {
  try {
    // Initialize web3 instance using INFURA URL
    // Basically connect to blockchain we want using web3 sdk
    const web3Provider = new Web3.providers.HttpProvider(config.WEB3_PROVIDER);
    web3 = new Web3(web3Provider);
    //console.log({ web3 });

    let block = await web3.eth.getBlockNumber();
    console.log({ block });

    // Creates a object for a custom chain, based on a standard one.
    common = Common.custom(CustomChain.PolygonMumbai, {
      baseChain: 5,
    });

    //common = Common.custom(Chain.Ropsten, { hardfork: Hardfork.Petersburg });
    await initializeContract();
  } catch (error) {
    throw error;
  }
};

const getWeb3Instance = async () => {
  try {
    return web3;
  } catch (error) {
    throw error;
  }
};

const getCommon = async () => {
  try {
    return common;
  } catch (error) {
    throw error;
  }
};

// Function to initialize smart contracts
// Take ABI from the file and address of contract when deployed -> pass to the sdk function.
const initializeContract = async () => {
  try {
    notarization_contract_instance = new web3.eth.Contract(
      notarizationABI,
      notarizationContractAddress,
    );
    // console.log({ notarization_contract_instance });
  } catch (error) {
    throw error;
  }
};

const getContractInstance = async () => {
  try {
    return {
      notarization_contract_instance,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  initializeWeb3,
  getWeb3Instance,
  getContractInstance,
  getCommon,
  web3,
  common,
  notarization_contract_instance,
  notarizationABI,
};
