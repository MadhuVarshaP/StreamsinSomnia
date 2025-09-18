// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RoyaltySplitter {
    struct Share { 
        address account; 
        uint96 bps; 
    }
    
    struct RoyaltyRecord {
        string nftName;
        uint256 amount;
        uint256 timestamp;
    }

    Share[] public shares;
    uint96 public constant TOTAL_BPS = 10000;
    IERC20 public immutable token; // STT Token reference
    
    // Track creator earnings per tokenId (existing)
    mapping(address => mapping(uint256 => uint256)) public creatorEarnings;
    
    // Track detailed history for each recipient
    mapping(address => RoyaltyRecord[]) public recipientHistory;
    
    // Track total earnings per recipient per NFT
    mapping(address => uint256) public recipientTotalEarnings;
    
    // Track which tokenId this splitter is associated with
    uint256 public tokenId;
    
    // Store the NFT name for this splitter
    string public nftName;

    event RoyaltyDistributed(address indexed recipient, uint256 indexed tokenId, uint256 amount);

    constructor(Share[] memory _shares, address token_, uint256 _tokenId) payable {
        token = IERC20(token_);
        tokenId = _tokenId;
        nftName = _getNFTName(_tokenId);
        
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
            
            // Directly transfer STT tokens to recipient
            require(token.transfer(shares[i].account, part), "STT transfer failed");
            
            // Track creator earnings per tokenId (for display purposes)
            creatorEarnings[shares[i].account][tokenId] += part;
            
            // Update total earnings for this NFT (for display purposes)
            recipientTotalEarnings[shares[i].account] += part;
            
            // Add to recipient history for tracking
            recipientHistory[shares[i].account].push(RoyaltyRecord({
                nftName: nftName,
                amount: part,
                timestamp: block.timestamp
            }));
            
            emit RoyaltyDistributed(shares[i].account, tokenId, part);
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
    
    
    /// @notice Get creator earnings for a specific tokenId
    function getCreatorEarnings(address creator, uint256 _tokenId) external view returns (uint256) {
        return creatorEarnings[creator][_tokenId];
    }
    
    
    /// @notice NEW: Get total earnings for a recipient from this specific NFT
    function getRecipientTotalEarnings(address recipient) external view returns (uint256) {
        return recipientTotalEarnings[recipient];
    }
    
    /// @notice NEW: Get royalty history for a recipient
    function getRecipientHistory(address recipient) external view returns (RoyaltyRecord[] memory) {
        return recipientHistory[recipient];
    }
    
    /// @notice NEW: Get royalty history count for a recipient
    function getRecipientHistoryCount(address recipient) external view returns (uint256) {
        return recipientHistory[recipient].length;
    }
    
    /// @notice NEW: Get paginated royalty history for a recipient
    function getRecipientHistoryPaginated(
        address recipient, 
        uint256 offset, 
        uint256 limit
    ) external view returns (RoyaltyRecord[] memory) {
        RoyaltyRecord[] memory allHistory = recipientHistory[recipient];
        uint256 totalCount = allHistory.length;
        
        if (offset >= totalCount) {
            return new RoyaltyRecord[](0);
        }
        
        uint256 endIndex = offset + limit;
        if (endIndex > totalCount) {
            endIndex = totalCount;
        }
        
        uint256 resultLength = endIndex - offset;
        RoyaltyRecord[] memory result = new RoyaltyRecord[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allHistory[totalCount - 1 - offset - i]; // Reverse order (newest first)
        }
        
        return result;
    }
    
    /// @notice NEW: Get NFT name from tokenId (internal function)
    function _getNFTName(uint256 _tokenId) internal pure returns (string memory) {
        // This would need to be implemented based on how NFT names are stored
        // For now, return a formatted string with tokenId
        return string(abi.encodePacked("NFT #", _toString(_tokenId)));
    }
    
    /// @notice Helper function to convert uint256 to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
