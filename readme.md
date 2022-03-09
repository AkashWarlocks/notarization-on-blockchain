# Notarization Blockchain-NodeJs Application

This is backend application which will store document hashes in smart contract.

> Functions:

1. Store hashes in smart contract.
2. Verify Documents.
3. Get documents details.

## Pre-requisities

List of env setup required:

1. NodeJs
2. Hashicorp vault - It is similar to amazon KMS
3. MongoDB

## Steps

1. To Install NodeJs <https://nodejs.org/en/download/>

2. To Install Hashicorp <https://www.vaultproject.io/docs/install>

   1. After install create config.hcl

      ```

      storage "raft" {
          path = "/Users/akashkulkarni/work/vault/raft/data"
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
