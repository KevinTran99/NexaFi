import { orderbook, blockchainService } from '../startup.mjs';

const validateBalance = async (orderType, amount, price, buyerAddress) => {
  try {
    if (orderType === 'buy') {
      const balance = await blockchainService.getUSDTBalance(buyerAddress);
      const totalCost = BigInt(price) * BigInt(amount);
      return balance >= totalCost;
    } else {
      const balance = await blockchainService.getNFTBalance(buyerAddress, 1);
      return balance >= BigInt(amount);
    }
  } catch (error) {
    console.error('Error validating balance:', error);
    return false;
  }
};

export const getOrderbookByToken = (req, res) => {
  try {
    const { tokenId } = req.params;
    const orders = orderbook.getOrderbookByTokenId(tokenId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orderbook',
    });
  }
};

export const createOrderReservation = async (req, res) => {
  try {
    const { tokenId, amount, price, buyerAddress, orderType } = req.body;

    const hasBalance = await validateBalance(orderType, amount, price, buyerAddress);
    if (!hasBalance) {
      return res.status(200).json({
        success: false,
        error: `Insufficient ${orderType === 'buy' ? 'USDT' : 'NFT'} balance`,
      });
    }

    const matches =
      orderType === 'buy'
        ? orderbook.findMarketBuyMatches(tokenId, amount, price)
        : orderbook.findMarketSellMatches(tokenId, amount, price);

    if (!matches) {
      return res.status(200).json({
        success: true,
        data: { matches: null },
      });
    }

    const reservation = orderbook.createReservation(matches, buyerAddress);
    const updatedBook = orderbook.getOrderbookByTokenId(tokenId);

    req.app.locals.broadcast({
      type: 'ORDERBOOK_SNAPSHOT',
      data: { ...updatedBook, tokenId },
    });

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error('Error in createOrderReservation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create reservation',
    });
  }
};
