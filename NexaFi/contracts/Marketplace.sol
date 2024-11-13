// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/*
    This contract is proprietary and not licensed for public use, modification, or distribution.
    All rights reserved by the contract owner.
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Marketplace
 * @notice A decentralized marketplace for trading ERC1155 tokens using USDT
 * @dev This contract implements:
 * - Order book functionality for ERC1155 tokens
 * - Support for both buy and sell orders
 * - Partial order filling
 * - Safe token transfers with reentrancy protection
 * - USDT-based pricing and settlement
 */
contract Marketplace is ReentrancyGuard, ERC1155Holder{
    /// Counter for generating unique order IDs
    uint256 public orderId;
    
    /// Reference to the USDT token contract used for payments
    IERC20 public immutable usdt;

    /// Reference to the ERC1155 contract containing the NFTs being traded
    IERC1155 public immutable tokenRegistry;
    
    /**
     * @notice Trading order information
     * @param orderId Unique identifier for the order
     * @param maker Address that created the order
     * @param isBuyOrder True if this is a buy order, false for sell order
     * @param tokenId ID of the ERC1155 token being traded
     * @param price Price per token in USDT (6 decimals)
     * @param amount Total amount of tokens in the order
     * @param filled Amount of tokens already filled
     */
    struct Order {
        uint256 orderId;
        address maker;
        bool isBuyOrder;
        uint256 tokenId;
        uint256 price;
        uint256 amount;
        uint256 filled;
    }
    
    /// Array containing all active (partially or unfilled) orders in the marketplace
    Order[] public activeOrders;

    /// Mapping from order ID to its index in the activeOrders array
    mapping(uint256 => uint256) public orderIdToIndex;  // orderId => index
    
    /// Emitted when a new order is created
    event OrderCreated(
        uint256 indexed orderId,
        address indexed maker,
        uint256 indexed tokenId,
        bool isBuyOrder,
        uint256 price,
        uint256 amount,
        uint256 timestamp
    );

    /// Emitted when an order is partially or fully filled
    event OrderFilled(
        uint256 indexed orderId,
        address indexed maker,
        address indexed taker,
        uint256 tokenId,
        bool isBuyOrder,
        uint256 price,
        uint256 amount,
        uint256 timestamp
    );
    
    /// Emitted when an order is cancelled by its maker
    event OrderCancelled(
        uint256 indexed orderId,
        address indexed maker,
        uint256 timestamp
    );

    /**
     * @notice Creates a new marketplace instance
     * @dev Initializes the contract by setting the USDT and TokenRegistry contract addresses
     * Both addresses must be non-zero and represent valid contracts
     * @param _usdt Address of the USDT contract
     * @param _tokenRegistry Address of the ERC1155 token registry contract
     */
    constructor(address _usdt, address _tokenRegistry) {
        usdt = IERC20(_usdt);
        tokenRegistry = IERC1155(_tokenRegistry);
    }
    
    /**
     * @notice Creates a new buy order for tokens
     * @dev Locks the USDT payment in the contract until the order is filled or cancelled.
     * Reverts if:
     * - Price or amount is zero
     * - USDT transfer fails
     * Emits OrderCreated event on success.
     * @param _tokenId ID of the token to buy
     * @param _price Price per token in USDT
     * @param _amount Amount of tokens to buy
     * @return uint256 ID of the created order
     */
    function createBuyOrder(uint256 _tokenId, uint256 _price, uint256 _amount) 
        external 
        nonReentrant 
        returns (uint256)
    {
        require(_price > 0, "Invalid price");
        require(_amount > 0, "Invalid amount");
        
        uint256 totalCost = _price * _amount;
        require(usdt.transferFrom(msg.sender, address(this), totalCost), "USDT transfer failed");
        
        orderId++;
        
        orderIdToIndex[orderId] = activeOrders.length;
        activeOrders.push(Order({
            orderId: orderId,
            maker: msg.sender,
            tokenId: _tokenId,
            isBuyOrder: true,
            price: _price,
            amount: _amount,
            filled: 0
        }));
        
        emit OrderCreated(
            orderId,
            msg.sender,
            _tokenId,
            true,
            _price,
            _amount,
            block.timestamp
        );
        
        return orderId;
    }

    /**
     * @notice Creates a new sell order for tokens
     * @dev Locks the tokens in the contract until the order is filled or cancelled.
     * Reverts if:
     * - Price or amount is zero
     * - Token transfer fails
     * Emits OrderCreated event on success.
     * @param _tokenId ID of the token to sell
     * @param _price Price per token in USDT
     * @param _amount Amount of tokens to sell
     * @return uint256 ID of the created order
     */
    function createSellOrder(uint256 _tokenId, uint256 _price, uint256 _amount) 
        external 
        nonReentrant 
        returns (uint256)
    {
        require(_price > 0, "Invalid price");
        require(_amount > 0, "Invalid amount");
        
        tokenRegistry.safeTransferFrom(
            msg.sender, 
            address(this), 
            _tokenId, 
            _amount, 
            ""
        );
        
        orderId++;
        
        orderIdToIndex[orderId] = activeOrders.length;
        activeOrders.push(Order({
            orderId: orderId,
            maker: msg.sender,
            isBuyOrder: false,
            tokenId: _tokenId,
            price: _price,
            amount: _amount,
            filled: 0
        }));
        
        emit OrderCreated(
            orderId,
            msg.sender,
            _tokenId,
            false,
            _price,
            _amount,
            block.timestamp
        );
        
        return orderId;
    }

    /**
     * @notice Executes market buy orders against existing sell orders
     * @dev Processes multiple orders in a single transaction, skipping invalid ones.
     * Reverts if:
     * - Input arrays are empty or have different lengths
     * - Total USDT amount is zero
     * - USDT transfer fails
     * Emits OrderFilled for each successful fill.
     * Returns unused USDT to caller.
     * @param _orderIds Array of order IDs to buy from
     * @param _amounts Array of amounts to buy from each order
     * @param _totalUsdt Total USDT to spend on purchases
     */
    function marketBuy(uint256[] calldata _orderIds, uint256[] calldata _amounts, uint256 _totalUsdt) 
        external 
        nonReentrant 
    {
        require(_orderIds.length > 0 && _orderIds.length == _amounts.length, "Invalid input");
        require(_totalUsdt > 0, "Invalid USDT amount");
        
        require(usdt.transferFrom(msg.sender, address(this), _totalUsdt),
            "USDT transfer failed");
        
        uint256 remainingUsdt = _totalUsdt;
        
        unchecked {
            for (uint256 i = 0; i < _orderIds.length; i++) {
                Order storage order = activeOrders[orderIdToIndex[_orderIds[i]]];
                uint256 amountWanted = _amounts[i];
                
                if (order.orderId != _orderIds[i] ||
                    order.isBuyOrder ||
                    order.amount - order.filled < amountWanted ||
                    amountWanted == 0) {
                    continue;
                }
                
                uint256 orderCost = amountWanted * order.price;
                
                if (orderCost > remainingUsdt) {
                    continue;
                }
                
                require(usdt.transfer(order.maker, orderCost),
                    "USDT transfer to seller failed");
                
                tokenRegistry.safeTransferFrom(
                    address(this),
                    msg.sender,
                    order.tokenId,
                    amountWanted,
                    ""
                );
                
                order.filled += amountWanted;
                remainingUsdt -= orderCost;
                
                emit OrderFilled(
                    order.orderId,
                    order.maker,
                    msg.sender,
                    order.tokenId,
                    order.isBuyOrder,
                    order.price,
                    amountWanted,
                    block.timestamp
                );
                
                if (order.filled == order.amount) {
                    removeOrder(orderIdToIndex[_orderIds[i]], _orderIds[i]);
                }
            }
        }
        
        if (remainingUsdt > 0) {
            require(usdt.transfer(msg.sender, remainingUsdt),
                "USDT refund failed");
        }
    }

    /**
     * @notice Executes market sell orders against existing buy orders
     * @dev Processes multiple orders in a single transaction, skipping invalid ones.
     * Reverts if:
     * - Input arrays are empty or have different lengths
     * - Total NFT amount is zero
     * - Token transfers fail
     * Emits OrderFilled for each successful fill.
     * Returns unused NFTs to caller.
     * @param _orderIds Array of order IDs to sell to
     * @param _amounts Array of amounts to sell to each order
     * @param _totalNfts Total number of NFTs to sell
     * @param _tokenId ID of the token being sold
     */
    function marketSell(uint256[] calldata _orderIds, uint256[] calldata _amounts, uint256 _totalNfts, uint256 _tokenId) 
        external 
        nonReentrant 
    {
        require(_orderIds.length > 0 && _orderIds.length == _amounts.length, "Invalid input");
        require(_totalNfts > 0, "Invalid NFT amount");
        
        tokenRegistry.safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId,
            _totalNfts,
            ""
        );
        
        uint256 remainingNfts = _totalNfts;
        
        unchecked {
            for (uint256 i = 0; i < _orderIds.length; i++) {
                Order storage order = activeOrders[orderIdToIndex[_orderIds[i]]];
                uint256 amountWanted = _amounts[i];

                if (order.orderId != _orderIds[i] ||
                    !order.isBuyOrder ||
                    order.amount - order.filled < amountWanted ||
                    amountWanted == 0) {
                    continue;
                }
                
                if (amountWanted > remainingNfts) {
                    continue;
                }
                
                uint256 usdtAmount = amountWanted * order.price;
                
                require(usdt.transfer(msg.sender, usdtAmount),
                    "USDT transfer failed");
                
                tokenRegistry.safeTransferFrom(
                    address(this),
                    order.maker,
                    order.tokenId,
                    amountWanted,
                    ""
                );
                
                order.filled += amountWanted;
                remainingNfts -= amountWanted;
                
                emit OrderFilled(
                    order.orderId,
                    order.maker,
                    msg.sender,
                    order.tokenId,
                    order.isBuyOrder,
                    order.price,
                    amountWanted,
                    block.timestamp
                );
                
                if (order.filled == order.amount) {
                    removeOrder(orderIdToIndex[_orderIds[i]], _orderIds[i]);
                }
            }
        }
        
        if (remainingNfts > 0) {
            tokenRegistry.safeTransferFrom(
                address(this),
                msg.sender,
                _tokenId,
                remainingNfts,
                ""
            );
        }
    }
    
    /**
     * @notice Internal helper to remove an order from the active orders array
     * @dev Swaps with last element and updates mappings for gas efficiency.
     * Updates the index mapping for the swapped order.
     * Removes the old order mapping completely.
     * This pattern saves gas by avoiding array shifts.
     * @param index Index of the order in the activeOrders array
     * @param _orderId ID of the order to remove
     */
    function removeOrder(uint256 index, uint256 _orderId) internal {
        
        activeOrders[index] = activeOrders[activeOrders.length - 1];
        
        orderIdToIndex[activeOrders[index].orderId] = index;
        
        activeOrders.pop();
        
        delete orderIdToIndex[_orderId];
    }

    /**
     * @notice Returns all orders currently active in the marketplace
     * @dev Used to efficiently fetch the entire orderbook state in a single call.
     * Includes both buy and sell orders that haven't been fully filled or cancelled.
     * @return Order[] Array containing all active orders with their current state
     */
    function getActiveOrders() public view returns (Order[] memory) {
        return activeOrders;
    }

    /**
     * @notice Cancels an existing order and returns tokens to the maker
     * @dev Only the maker of the order can cancel it.
     * Reverts if:
     * - Caller is not the order maker
     * - Token/USDT returns fail
     * Emits OrderCancelled event on success.
     * @param _orderId ID of the order to cancel
     */
    function cancelOrder(uint256 _orderId) 
        external 
        nonReentrant 
    {
        uint256 index = orderIdToIndex[_orderId];
        Order storage order = activeOrders[index];
        require(order.maker == msg.sender, "Not order maker");
        
        if (order.isBuyOrder) {
            uint256 remainingUsdt = (order.amount - order.filled) * order.price;
            if (remainingUsdt > 0) {
                require(usdt.transfer(msg.sender, remainingUsdt),
                    "USDT return failed");
            }
        } else {
            uint256 remainingNfts = order.amount - order.filled;
            if (remainingNfts > 0) {
                tokenRegistry.safeTransferFrom(
                    address(this),
                    msg.sender,
                    order.tokenId,
                    remainingNfts,
                    ""
                );
            }
        }
        
        removeOrder(index, _orderId);
        
        emit OrderCancelled(_orderId, msg.sender, block.timestamp);
    }
}