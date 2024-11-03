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

/**
 * @title TokenRegistry
 * @dev This contract tokenizes environmental credits as ERC1155 NFTs. Each token ID represents a specific type of environmental credit.
 *
 * The contract allows minting of NFTs that correspond to the actual environmental credits held by the company.
 * Only the amount of tokens that the company truly owns will be minted.
 */
contract TokenRegistry is ERC1155, AccessControl, ReentrancyGuard, Pausable {
    // Role identifiers
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    // Token tracking
    mapping(uint256 => uint256) public totalMinted;
    mapping(uint256 => uint256) public totalBurned;

    // Address restrictions mapping
    mapping(address => bool) private restrictedAddresses;

    // Events for tracking actions in the contract
    event NFTMint(address indexed recipient, uint256 id, uint256 amount);
    event MintSkippedDueToRestrictedAddress(address indexed recipient);
    event BurnedForExchange(address indexed burner, uint256 id, uint256 amount);
    event BurnedForRetirement(address indexed burner, uint256 id, uint256 amount);
    event BurnSkippedDueToInsufficientBalance(address indexed burner, uint256 id, uint256 balance, uint256 required);
    event AddressRestrictionUpdated(address indexed restrictedAddress, bool status);

    // Custom errors for revert reasons
    error ArrayLengthsMismatch(uint256 recipientsLength, uint256 idsLength, uint256 amountsLength);
    error InsufficientBalanceForBurn(uint256 balance, uint256 required);
    error AddressRestricted(address restrictedAddress);
    error AddressAlreadyRestricted(address restrictedAddress);
    error AddressNotRestricted(address notRestrictedAddress);

    // Modifier to check if an address is restricted
    modifier notRestricted(address _address) {
        if (restrictedAddresses[_address]) {
            revert AddressRestricted(_address);
        }
        _;
    }

    /**
     * @dev Constructor initializes the contract, setting up metadata URI and assigning roles to deployer.
     */
    constructor() ERC1155("https://nexafi.vercel.app/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINT_ROLE, msg.sender);
    }

    /**
     * @dev Mints a specific amount of a token ID to a recipient, representing environmental credits, if the address is not restricted.
     * All addresses can mint for testing purposes. Emits NFTMint on success.
     * Reverts with AddressRestricted if the recipient is restricted.
     * @param _recipient The address to receive the minted token.
     * @param _id The token ID to mint.
     * @param _amount The amount of tokens to mint.
     */
    function mint(address _recipient, uint256 _id, uint256 _amount) 
        external 
        //onlyRole(MINT_ROLE) 
        notRestricted(_recipient) 
        nonReentrant 
        whenNotPaused 
    {
        _mint(_recipient, _id, _amount, "");

        unchecked {
            totalMinted[_id] += _amount;
        }

        emit NFTMint(_recipient, _id, _amount);
    }

    /**
     * @dev Mints multiple token IDs to multiple recipients, representing environmental credits, 
     * while skipping any recipients that are restricted.
     * Emits NFTMint for each successful mint and MintSkippedDueToRestrictedAddress 
     * for any restricted recipients.
     * Reverts if the lengths of _recipients, _ids, and _amounts do not match.
     * @param _recipients The addresses to receive the minted tokens.
     * @param _ids The token IDs to mint.
     * @param _amounts The amounts of tokens to mint for each corresponding ID.
     */
    function mintBatch(address[] memory _recipients, uint256[] memory _ids, uint256[] memory _amounts) 
        external 
        onlyRole(MINT_ROLE) 
        nonReentrant 
        whenNotPaused 
    {
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

    /**
     * @dev Burns a specific amount of a token ID for exchange, enabling the user to receive an equivalent amount of real-world 
     * environmental credits held by the company. This represents an exchange where the tokens are "swapped" for actual credits 
     * in a designated registry account, if the caller's address is not restricted.
     * Reverts with InsufficientBalanceForBurn if the caller's balance is insufficient.
     * Emits BurnedForExchange on success.
     * @param _id The token ID to burn.
     * @param _amount The amount of tokens to burn.
     */
    function burnForExchange(uint256 _id, uint256 _amount) 
        external 
        notRestricted(msg.sender) 
        whenNotPaused 
    {
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

    /**
     * @dev Burns a specific amount of a token ID for retirement, effectively retiring the same amount of environmental credits
     * to help the environment, if the address is not restricted.
     * Reverts with InsufficientBalanceForBurn if the caller's balance is insufficient.
     * Emits BurnedForRetirement on success.
     * @param _id The token ID to burn.
     * @param _amount The amount of tokens to burn.
     */
    function burnForRetirement(uint256 _id, uint256 _amount) 
        external 
        notRestricted(msg.sender) 
        whenNotPaused 
    {
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

    /**
     * @dev Burns multiple token IDs in batch for exchange, enabling the user to receive an equivalent amount of real-world 
     * environmental credits for each token burned. This represents a bulk exchange, where tokens are "swapped" for actual 
     * credits held by the company. Skips tokens that cannot be burned due to insufficient balance.
     * Emits BurnSkippedDueToInsufficientBalance for each token with insufficient balance.
     * Reverts if the lengths of _ids and _amounts do not match.
     * Emits BurnedForExchange for each successfully burned token.
     * @param _ids The token IDs to burn.
     * @param _amounts The corresponding amounts of each token to burn.
     */
    function burnBatchForExchange(uint256[] memory _ids, uint256[] memory _amounts) 
        external 
        notRestricted(msg.sender) 
        whenNotPaused 
    {
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

    /**
     * @dev Burns multiple token IDs in batch for retirement, where burning these tokens effectively retires an equivalent 
     * amount of environmental credits to help the environment. Skips tokens that cannot be burned due to insufficient balance.
     * Emits BurnSkippedDueToInsufficientBalance for each token with insufficient balance.
     * Reverts if the lengths of _ids and _amounts do not match.
     * Emits BurnedForRetirement for each successfully burned token.
     * @param _ids The token IDs to burn.
     * @param _amounts The corresponding amounts of each token to burn.
     */
    function burnBatchForRetirement(uint256[] memory _ids, uint256[] memory _amounts) 
        external 
        notRestricted(msg.sender) 
        whenNotPaused 
    {
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

    /**
     * @dev Safely transfers tokens from one address to another, ensuring neither address is restricted.
     * @param _from The address from which to transfer tokens.
     * @param _to The address to which tokens are transferred.
     * @param _id The token ID to transfer.
     * @param _amount The amount of tokens to transfer.
     * @param _data Additional data to pass to the recipient contract.
     */
    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _amount, bytes memory _data) 
        public 
        override 
        notRestricted(_from) 
        notRestricted(_to) 
        whenNotPaused 
    {
        super.safeTransferFrom(_from, _to, _id, _amount, _data);
    }

    /**
     * @dev Safely transfers multiple token IDs from one address to another, ensuring neither address is restricted.
     * @param _from The address from which to transfer tokens.
     * @param _to The address to which tokens are transferred.
     * @param _ids The token IDs to transfer.
     * @param _values The amounts of tokens to transfer for each ID.
     * @param _data Additional data to pass to the recipient contract.
     */
    function safeBatchTransferFrom(address _from, address _to, uint256[] memory _ids, uint256[] memory _values, bytes memory _data) 
        public 
        override 
        notRestricted(_from) 
        notRestricted(_to) 
        whenNotPaused 
    {
        super.safeBatchTransferFrom(_from, _to, _ids, _values, _data);
    }

    /**
     * @dev Updates the URI for the token metadata.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @param _newURI The new URI to set.
     */
    function updateURI(string memory _newURI) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _setURI(_newURI);
    }

    /**
     * @dev Restricts a specific address from performing certain actions in the contract.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     * Emits AddressRestrictionUpdated upon success.
     * @param _address The address to restrict.
     */
    function restrictAddress(address _address) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (restrictedAddresses[_address]) {
            revert AddressAlreadyRestricted(_address);
        }

        restrictedAddresses[_address] = true;

        emit AddressRestrictionUpdated(_address, true);
    }

    /**
     * @dev Unrestricts a previously restricted address, allowing it to perform actions in the contract again.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     * Emits AddressRestrictionUpdated upon success.
     * @param _address The address to unrestrict.
     */
    function unrestrictAddress(address _address) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        if (!restrictedAddresses[_address]) {
            revert AddressNotRestricted(_address);
        }

        restrictedAddresses[_address] = false;

        emit AddressRestrictionUpdated(_address, false);
    }

    /**
     * @dev Checks if an address is restricted.
     * @param _address The address to check.
     * @return bool True if the address is restricted, false otherwise.
     */
    function isRestricted(address _address) 
        external 
        view 
        returns (bool) 
    {
        return restrictedAddresses[_address];
    }

    /**
     * @dev Pauses all token transfers and minting.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     */
    function pause() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers and minting.
     * Can only be called by accounts with the DEFAULT_ADMIN_ROLE.
     */
    function unpause() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _unpause();
    }

    /**
     * @dev Returns whether a specific interface is supported by the contract.
     * @param interfaceId The interface identifier.
     * @return bool True if the interface is supported, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC1155, AccessControl) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}