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
* illustrating diamond inheritance through policy contracts

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

## Policy Contracts and Diamond Inheritance
To demonstrate advanced object-oriented concepts in Solidity, the project was extended with a policy-based access control system implemented through diamond inheritance.

### BasePolicy
* abstract contract defining a generic access policy interface
* exposes the accessPolicy and showMessage functions
* acts as the common ancestor in the diamond inheritance structure

### DIDPolicy
* inherits from BasePolicy
* enforces identity-based access control
* verifies that both sender and receiver own valid DIDs registered in DIDRegistry
* reverts with a custom error when identity constraints are violated

### FeePolicy
* inherits from BasePolicy
* enforces fee-based access control
* validates that the exact required ETH fee is paid for mint, transfer or burn operations
* includes a pure function for fee calculation
* reverts with a custom error when fee constraints are violated

### AssetAccessControl (Diamond Resolution)
* inherits from both DIDPolicy and FeePolicy
* represents the diamond inheritance resolution
* orchestrates multiple access policies without duplicating logic
* executes each policy independently and reverts with the specific error of the failing rule
* illustrates Solidity's C3 linearization mechanism

## Integration with NFTAssetManager
The NFTAssetManager contract integrates AssetAccessControl to enforce both identity and fee constraints in a modular and extensible way:
* minting NFTs requires a valid DID and the exact minting fee
* transferring NFTs requires valid DIDs for both sender and receiver and the exact transfer fee
  
All access validation is delegated to the policy contracts, ensuring separation of concerns and clean contract architecture.

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
* AssetAccessControl(verifies if both sender and receiver have DIDs and the fee equals the expected one)
* interaction between contracts
  
These automated tests prove correct functionality of the code by ilustrating all the functions and the edge cases. They are implemented using Hardhat and Mocha.

## Deploy
All the contracts have been deployed on the Sepolia test network using Hardhat scripts dedicated for each contract. After deploy, contracts can be interogated and used through the demo script.
