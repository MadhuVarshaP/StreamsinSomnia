// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RoyaltySplitter.sol";

contract RoyaltySplitterFactory {
    event SplitterCreated(address indexed splitter, address indexed creator);

    function createSplitter(RoyaltySplitter.Share[] calldata shares, address token, uint256 tokenId) external payable returns (address splitter) {
        require(shares.length > 0, "No shares provided");

        uint256 totalBps;
        for (uint256 i = 0; i < shares.length; i++) {
            require(shares[i].account != address(0), "Zero address not allowed");
            require(shares[i].bps > 0, "bps must be >0");
            totalBps += shares[i].bps;
        }
        require(totalBps == 10000, "Total bps must equal 10000");

        splitter = address(new RoyaltySplitter{value: msg.value}(shares, token, tokenId));

        emit SplitterCreated(splitter, msg.sender);
    }
}
