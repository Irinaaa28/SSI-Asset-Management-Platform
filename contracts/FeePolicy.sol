// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./BasePolicy.sol";

error FeePolicyViolation(string message);

abstract contract FeePolicy is BasePolicy {
    function accessPolicy(address, address, uint256 feePaid, uint256 baseFee) public view virtual override {
        if (feePaid != calculateFee(baseFee))
            revert FeePolicyViolation(showMessage());
    }
    function calculateFee(uint256 baseFee) public pure returns (uint256) {
        return (1 + baseFee) * 100;
    }
    function showMessage() public pure virtual override returns (string memory) {
        return "Incorrect fee paid";
    }
}
