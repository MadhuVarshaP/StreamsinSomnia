// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title RoyaltyRouter - NFT Marketplace with Listings + Buy Flow (Using STT Token)
contract RoyaltyRouter {
    IERC721 public immutable nft;
    ERC2981 public immutable meta;
    IERC20 public immutable token;  // STT Token

    event NFTListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event SaleSettled(uint256 indexed tokenId, uint256 salePrice, uint256 royalty);

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    constructor(address nft_, address token_) {
        nft = IERC721(nft_);
        meta = ERC2981(nft_);
        token = IERC20(token_);
    }

    /// @notice List an NFT for sale
    function listNFT(uint256 tokenId, uint256 price) external {
        require(nft.ownerOf(tokenId) == msg.sender, "Only owner can list");
        require(nft.getApproved(tokenId) == address(this), "Router must be approved");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit NFTListed(tokenId, msg.sender, price);
    }

    /// @notice Buy a listed NFT using STT token
    function buyNFT(uint256 tokenId) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "NFT not listed");

        uint256 salePrice = listing.price;

        (address receiver, uint256 royalty) = meta.royaltyInfo(tokenId, salePrice);

        // Transfer royalty in STT from buyer to splitter
        require(token.transferFrom(msg.sender, receiver, royalty), "Royalty transfer failed");

        // Distribute the royalty to all creators in the splitter
        if (royalty > 0) {
            (bool success, ) = receiver.call(abi.encodeWithSignature("distribute(uint256)", royalty));
            require(success, "Royalty distribution failed");
        }

        // Transfer remaining STT from buyer to seller
        require(token.transferFrom(msg.sender, listing.seller, salePrice - royalty), "Seller transfer failed");

        // Transfer NFT ownership
        nft.transferFrom(listing.seller, msg.sender, tokenId);

        // Deactivate listing
        listing.active = false;

        emit SaleSettled(tokenId, salePrice, royalty);
    }

    /// @notice Get all active listings (for frontend display)
    function getActiveListings() external view returns (uint256[] memory tokenIds, Listing[] memory _listings) {
        uint256 totalCount = 0;
        uint256 maxTokens = 10000;  // Assumed maximum tokenId range

        for (uint256 i = 1; i <= maxTokens; i++) {
            if (listings[i].active) totalCount++;
        }

        tokenIds = new uint256[](totalCount);
        _listings = new Listing[](totalCount);

        uint256 idx = 0;
        for (uint256 i = 1; i <= maxTokens; i++) {
            if (listings[i].active) {
                tokenIds[idx] = i;
                _listings[idx] = listings[i];
                idx++;
            }
        }
    }
}
