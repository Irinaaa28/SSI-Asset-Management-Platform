// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./DIDPolicy.sol";
import "./FeePolicy.sol";

contract AssetAccessControl is DIDPolicy, FeePolicy {
    constructor(address didRegistryAddress) DIDPolicy(didRegistryAddress) {}

    function accessPolicy(address from, address to, uint256 feePaid, uint256 baseFee) public view virtual override(DIDPolicy, FeePolicy)  {
        DIDPolicy.accessPolicy(from, to, feePaid, baseFee);
        FeePolicy.accessPolicy(from, to, feePaid, baseFee);
    } 
    function showMessage() public pure virtual override(DIDPolicy, FeePolicy) returns (string memory) {
        return "Access denied";
    }
}