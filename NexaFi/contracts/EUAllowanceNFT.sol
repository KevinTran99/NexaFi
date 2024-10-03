// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
    This contract is proprietary and not licensed for public use, modification, or distribution.
    All rights reserved by the contract owner.
*/

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ITokenRegistry {
    function mint(address _recipient, uint256 _id, uint256 _amount) external;
}

contract EUAllowanceNFT is Ownable, ReentrancyGuard {
    ITokenRegistry public tokenRegistry;
    uint256 public constant EUA_ID = 1;

    mapping(address => uint256) public mintAllowances;

    error InsufficientMintAllowance(address caller, uint256 allowance, uint256 required);
    error AllowanceTooLow(address account, uint256 allowance, uint256 required);

    constructor(address _tokenRegistryAddress) Ownable(msg.sender) {
        tokenRegistry = ITokenRegistry(_tokenRegistryAddress);
    }

    function mintEUAs(uint256 _amount) external nonReentrant{
        if (mintAllowances[msg.sender] < _amount) {
            revert InsufficientMintAllowance(msg.sender, mintAllowances[msg.sender], _amount);
        }

        mintAllowances[msg.sender] -= _amount;
        tokenRegistry.mint(msg.sender, EUA_ID, _amount);
    }

    function increaseMintAllowance(address _account, uint256 _amount) external onlyOwner {
        mintAllowances[_account] += _amount;
    }

    function decreaseMintAllowance(address _account, uint256 _amount) external onlyOwner {
        if (mintAllowances[_account] < _amount) {
            revert AllowanceTooLow(_account, mintAllowances[_account], _amount);
        }

        mintAllowances[_account] -= _amount;
    }
}