// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
    This contract is proprietary and not licensed for public use, modification, or distribution.
    All rights reserved by the contract owner.
*/

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenRegistry is ERC1155, AccessControl, ReentrancyGuard {
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    mapping(uint256 => uint256) public tokenSupply;

    event NFTMint (address indexed mintAddress, uint256 id, uint256 amount);
    event BurnedForExchange (address indexed burnAddress, uint256 id, uint256 amount);
    event BurnedForRetirement (address indexed burnAddress, uint256 id, uint256 amount);

    constructor() ERC1155("https://example.com/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINT_ROLE, msg.sender);
    }

    function mint(address _recipient, uint256 _id, uint256 _amount) external onlyRole(MINT_ROLE) nonReentrant{
        _mint(_recipient, _id, _amount, "");
        tokenSupply[_id] += _amount;

        emit NFTMint(_recipient, _id, _amount);
    }

    function burnForExchange(uint256 _id, uint256 _amount) external {
        require(balanceOf(msg.sender, _id) >= _amount, "Insufficient NFT balance to burn");

        _burn(msg.sender, _id, _amount);
        tokenSupply[_id] -= _amount;

        emit BurnedForExchange(msg.sender, _id, _amount);
    }

    function burnForRetirement(uint256 _id, uint256 _amount) external {
        require(balanceOf(msg.sender, _id) >= _amount, "Insufficient NFT balance to burn");

        _burn(msg.sender, _id, _amount);
        tokenSupply[_id] -= _amount;

        emit BurnedForRetirement(msg.sender, _id, _amount);
    }

    function updateURI(string memory _newURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(_newURI);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}