// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BasePolicy.sol";
import "./DIDRegistry.sol";

abstract contract DIDPolicy is BasePolicy {
    DIDRegistry public didRegistry;

    constructor (address didRegistryAddress) {
        didRegistry = DIDRegistry(didRegistryAddress);
    }

    function accessPolicy(address from, address to, uint256 ) public view virtual override returns (bool) {
        return didRegistry.hasDID(from) && didRegistry.hasDID(to);
    }
}