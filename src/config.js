const WEB3_PROVIDER = process.env.WEB3_PROVIDER;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const HASHICORP_VAULT_OPTIONS = {
  apiVersion: 'v1', // default
  endpoint: process.env.VAULT_URL, // default
  token: process.env.VAULT_TOKEN, // optional client token; can be fetched after valid initialization of the serve
};

const MATIC_BASE_URL = process.env.MATIC_BASE_URL;

const MONGODB_URL = process.env.MONGODB_URL;

const AWS_CLOUDWATCH_CONFIG = {
  LOG_GROUP_NAME: process.env.LOG_GROUP_NAME,
  LOG_GROUP_STREAM: process.env.LOG_GROUP_STREAM,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  REGION: process.env.REGION,
};

const LOGGING_SERVICE = process.env.LOGGING_SERVICE;
module.exports = {
  WEB3_PROVIDER,
  CONTRACT_ADDRESS,
  HASHICORP_VAULT_OPTIONS,
  MATIC_BASE_URL,
  MONGODB_URL,
  AWS_CLOUDWATCH_CONFIG,
  LOGGING_SERVICE,
};
