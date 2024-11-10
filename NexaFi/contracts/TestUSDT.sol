// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestUSDT
 * @dev A test USDT token contract that allows anyone to mint tokens for testing purposes.
 * THIS IS FOR TESTING ONLY - DO NOT USE IN PRODUCTION
 */
contract TestUSDT is ERC20 {
    uint8 private constant _decimals = 6;

    constructor() ERC20("Test USDT", "tUSDT") {}

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Allows anyone to mint test USDT tokens
     * @param amount The amount of tokens to mint (in USDT units with 6 decimals)
     */
    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}