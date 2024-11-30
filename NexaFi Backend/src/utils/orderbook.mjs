class Orderbook {
  constructor() {
    this.ordersByToken = new Map();
    this.orderMap = new Map();
    this.reservations = new Map();
  }

  processOrders(activeOrders) {
    this.ordersByToken.clear();
    this.orderMap.clear();
    activeOrders.forEach(order => this.addOrder(order));
  }

  addOrder(order) {
    if (!this.ordersByToken.has(order.tokenId)) {
      this.ordersByToken.set(order.tokenId, { bids: [], asks: [] });
    }

    const orders = this.ordersByToken.get(order.tokenId);
    const orderList = order.isBuyOrder ? orders.bids : orders.asks;

    orderList.push(order);
    this.orderMap.set(order.orderId, order);

    orderList.sort((a, b) => {
      const priceDiff = BigInt(b.price) - BigInt(a.price);

      return order.isBuyOrder ? Number(priceDiff) : -Number(priceDiff);
    });

    return {
      tokenId: order.tokenId,
      side: order.isBuyOrder ? 'bids' : 'asks',
      price: order.price,
      size: order.amount,
    };
  }

  updateOrderFill(update) {
    const order = this.orderMap.get(update.orderId);
    if (!order) return null;

    const previousFilled = BigInt(order.filled);
    const fillAmount = BigInt(update.amount);
    const newFilled = previousFilled + fillAmount;

    if (newFilled > BigInt(order.amount)) return null;

    order.filled = newFilled.toString();

    if (newFilled === BigInt(order.amount)) {
      const orders = this.ordersByToken.get(order.tokenId);
      if (orders) {
        const orderList = order.isBuyOrder ? orders.bids : orders.asks;
        const index = orderList.findIndex(o => o.orderId === update.orderId);
        if (index !== -1) orderList.splice(index, 1);
      }
      this.orderMap.delete(update.orderId);
    }

    return {
      tokenId: order.tokenId,
      side: order.isBuyOrder ? 'bids' : 'asks',
      price: order.price,
      size: this.getPriceLevelSize(order.tokenId, order.price, order.isBuyOrder),
    };
  }

  removeOrder(orderId) {
    const order = this.orderMap.get(orderId);
    if (!order) return null;

    const orders = this.ordersByToken.get(order.tokenId);
    const orderList = order.isBuyOrder ? orders.bids : orders.asks;
    const index = orderList.findIndex(o => o.orderId === orderId);

    if (index !== -1) {
      orderList.splice(index, 1);
      this.orderMap.delete(orderId);

      return {
        tokenId: order.tokenId,
        side: order.isBuyOrder ? 'bids' : 'asks',
        price: order.price,
        size: this.getPriceLevelSize(order.tokenId, order.price, order.isBuyOrder),
      };
    }
    return null;
  }

  findMarketBuyMatches(tokenId, amount, maxPrice) {
    const orders = this.ordersByToken.get(tokenId);
    if (!orders?.asks?.length) return null;

    let remainingAmount = BigInt(amount);
    const matches = {
      orderIds: [],
      amounts: [],
      totalUsdt: 0n,
    };

    for (const ask of orders.asks) {
      if (remainingAmount <= 0n) break;

      const askPrice = BigInt(ask.price);
      if (askPrice > BigInt(maxPrice)) continue;

      const reservation = this.reservations.get(ask.orderId) || { totalReserved: 0n };
      const availableAmount = BigInt(ask.amount) - BigInt(ask.filled) - reservation.totalReserved;

      if (availableAmount <= 0n) continue;

      const fillAmount = remainingAmount > availableAmount ? availableAmount : remainingAmount;

      matches.orderIds.push(ask.orderId);
      matches.amounts.push(fillAmount.toString());
      matches.totalUsdt += fillAmount * askPrice;
      remainingAmount -= fillAmount;
    }

    return matches.orderIds.length > 0
      ? {
          orderIds: matches.orderIds,
          amounts: matches.amounts,
          totalUsdt: matches.totalUsdt.toString(),
        }
      : null;
  }

  findMarketSellMatches(tokenId, amount, minPrice) {
    const orders = this.ordersByToken.get(tokenId);
    if (!orders?.bids?.length) return null;

    let remainingAmount = BigInt(amount);
    const matches = {
      orderIds: [],
      amounts: [],
      totalUsdt: 0n,
      totalNfts: 0n,
    };

    for (const bid of orders.bids) {
      if (remainingAmount <= 0n) break;

      const bidPrice = BigInt(bid.price);
      if (bidPrice < BigInt(minPrice)) continue;

      const availableAmount = BigInt(bid.amount) - BigInt(bid.filled);
      if (availableAmount <= 0n) continue;

      const fillAmount = remainingAmount > availableAmount ? availableAmount : remainingAmount;

      matches.orderIds.push(bid.orderId);
      matches.amounts.push(fillAmount.toString());
      matches.totalUsdt += fillAmount * bidPrice;
      matches.totalNfts += fillAmount;
      remainingAmount -= fillAmount;
    }

    return matches.orderIds.length > 0
      ? {
          orderIds: matches.orderIds,
          amounts: matches.amounts,
          totalUsdt: matches.totalUsdt.toString(),
          totalNfts: matches.totalNfts.toString(),
        }
      : null;
  }

  createReservation(matches, address) {
    const reservationId = `${Date.now()}-${address}`;
    const expiresAt = Date.now() + 30000;

    matches.orderIds.forEach((orderId, index) => {
      const reservedAmount = BigInt(matches.amounts[index]);
      const reservation = this.reservations.get(orderId) || {
        totalReserved: 0n,
        reservations: [],
      };

      reservation.totalReserved += reservedAmount;
      reservation.reservations.push({
        address,
        amount: reservedAmount.toString(),
        expiresAt,
      });

      this.reservations.set(orderId, reservation);
    });

    return { reservationId, expiresAt, matches };
  }

  cleanExpiredReservations() {
    const now = Date.now();
    const updateMap = new Map();

    for (const [orderId, reservation] of this.reservations.entries()) {
      reservation.reservations = reservation.reservations.filter(res => {
        if (now <= res.expiresAt) return true;

        reservation.totalReserved -= BigInt(res.amount);
        const order = this.orderMap.get(orderId);
        const updateKey = `${order.tokenId}-${order.price}`;

        updateMap.set(updateKey, {
          tokenId: order.tokenId,
          side: order.isBuyOrder ? 'bids' : 'asks',
          price: order.price,
          size: this.getPriceLevelSize(order.tokenId, order.price, order.isBuyOrder),
        });
        return false;
      });

      if (reservation.reservations.length === 0) {
        this.reservations.delete(orderId);
      }
    }

    return Array.from(updateMap.values());
  }

  getPriceLevelSize(tokenId, price, isBuyOrder) {
    const orders = this.ordersByToken.get(tokenId);
    if (!orders) return '0';

    const orderList = isBuyOrder ? orders.bids : orders.asks;
    return orderList
      .filter(o => o.price === price)
      .reduce((total, o) => {
        let available = BigInt(o.amount) - BigInt(o.filled);
        return total + available;
      }, 0n)
      .toString();
  }

  getOrderbookByTokenId(tokenId) {
    const orders = this.ordersByToken.get(tokenId);
    if (!orders) return { bids: [], asks: [] };

    const aggregateOrders = (orderList, isBids) => {
      const priceMap = new Map();

      orderList.forEach(order => {
        const available = BigInt(order.amount) - BigInt(order.filled);
        if (available > 0n) {
          priceMap.set(order.price, (priceMap.get(order.price) || 0n) + available);
        }
      });

      return Array.from(priceMap.entries())
        .map(([price, size]) => ({ price, size: size.toString() }))
        .sort((a, b) => {
          const priceDiff = BigInt(b.price) - BigInt(a.price);
          return isBids ? Number(priceDiff) : -Number(priceDiff);
        });
    };

    return {
      bids: aggregateOrders(orders.bids, true),
      asks: aggregateOrders(orders.asks, false),
    };
  }
}

export default Orderbook;
