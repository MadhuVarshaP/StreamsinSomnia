// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RoyaltySplitter {
    struct Share { address account; uint96 bps; }

    Share[] public shares;
    uint96 public constant TOTAL_BPS = 10_000;

    constructor(Share[] memory _shares) payable {
        uint256 sum;
        for (uint256 i = 0; i < _shares.length; i++) {
            require(_shares[i].account != address(0), "zero address");
            require(_shares[i].bps > 0, "bps=0");
            shares.push(_shares[i]);
            sum += _shares[i].bps;
        }
        require(sum == TOTAL_BPS, "sum!=10000");

        if (msg.value > 0) {
            _distribute(msg.value);
        }
    }

    receive() external payable {
        _distribute(msg.value);
    }

    function _distribute(uint256 amount) internal {
        if (amount == 0) return;
        for (uint256 i = 0; i < shares.length; i++) {
            uint256 part = (amount * shares[i].bps) / TOTAL_BPS;
            (bool ok, ) = shares[i].account.call{value: part}("");
            require(ok, "transfer fail");
        }
    }

    function getShares() external view returns (Share[] memory) {
        return shares;
    }
}
