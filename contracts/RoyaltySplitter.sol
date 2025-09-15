// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RoyaltySplitter {
    struct Share { address account; uint96 bps; }

    Share[] public shares;
    uint96 public constant TOTAL_BPS = 10_000;
    IERC20 public immutable token; // STT Token reference

    constructor(Share[] memory _shares, address token_) payable {
        token = IERC20(token_);
        
        uint256 sum;
        for (uint256 i = 0; i < _shares.length; i++) {
            require(_shares[i].account != address(0), "zero address");
            require(_shares[i].bps > 0, "bps=0");
            shares.push(_shares[i]);
            sum += _shares[i].bps;
        }
        require(sum == TOTAL_BPS, "sum!=10000");

        if (msg.value > 0) {
            _distributeETH(msg.value);
        }
    }

    receive() external payable {
        _distributeETH(msg.value);
    }

    /// @notice Distribute STT tokens to all shareholders according to their BPS
    function distribute(uint256 amount) external {
        require(token.balanceOf(address(this)) >= amount, "Insufficient STT balance");
        
        for (uint256 i = 0; i < shares.length; i++) {
            uint256 part = (amount * shares[i].bps) / TOTAL_BPS;
            require(token.transfer(shares[i].account, part), "STT transfer failed");
        }
    }

    /// @notice Distribute ETH to all shareholders (legacy function)
    function _distributeETH(uint256 amount) internal {
        if (amount == 0) return;
        for (uint256 i = 0; i < shares.length; i++) {
            uint256 part = (amount * shares[i].bps) / TOTAL_BPS;
            (bool ok, ) = shares[i].account.call{value: part}("");
            require(ok, "ETH transfer fail");
        }
    }

    function getShares() external view returns (Share[] memory) {
        return shares;
    }
}
