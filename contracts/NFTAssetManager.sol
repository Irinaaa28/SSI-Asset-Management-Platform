// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DIDRegistry.sol";

contract NFTAssetManager is ERC721, Ownable {

    DIDRegistry public didRegistry;
    uint256 public constant MINT_FEE = 100000 wei;
    uint256 public constant BURN_FEE = 500000 wei;
    uint256 public constant TRANSFER_FEE = 500000 wei;
    uint256 private _balance;

    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenMetadata;
    mapping(uint256 => address) private _didOwner;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string metadataCID);
    event NFTBurnt(address indexed from, uint256 indexed tokenId);
    event NFTTransferred(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier tokenExists(address owner) {
        require(owner != address(0), "Token does not exist");
        _;
    }

    constructor(address didRegistryAddress) ERC721("SSID Asset", "SSID") Ownable(msg.sender){
        didRegistry = DIDRegistry(didRegistryAddress);
    }

    function mintNFT(string calldata metadataCID) external payable returns (uint256) {
        // require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(msg.value == MINT_FEE, "Incorrect mint fee");
        require(didRegistry.hasDID(msg.sender), "DID not registered");
        require(bytes(metadataCID).length > 0, "Invalid metadata CID");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(msg.sender, newTokenId);
        _didOwner[newTokenId] = msg.sender;
        _tokenMetadata[newTokenId] = metadataCID;
        _balance += msg.value;

        emit NFTMinted(msg.sender, newTokenId, metadataCID);
        return newTokenId;
    }

    function burnNFT(uint256 tokenId) external payable tokenExists(_ownerOf(tokenId)){
        address _owner = _ownerOf(tokenId);
        require(msg.sender == _owner || msg.sender == owner(), "Not authorized to burn");
        _burn(tokenId);
        delete _tokenMetadata[tokenId];
        emit NFTBurnt(_owner, tokenId);
    }

    function tokenMetadata(uint256 tokenId) external view tokenExists(_ownerOf(tokenId)) returns (string memory) {
        return _tokenMetadata[tokenId];
    }

    function didOwnerOf(uint256 tokenId) external view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _didOwner[tokenId];
    }

    function transferNFT(address to, uint256 tokenId) external payable {
        require(_ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        require(_didOwner[tokenId] == msg.sender, "DID not linked to token");
        require(didRegistry.hasDID(to), "Receiver has no DID");
        _didOwner[tokenId] = to;
        _safeTransfer(msg.sender, to, tokenId, "");
        emit NFTTransferred(msg.sender, to, tokenId);
    }

    function withdraw() external onlyOwner {
        uint256 amount = _balance;
        require(amount > 0, "Nothing to withdraw");
        _balance = 0;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "ETH transfer failed");
    }
    
}