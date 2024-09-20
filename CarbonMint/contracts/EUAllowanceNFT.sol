// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
    This contract is proprietary and not licensed for public use, modification, or distribution.
    All rights reserved by the contract owner.
*/

import "@openzeppelin/contracts/access/Ownable.sol";

interface ITokenRegistry {
    function mint(address _recipient, uint256 _id, uint256 _amount) external;
    function burn(address _holder, uint256 _id, uint256 _amount) external;
}

contract EUAllowanceNFT is Ownable {
    ITokenRegistry public tokenRegistry;
    uint256 public constant EUA_ID = 1;

    mapping(address => uint256) public mintAllowances;

    constructor(address _tokenRegistryAddress) Ownable(msg.sender) {
        tokenRegistry = ITokenRegistry(_tokenRegistryAddress);
    }

    function mintEUAs(address _recipient, uint256 _amount) external {
        require(mintAllowances[msg.sender] >= _amount, "Not enough mint allowance" );
        mintAllowances[msg.sender] -= _amount;
        tokenRegistry.mint(_recipient, EUA_ID, _amount);
    }

    function setMintAllowance(address _account, uint256 _allowance) external onlyOwner {
        mintAllowances[_account] = _allowance;
    }
}