// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
    This contract is proprietary and not licensed for public use, modification, or distribution.
    All rights reserved by the contract owner.
*/

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TokenRegistry is ERC1155, AccessControl {
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    constructor() ERC1155("https://example.com/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINT_ROLE, msg.sender);
    }

    function mint(address _recipient, uint256 _id, uint256 _amount) external onlyRole(MINT_ROLE) {
        _mint(_recipient, _id, _amount, "");
    }

    function burn(address _holder, uint256 _id, uint256 _amount) external {
        require(msg.sender == _holder, "You can only burn your own tokens");
        _burn(_holder, _id, _amount);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}