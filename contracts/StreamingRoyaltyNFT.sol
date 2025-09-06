// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StreamingRoyaltyNFT - ERC721 with per-token royalty via splitter
contract StreamingRoyaltyNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public nextId;

    constructor(address initialOwner) 
        ERC721("Somnia Streaming NFT", "SSN") 
        Ownable(initialOwner) 
    {}

    /// @notice Mint NFT with royalty info pointing to a RoyaltySplitter
    function mint(
        address to,
        string memory tokenURI_,
        address splitter,
        uint96 royaltyBps // e.g. 1000 = 10%
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = ++nextId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        _setTokenRoyalty(tokenId, splitter, royaltyBps);
    }

    /// @inheritdoc ERC165
    function supportsInterface(bytes4 iid)
        public
        view
        override(ERC721URIStorage, ERC2981) 
        returns (bool)
    {
        return super.supportsInterface(iid);
    }
}
