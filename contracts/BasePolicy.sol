// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract BasePolicy {
    function accessPolicy(address from, address to, uint256 feePaid, uint256 baseFee) public view virtual;
    function showMessage() public pure virtual returns (string memory);
}