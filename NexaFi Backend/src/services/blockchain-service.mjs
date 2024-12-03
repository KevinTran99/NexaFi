import { ethers } from 'ethers';
import { config } from '../config/config.mjs';
import marketplaceABI from '../marketplace-abi.json' with { type: 'json' };

export default class BlockchainService {
  constructor() {
    this.initializeConnection();
  }

  initializeConnection() {
    this.wsProvider = new ethers.WebSocketProvider(
      `wss://eth-sepolia.g.alchemy.com/v2/${config.ALCHEMY_KEY}`
    );
    this.marketplaceContract = new ethers.Contract(
      config.MARKETPLACE_ADDRESS,
      marketplaceABI,
      this.wsProvider
    );
    this.usdtContract = new ethers.Contract(
      config.USDT_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      this.wsProvider
    );
    this.tokenRegistryContract = new ethers.Contract(
      config.TOKEN_REGISTRY_ADDRESS,
      ['function balanceOf(address, uint256) view returns (uint256)'],
      this.wsProvider
    );
    
    this.wsProvider.on('error', () => {
      setTimeout(() => this.initializeConnection(), 5000);
    });
  }

  async initialize() {
    const activeOrders = await this.marketplaceContract.getActiveOrders();
    return activeOrders.map(order => ({
      orderId: order.orderId.toString(),
      maker: order.maker,
      tokenId: order.tokenId.toString(),
      isBuyOrder: order.isBuyOrder,
      price: order.price.toString(),
      amount: order.amount.toString(),
      filled: order.filled.toString(),
      timestamp: Math.floor(Date.now() / 1000).toString(),
    }));
  }

  async getUSDTBalance(address) {
    return await this.usdtContract.balanceOf(address);
  }

  async getNFTBalance(address, tokenId) {
    return await this.tokenRegistryContract.balanceOf(address, tokenId);
  }

  listenToEvents({ onOrderCreated, onOrderFilled, onOrderCancelled }) {
    this.marketplaceContract.on(
      'OrderCreated',
      (orderId, maker, tokenId, isBuyOrder, price, amount, timestamp) => {
        onOrderCreated({
          orderId: orderId.toString(),
          maker,
          tokenId: tokenId.toString(),
          isBuyOrder,
          price: price.toString(),
          amount: amount.toString(),
          filled: '0',
          timestamp: timestamp.toString(),
        });
      }
    );

    this.marketplaceContract.on(
      'OrderFilled',
      (orderId, maker, taker, tokenId, isBuyOrder, price, amount, timestamp) => {
        onOrderFilled({
          orderId: orderId.toString(),
          maker,
          taker,
          tokenId: tokenId.toString(),
          isBuyOrder,
          price: price.toString(),
          amount: amount.toString(),
          timestamp: timestamp.toString(),
        });
      }
    );

    this.marketplaceContract.on('OrderCancelled', (orderId, maker, timestamp) => {
      onOrderCancelled({
        orderId: orderId.toString(),
        maker,
        timestamp: timestamp.toString(),
      });
    });
  }
}
