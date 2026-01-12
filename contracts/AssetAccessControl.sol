// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./DIDPolicy.sol";
import "./FeePolicy.sol";

contract AssetAccessControl is DIDPolicy, FeePolicy {
    constructor(address didRegistryAddress) DIDPolicy(didRegistryAddress) {}

    function accessPolicy(address from, address to, uint256 feePaid) public view virtual override(DIDPolicy, FeePolicy) returns (bool) {
        return DIDPolicy.accessPolicy(from, to, feePaid) && FeePolicy.accessPolicy(from, to, feePaid);
    } 
}