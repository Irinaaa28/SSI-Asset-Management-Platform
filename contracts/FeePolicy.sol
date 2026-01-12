// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BasePolicy.sol";

abstract contract FeePolicy is BasePolicy {
    function accessPolicy(address, address, uint256 feePaid) public view virtual override returns (bool) {
        return feePaid > 0;
    }
    function calculateFee(uint256 baseFee) public pure returns (uint256) {
        return (1 + baseFee) * 100;
    }
}