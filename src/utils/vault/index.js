const nodeVault = require('node-vault');
const config = require('../../config');
const vaultOptions = config.HASHICORP_VAULT_OPTIONS;

class VaultUtil {
  constructor() {
    // Import the hashicorp vault client and instantiate it:
    this.vault = nodeVault(vaultOptions);
  }

  /**
   * @param {string} userId
   * @returns {object} {secretKey,publicKey}
   */
  async getKeyPairFromVault(userId) {
    try {
      // Check if bypass blockchain is true

      const accessResponse = await this.vault.read(`notarization/${userId}`);
      //console.log({ accessResponse });
      const privateKey = accessResponse.data.value;
      const publicKey = accessResponse.data.key;

      const keyPair = {
        privateKey,
        publicKey,
      };

      return keyPair;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @param {string} userId
   * @param {object} keypair {secretKey,publicKey}
   * @returns {void}
   */
  async writeKey(userId, keypair) {
    try {
      await this.vault.write(`notarization/${userId}`, {
        key: keypair.publicKey,
        value: keypair.privateKey,
      });
    } catch (error) {
      throw error;
    }
  }
}

const vaultUtilInstance = new VaultUtil();
Object.freeze(vaultUtilInstance);
module.exports = vaultUtilInstance;
