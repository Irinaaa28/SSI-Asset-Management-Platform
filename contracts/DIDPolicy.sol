// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BasePolicy.sol";
import "./DIDRegistry.sol";

error DIDPolicyViolation(string message);

abstract contract DIDPolicy is BasePolicy {
    DIDRegistry public didRegistry;

    constructor (address didRegistryAddress) {
        didRegistry = DIDRegistry(didRegistryAddress);
    }

    function accessPolicy(address from, address to, uint256, uint256) public view virtual override {
        if (!didRegistry.hasDID(from) || !didRegistry.hasDID(to)) {
            revert DIDPolicyViolation(showMessage());
        }
    }

    function showMessage() public pure virtual override returns (string memory) {
        return "Sender or receiver has no DID";
    }
}