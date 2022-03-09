const WEB3_PROVIDER = process.env.WEB3_PROVIDER;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const HASHICORP_VAULT_OPTIONS = {
  apiVersion: 'v1', // default
  endpoint: process.env.VAULT_URL, // default
  token: process.env.VAULT_TOKEN, // optional client token; can be fetched after valid initialization of the serve
};

const MATIC_BASE_URL = process.env.MATIC_BASE_URL;

const MONGODB_URL = process.env.MONGODB_URL;
module.exports = {
  WEB3_PROVIDER,
  CONTRACT_ADDRESS,
  HASHICORP_VAULT_OPTIONS,
  MATIC_BASE_URL,
  MONGODB_URL,
};
