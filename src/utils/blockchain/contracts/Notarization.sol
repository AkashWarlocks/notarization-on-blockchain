// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Notarization {

    // Struct for single doc/data to be stored
    struct USER_NOTARY {
        string user_data;
        bytes32 user_data_hash;
        uint256 timestamp;
        address notarized_by;
    }

    event Notarized(address indexed_to, string hash, uint256 timestamp);

    mapping (address => USER_NOTARY[]) private notary_data;
    // 1 =>[ { abc, abcakjscadjkada, 1232324, 1}, {pqr, asfsdfsfdfsdf, 234234, 2} ]
    constructor(){

    }
    /**
        To check if user data exists
     */
    modifier user_exists(address user) {
        require(notary_data[user].length != 0, "User Doesnot exists");
        _;
    }

    /**
        To store the hash of the data/document
        1. Hash the doc/data
        2. Add it to the user Map create (notary_data)
    */

    function setData(string memory document, address user) public  {
       // Create a hash of document 
       bytes32 hash = createDocHash(document); 

       // Add to the mapping
       notary_data[user].push(USER_NOTARY(document, hash, block.timestamp, tx.origin));
       // emit event
       emit Notarized(msg.sender, document, block.timestamp);
    }

    /**
    To Verify the document stored
    1. input - user address and its document.
    2. Get hash using find_hash function.
    3. If found == true : doument is found, hence belongs to user and verified.
    */
    function verify_document(address user, string memory document) public view returns(bool verified) {
        // Create hash of a document
       bytes32 hash = createDocHash(document);

        // Compare the hash
        (USER_NOTARY memory data, bool found) = find_hash(notary_data[user], hash);
        verified = found; 
    }

    /**
    1. Use keccak256 to hash the data
    use abi.encodePacked(arg) : convert string into bytes64
     */
    function createDocHash(string memory data) private pure returns(bytes32 hashed_data) {
        hashed_data = keccak256(abi.encodePacked(data));
    }

    function find_hash(USER_NOTARY[] memory hash_array, bytes32 hashed_data) private pure returns(USER_NOTARY memory user_data, bool found){
        found = false;
        for(uint i =0; i<hash_array.length;i++){
            if(hash_array[i].user_data_hash == hashed_data){
                user_data = hash_array[i];
                found = true;
            }
        }
    }

    /**
     Function to get data related to user and timestamp when stored
    */
    function getData(uint256 timestamp, address user, address notarized_by) public view user_exists(user) returns (string memory user_data) {
        USER_NOTARY[] memory hash_array = notary_data[user];

        if(hash_array.length == 0) {
            revert ('User does not exists'); 
        }

        for(uint i =0; i<hash_array.length;i++){
            if(hash_array[i].timestamp == timestamp && hash_array[i].notarized_by == notarized_by){
                user_data = hash_array[i].user_data;
            }
        }
    }

}