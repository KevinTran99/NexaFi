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
 * @notice A contract for tokenizing environmental credits as ERC1155 NFTs. Each token ID represents 
 * a specific type of environmental credit. The contract allows minting of NFTs that correspond to 
 * the actual environmental credits held by the company.
 * @dev This contract implements several security features:
 * - Only mints tokens for actually owned credits
 * - Includes address restrictions for compliance
 * - Supports both exchange and retirement of credits
 * - Maintains accurate tracking of minted and burned tokens
 * - Implements pause functionality for emergency situations
 */
contract TokenRegistry is ERC1155, AccessControl, ReentrancyGuard, Pausable {
    /// Role identifier for accounts that can mint tokens
    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");

    /// Tracks total tokens minted for each token ID
    mapping(uint256 => uint256) public totalMinted;

    /// Tracks total tokens burned for each token ID
    mapping(uint256 => uint256) public totalBurned;

    /// Tracks which addresses are restricted from using the contract
    mapping(address => bool) private restrictedAddresses;

    /// Emitted when tokens are minted
    event NFTMint(address indexed recipient, uint256 id, uint256 amount);

    /// Emitted when a mint is skipped due to recipient being restricted
    event MintSkippedDueToRestrictedAddress(address indexed recipient);

    /// Emitted when tokens are burned for exchange
    event BurnedForExchange(address indexed burner, uint256 id, uint256 amount);

    /// Emitted when tokens are burned for retirement
    event BurnedForRetirement(address indexed burner, uint256 id, uint256 amount);

    /// Emitted when a burn operation is skipped due to insufficient balance
    event BurnSkippedDueToInsufficientBalance(address indexed burner, uint256 id, uint256 balance, uint256 required);

    /// Emitted when an address's restriction status is updated
    event AddressRestrictionUpdated(address indexed restrictedAddress, bool status);

    /// Error thrown when array lengths don't match in batch operations
    error ArrayLengthsMismatch(uint256 recipientsLength, uint256 idsLength, uint256 amountsLength);

    /// Error thrown when attempting to burn more tokens than available
    error InsufficientBalanceForBurn(uint256 balance, uint256 required);

    /// Error thrown when an operation is attempted with a restricted address
    error AddressRestricted(address restrictedAddress);

    /// Error thrown when trying to restrict an already restricted address
    error AddressAlreadyRestricted(address restrictedAddress);

    /// Error thrown when trying to unrestrict an address that isn't restricted
    error AddressNotRestricted(address notRestrictedAddress);

    /**
     * @notice Ensures the specified address is not restricted
     * @param _address The address to check
     */
    modifier notRestricted(address _address) {
        if (restrictedAddresses[_address]) {
            revert AddressRestricted(_address);
        }
        _;
    }

    /**
     * @notice Creates a new TokenRegistry contract
     * @dev Initializes with base URI for token metadata and grants admin and mint roles to deployer
     */
    constructor() ERC1155("https://nexafi.vercel.app/metadata/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINT_ROLE, msg.sender);
    }

    /**
     * @notice Mints new tokens to a recipient representing environmental credits
     * @dev All addresses can mint for testing purposes. Tracks total minted tokens for each ID.
     * Reverts with AddressRestricted if the recipient is restricted.
     * Emits NFTMint on successful mint.
     * @param _recipient The address to receive the minted tokens
     * @param _id The token ID to mint
     * @param _amount The amount of tokens to mint
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
     * @notice Mints multiple tokens to multiple recipients in a single transaction
     * @dev Automatically skips any restricted addresses. Only accessible by addresses with MINT_ROLE.
     * Reverts with ArrayLengthsMismatch if input arrays have different lengths.
     * Emits NFTMint for each successful mint and MintSkippedDueToRestrictedAddress for skipped addresses.
     * @param _recipients The addresses to receive the minted tokens
     * @param _ids The token IDs to mint
     * @param _amounts The amounts of tokens to mint
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
     * @notice Burns tokens to receive equivalent real-world environmental credits
     * @dev Used when a token holder wants to exchange their tokens for actual environmental credits
     * held in a designated registry account. This effectively "swaps" the tokens back to real credits.
     * Reverts with AddressRestricted if caller is restricted.
     * Reverts with InsufficientBalanceForBurn if caller's balance is insufficient.
     * Emits BurnedForExchange on successful burn.
     * @param _id The token ID to burn
     * @param _amount The amount of tokens to burn
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
     * @notice Burns tokens to permanently retire the environmental credits
     * @dev Used when a token holder wants to retire the environmental credits to benefit the environment.
     * Unlike burnForExchange, these credits are permanently retired and cannot be reused.
     * Reverts with AddressRestricted if caller is restricted.
     * Reverts with InsufficientBalanceForBurn if caller's balance is insufficient.
     * Emits BurnedForRetirement on successful burn.
     * @param _id The token ID to burn
     * @param _amount The amount of tokens to burn
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
     * @notice Burns multiple tokens to receive equivalent real-world credits
     * @dev Batch version of burnForExchange that processes multiple tokens in one transaction.
     * Skips any tokens where the caller has insufficient balance.
     * Reverts with AddressRestricted if caller is restricted.
     * Emits BurnedForExchange for each successful burn and BurnSkippedDueToInsufficientBalance for skipped tokens.
     * @param _ids The token IDs to burn
     * @param _amounts The amounts of each token to burn
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
     * @notice Burns multiple tokens for permanent retirement
     * @dev Batch version of burnForRetirement that processes multiple tokens in one transaction.
     * Skips any tokens where the caller has insufficient balance.
     * Reverts with AddressRestricted if caller is restricted.
     * Emits BurnedForRetirement for each successful burn and BurnSkippedDueToInsufficientBalance for skipped tokens.
     * @param _ids The token IDs to burn
     * @param _amounts The amounts of each token to burn
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
     * @notice Transfers tokens from one address to another
     * @dev Overrides ERC1155 safeTransferFrom to add restriction checks.
     * Reverts with AddressRestricted if either the sender or receiver is restricted.
     * @param _from The address to transfer from
     * @param _to The address to transfer to
     * @param _id The token ID to transfer
     * @param _amount The amount of tokens to transfer
     * @param _data Additional data with no specified format
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
     * @notice Transfers multiple tokens between addresses
     * @dev Overrides ERC1155 safeBatchTransferFrom to add restriction checks.
     * Reverts with AddressRestricted if either the sender or receiver is restricted.
     * @param _from The address to transfer from
     * @param _to The address to transfer to
     * @param _ids Array of token IDs to transfer
     * @param _values Array of amounts to transfer for each token ID
     * @param _data Additional data with no specified format
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
     * @notice Updates the base URI for token metadata
     * @dev Only callable by contract admin. Updates the base URI for all tokens.
     * New URI should maintain the {id} placeholder for token IDs.
     * @param _newURI The new base URI to set
     */
    function updateURI(string memory _newURI) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _setURI(_newURI);
    }

    /**
     * @notice Restricts an address from interacting with the contract
     * @dev Used for compliance purposes to prevent certain addresses from using the contract.
     * Only callable by contract admin.
     * Reverts with AddressAlreadyRestricted if the address is already restricted.
     * Emits AddressRestrictionUpdated event.
     * @param _address The address to restrict
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
     * @notice Removes restrictions from an address
     * @dev Allows a previously restricted address to interact with the contract again.
     * Only callable by contract admin.
     * Reverts with AddressNotRestricted if the address isn't restricted.
     * Emits AddressRestrictionUpdated event.
     * @param _address The address to unrestrict
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
     * @notice Checks if an address is restricted
     * @dev Used to verify if an address can interact with the contract.
     * @param _address The address to check
     * @return bool True if the address is restricted, false otherwise
     */
    function isRestricted(address _address) 
        external 
        view 
        returns (bool) 
    {
        return restrictedAddresses[_address];
    }

    /**
     * @notice Pauses all token operations
     * @dev Used in emergency situations to freeze all token transfers, mints, and burns.
     * Only callable by contract admin.
     * Emits Paused event from Pausable contract.
     */
    function pause() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _pause();
    }

    /**
     * @notice Resumes all token operations
     * @dev Lifts the pause on all token operations.
     * Only callable by contract admin.
     * Emits Unpaused event from Pausable contract.
     */
    function unpause() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        _unpause();
    }

    /**
     * @notice Checks interface support
     * @dev Implementation of ERC165 interface detection.
     * Supports ERC1155 and AccessControl interfaces.
     * @param interfaceId The interface identifier to check
     * @return bool True if the interface is supported
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