// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StreamingRoyaltyNFT - ERC721 with per-token royalty via splitter
contract StreamingRoyaltyNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public nextId;
    mapping(uint256 => address) public tokenSplitters;

    event NFTMinted(uint256 indexed tokenId, address indexed owner, address splitter, uint96 royaltyBps);

    constructor(address initialOwner) 
        ERC721("Somnia Streaming NFT", "SSN") 
        Ownable(initialOwner) 
    {}

    function mint(
        address to,
        string memory tokenURI_,
        address splitter,
        uint96 royaltyBps
    ) external returns (uint256 tokenId) {
        tokenId = ++nextId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        _setTokenRoyalty(tokenId, splitter, royaltyBps);
        tokenSplitters[tokenId] = splitter;

        emit NFTMinted(tokenId, to, splitter, royaltyBps);
    }

    function supportsInterface(bytes4 iid) public view override(ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(iid);
    }
}
