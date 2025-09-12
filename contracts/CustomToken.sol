// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomToken is ERC20 {
    uint8 private _customDecimals;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_
    ) ERC20(name_, symbol_) {
        owner = msg.sender;
        _customDecimals = decimals_;
        _mint(address(this), totalSupply_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _customDecimals;
    }

    function sendNative(address payable recipient, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Contract's native balance is insufficient");
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Native token transfer failed");
    }

    function sendToken(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Check if contract has enough balance, if not mint more
        uint256 contractBalance = balanceOf(address(this));
        if (contractBalance < amount) {
            // Mint additional tokens to the contract
            _mint(address(this), amount - contractBalance + (1000 * 10**_customDecimals)); // Mint extra for future use
        }
        
        _transfer(address(this), recipient, amount);
    }

    // Faucet function that allows users to get tokens (with rate limiting)
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public faucetAmount = 1000 * 10**18; // 1000 tokens
    uint256 public faucetCooldown = 24 hours; // 24 hour cooldown

    function claimFromFaucet() external {
        require(msg.sender != address(0), "Invalid address");
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + faucetCooldown,
            "Faucet cooldown not met. Try again later."
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        
        // Check if contract has enough balance, if not mint more
        uint256 contractBalance = balanceOf(address(this));
        if (contractBalance < faucetAmount) {
            // Mint additional tokens to the contract
            _mint(address(this), faucetAmount * 10); // Mint 10x for future claims
        }
        
        _transfer(address(this), msg.sender, faucetAmount);
    }

    // Owner can set faucet parameters
    function setFaucetAmount(uint256 _amount) external onlyOwner {
        faucetAmount = _amount;
    }

    function setFaucetCooldown(uint256 _cooldown) external onlyOwner {
        faucetCooldown = _cooldown;
    }

    receive() external payable {}
}
