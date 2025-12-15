// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DIDRegistry {

    struct DID {
        string documentCID;
        bool exists;
    }

    mapping(address => DID) private dids;
    event DIDRegistered(address indexed owner, string documentCID);
    event DIDUpdated(address indexed owner, string documentCID);

    modifier onlyDIDOwner() {
        require(dids[msg.sender].exists, "DID not registered");
        _;
    }

    function registerDID(string calldata documentCID) external {
        require(!dids[msg.sender].exists, "DID already registered");
        dids[msg.sender] = DID(documentCID, true);
        emit DIDRegistered(msg.sender, documentCID);
    }
    function updateDID(string calldata documentCID) external onlyDIDOwner {
        dids[msg.sender].documentCID = documentCID;
        emit DIDUpdated(msg.sender, documentCID);
    }
    function getDID(address owner) external view returns (string memory) {
        require(dids[owner].exists, "DID not registered");
        return dids[owner].documentCID;
    }
    function hasDID(address owner) external view returns (bool) {
        return dids[owner].exists;
    }
}