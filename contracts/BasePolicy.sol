// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract BasePolicy {
    function accessPolicy(address from, address to, uint256 feePaid) public view virtual returns (bool);
}