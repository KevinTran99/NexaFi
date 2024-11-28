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
