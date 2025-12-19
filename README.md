# Self-Sovereign Identity System for Digital Assets (NFTs, Licenses)

## Introduction

This project implements a SSI system for digital assets management using smart contracts on Ethereum blockchain. The solution allows users to:
* create and control their own decentralized identity (DID)
* mint and transfer NFTs only if they own a valid identity
* create, validate and revoke digital licenses associated with identities without depending on a central authority.

## Objectives
* implementing a register for DIDs
* access control to digital assets based on the identity
* demonstrating interaction between smart contracts
* using ETH taxes and withdrawal pattern
* automated testing and deploying on the Sepolia testnet

## Architecture
This project contains three main smart contracts: 

### DIDRegistry
* manages decentralized identities (DIDs)
* allows registering and checking the existence of a DID
* used by the other contracts for identity validation

### NFTAssetManager
* ERC721 contract for NFTs management
* allows NFT minting only for users with DID
* allows NFT transfers only between users with DID
* allows NFT linking with the identity
* implements taxes for mint/burn/transfer
* uses withdrawal pattern for withdrawing ETH safely

### LicenseManager
* manages digital licenses associated with identities
* supports creating, validating and revoking licenses
* verifies user's identity via DIDRegistry

## Technologies
* Solidity 0.8.28
* Hardhat
* Ethers.js
* Mocha
* OpenZeppelin Contracts (ERC721, Ownable)
* Ethereum Sepolia Testnet
* TypeScript

## Testing
This project includes automated tests for
* DIDRegistry(register and validate DID)
* NFTAssetManager(mint, transfer, verify taxes)
* LicenseManager(create, validate, revoke)
* interaction between contracts
These automated tests prove correct functionality of the code by ilustrating all the functions and the edge cases. They are implemented using Hardhat and Mocha.

## Deploy
All the contracts have been deployed on the Sepolia test network using Hardhat scripts dedicated for each contract. After deploy, contracts can be interogated and used through the demo script.
