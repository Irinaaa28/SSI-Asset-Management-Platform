// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTAssetManager is ERC721, Ownable {

    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenMetadata;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string metadataCID);

    modifier tokenExists(address owner) {
        require(owner != address(0), "Token does not exist");
        _;
    }

    constructor() ERC721("SSID Asset", "SSID") Ownable(msg.sender){}

    function mintNFT(address to, string calldata metadataCID) external returns (uint256) {
        require(bytes(metadataCID).length > 0, "Invalid metadata CID");
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(to, newTokenId);
        _tokenMetadata[newTokenId] = metadataCID;

        emit NFTMinted(to, newTokenId, metadataCID);
        return newTokenId;
    }

    function burnNFT(uint256 tokenId) external tokenExists(_ownerOf(tokenId)){
        address _owner = _ownerOf(tokenId);
        require(msg.sender == _owner || msg.sender == owner(), "Not authorized to burn");
        _burn(tokenId);
        delete _tokenMetadata[tokenId];
    }

    function tokenMetadata(uint256 tokenId) external view tokenExists(_ownerOf(tokenId)) returns (string memory) {
        return _tokenMetadata[tokenId];
    }
    
}