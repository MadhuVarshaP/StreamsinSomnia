// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @title RoyaltyRouter - demo marketplace that handles sales + royalties
contract RoyaltyRouter {
    IERC721 public immutable nft;
    ERC2981 public immutable meta;

    event SaleSettled(uint256 indexed tokenId, uint256 salePrice, uint256 royalty);

    constructor(address nft_) {
        nft = IERC721(nft_);
        meta = ERC2981(nft_);
    }

    /// @notice Simulate a sale
    /// @param tokenId the NFT being sold
    /// @param seller current owner
    /// @param buyer recipient of the NFT
    function sell(uint256 tokenId, address seller, address buyer) external payable {
        uint256 salePrice = msg.value;

        (address receiver, uint256 royalty) = meta.royaltyInfo(tokenId, salePrice);

        // Pay royalty to splitter (auto-splits to recipients)
        (bool ok1,) = receiver.call{value: royalty}("");
        require(ok1, "royalty xfer");

        // Pay seller the remainder
        (bool ok2,) = payable(seller).call{value: salePrice - royalty}("");
        require(ok2, "seller xfer");

        // Transfer NFT to buyer
        nft.transferFrom(seller, buyer, tokenId);

        emit SaleSettled(tokenId, salePrice, royalty);
    }
}
