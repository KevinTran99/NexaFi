import { orderbook } from '../startup.mjs';

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
