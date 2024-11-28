import { ethers } from 'ethers';
import { config } from '../config/config.mjs';
import marketplaceABI from '../marketplace-abi.json' assert { type: 'json' };

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
}
