# Notarization Blockchain-NodeJs Application

This is backend application which will store document hashes in smart contract.

## Functions

1. Store hashes in smart contract.
2. Verify Documents.
3. Get documents details.

## Setting up the enviroment

### Pre-requisities

List of env setup required:

1. NodeJs - To setup a backend server

2. Hashicorp vault - It is similar to amazon KMS, we will store user key pairs in this.

3. MongoDB - Database to store

### Installing Dependencies

1. To Install NodeJs <https://nodejs.org/en/download/>

2. To Install Hashicorp <https://www.vaultproject.io/docs/install>

   1. Follow <https://learn.hashicorp.com/tutorials/vault/getting-started-deploy?in=vault/getting-started>
      Use following code for config.hcl

      ```
      storage "raft" {
          path = "/Users/akashkulkarni/work/vault/raft/data" --> // Mention your path
          node_id = "raft_node_1"
      }

      listener "tcp" {
          address     = "[::]:8200"
          tls_disable = 1
      }
      disable_mlock = true
      api_addr = "http://127.0.0.1:8200"
      cluster_addr = "https://127.0.0.1:8201"
      ui = true
      ```

3. Install MongoDb: <https://docs.mongodb.com/manual/installation/>

## Running the Project

1. Clone/unzip the project

2. Inside Code root directory

   ```
   cd notarization-blockchain
   ```

3. Install nodemon globally

   ```
   npm i nodemon
   ```

4. Install other dependencies from package.json

   ```
   npm install
   ```

5. Create .env file and get the content from .env.sample

   ```
   WEB3_PROVIDER=<>
   CONTRACT_ADDRESS=<>
   VAULT_URL=<>
   VAULT_TOKEN=<>
   MATIC_BASE_URL=<>
   MONGODB_URL=<>
   ```

6. Create mongodb database named: 'notarization' using robo3t or command line.

7. Start the project

   ```
   npm run start:dev
   ```

8. Follow given postman for API's
