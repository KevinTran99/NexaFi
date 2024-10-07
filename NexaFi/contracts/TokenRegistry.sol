// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
    This contract is proprietary and not licensed for public use, modification, or distribution.
    All rights reserved by the contract owner.
*/

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TokenRegistry is ERC1155, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    mapping(uint256 => uint256) public totalMinted;
    mapping(uint256 => uint256) public totalBurned;
    mapping(address => bool) private restrictedAddresses;

    event NFTMint(address indexed recipient, uint256 id, uint256 amount);
    event MintSkippedDueToRestrictedAddress(address indexed recipient);
    event BurnedForExchange(address indexed burner, uint256 id, uint256 amount);
    event BurnedForRetirement(address indexed burner, uint256 id, uint256 amount);
    event BurnSkippedDueToInsufficientBalance(address indexed burner, uint256 id, uint256 balance, uint256 required);
    event AddressRestrictionUpdated(address indexed restrictedAddress, bool status);

    error ArrayLengthsMismatch(uint256 recipientsLength, uint256 idsLength, uint256 amountsLength);
    error InsufficientBalanceForBurn(uint256 balance, uint256 required);
    error AddressRestricted(address restrictedAddress);
    error AddressAlreadyRestricted(address restrictedAddress);
    error AddressNotRestricted(address notRestrictedAddress);

    modifier notRestricted(address _address) {
        if (restrictedAddresses[_address]) {
            revert AddressRestricted(_address);
        }
        _;
    }

    constructor() ERC1155("https://nexafi.vercel.app/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINT_ROLE, msg.sender);
    }

    function mint(address _recipient, uint256 _id, uint256 _amount) external onlyRole(MINT_ROLE) notRestricted(_recipient) nonReentrant whenNotPaused {
        _mint(_recipient, _id, _amount, "");

        unchecked {
            totalMinted[_id] += _amount;
        }

        emit NFTMint(_recipient, _id, _amount);
    }

    function mintBatch(address[] memory _recipients, uint256[] memory _ids, uint256[] memory _amounts) external onlyRole(MINT_ROLE) nonReentrant whenNotPaused {
        if (_recipients.length != _ids.length || _recipients.length != _amounts.length) {
            revert ArrayLengthsMismatch(_recipients.length, _ids.length, _amounts.length);
        }

        for (uint256 i = 0; i < _recipients.length; i++) {
            if (restrictedAddresses[_recipients[i]]) {
                emit MintSkippedDueToRestrictedAddress(_recipients[i]);
                continue;
            }

            _mint(_recipients[i], _ids[i], _amounts[i], "");

            unchecked {
                totalMinted[_ids[i]] += _amounts[i];
            }

            emit NFTMint(_recipients[i], _ids[i], _amounts[i]);
        }
    }

    function burnForExchange(uint256 _id, uint256 _amount) external notRestricted(msg.sender) whenNotPaused {
        uint256 balance = balanceOf(msg.sender, _id);

        if (balance < _amount) {
            revert InsufficientBalanceForBurn(balance, _amount);
        }

        _burn(msg.sender, _id, _amount);
        
        unchecked {
            totalBurned[_id] += _amount;
        }

        emit BurnedForExchange(msg.sender, _id, _amount);
    }

    function burnForRetirement(uint256 _id, uint256 _amount) external notRestricted(msg.sender) whenNotPaused {
        uint256 balance = balanceOf(msg.sender, _id);

        if (balance < _amount) {
            revert InsufficientBalanceForBurn(balance, _amount);
        }

        _burn(msg.sender, _id, _amount);
        
        unchecked {
            totalBurned[_id] += _amount;
        }

        emit BurnedForRetirement(msg.sender, _id, _amount);
    }

    function burnBatchForExchange(uint256[] memory _ids, uint256[] memory _amounts) external notRestricted(msg.sender) whenNotPaused {
        if (_ids.length != _amounts.length) {
            revert ArrayLengthsMismatch(0, _ids.length, _amounts.length);
        }

        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 balance = balanceOf(msg.sender, _ids[i]);

            if (balance < _amounts[i]) {
                emit BurnSkippedDueToInsufficientBalance(msg.sender, _ids[i], balance, _amounts[i]);
                continue;
            }

            _burn(msg.sender, _ids[i], _amounts[i]);
            
            unchecked {
                totalBurned[_ids[i]] += _amounts[i];
            }

            emit BurnedForExchange(msg.sender, _ids[i], _amounts[i]);
        }
    }

    function burnBatchForRetirement(uint256[] memory _ids, uint256[] memory _amounts) external notRestricted(msg.sender) whenNotPaused {
        if (_ids.length != _amounts.length) {
            revert ArrayLengthsMismatch(0, _ids.length, _amounts.length);
        }

        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 balance = balanceOf(msg.sender, _ids[i]);

            if (balance < _amounts[i]) {
                emit BurnSkippedDueToInsufficientBalance(msg.sender, _ids[i], balance, _amounts[i]);
                continue;
            }

            _burn(msg.sender, _ids[i], _amounts[i]);
            
            unchecked {
                totalBurned[_ids[i]] += _amounts[i];
            }

            emit BurnedForRetirement(msg.sender, _ids[i], _amounts[i]);
        }
    }

    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes memory _data) public override notRestricted(_from) notRestricted(_to) whenNotPaused {
        super.safeTransferFrom(_from, _to, _id, _amount, _data);
    }

    function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data) public override notRestricted(_from) notRestricted(_to) whenNotPaused {
        super.safeBatchTransferFrom(_from, _to, _ids, _values, _data);
    }

    function updateURI(string memory _newURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(_newURI);
    }

    function restrictAddress(address _address) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (restrictedAddresses[_address]) {
            revert AddressAlreadyRestricted(_address);
        }

        restrictedAddresses[_address] = true;

        emit AddressRestrictionUpdated(_address, true);
    }

    function unrestrictAddress(address _address) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!restrictedAddresses[_address]) {
            revert AddressNotRestricted(_address);
        }

        restrictedAddresses[_address] = false;

        emit AddressRestrictionUpdated(_address, false);
    }

    function isRestricted(address _address) external view returns (bool) {
        return restrictedAddresses[_address];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}