// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./DIDRegistry.sol";

contract LicenseManager {
    
    struct License {
        address owner;
        uint256 expiry;
        string documentCID;
        bool revoked;
    }

    DIDRegistry public didRegistry;
    uint256 private _licenseIdCounter;
    mapping(uint256 => License) private _licenses;

    event LicenseCreated(uint256 indexed licenseId, address indexed owner, uint256 expiry, string documentCID);
    event LicenseRevoked(uint256 indexed licenseId);

    modifier onlyDIDOwner() {
        require(didRegistry.hasDID(msg.sender), "DID not registered");
        _;
    }

    modifier onlyLicenseOwner(uint256 licenseId) {
        require(_licenses[licenseId].owner == msg.sender, "Not the license owner");
        _;
    }
    constructor(address didRegistryAddress) {
        didRegistry = DIDRegistry(didRegistryAddress);
    }

    function createLicense(address owner, uint256 expiry, string calldata documentCID) external onlyDIDOwner returns (uint256) {
        require(didRegistry.hasDID(owner), "Owner DID not registered");
        require(expiry > block.timestamp, "Expiry must be in the future"); // block.timestamp = 1735692000 for remix
        require(bytes(documentCID).length > 0, "Invalid document CID");

        _licenseIdCounter++;
        uint256 newLicenseId = _licenseIdCounter;

        _licenses[newLicenseId] = License({
            owner: owner,
            expiry: expiry,
            documentCID: documentCID,
            revoked: false
        });

        emit LicenseCreated(newLicenseId, owner, expiry, documentCID);
        return newLicenseId;
    }

    function revokeLicense(uint256 licenseId) external onlyLicenseOwner(licenseId) {
        License storage license = _licenses[licenseId];
        require(!license.revoked, "License already revoked");

        license.revoked = true;
        emit LicenseRevoked(licenseId);
    }

    function checkValidLicense(uint256 licenseId) external view returns (bool) {
        License memory license = _licenses[licenseId];
        if (license.owner == address(0))
            return false;
        if (license.revoked)
            return false;
        if (block.timestamp >= license.expiry)
            return false;
        return true;
    }

    function getLicense(uint256 licenseId) external view returns (address owner, uint256 expiry, string memory documentCID, bool revoked) {
        License memory license = _licenses[licenseId];
        require(license.owner != address(0), "License does not exist");
        return (license.owner, license.expiry, license.documentCID, license.revoked);
    }
}