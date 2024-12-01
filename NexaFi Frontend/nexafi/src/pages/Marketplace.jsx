import { useState, useEffect } from 'react';
import '../styles/marketplace.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const formatPrice = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) / 1_000_000);

const formatSize = value => Number(value).toLocaleString('en-US');

const formatTotal = value => {
  const total = Number(value);
  return total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(2);
};

const OrderbookRow = ({ price, size, type }) => (
  <div className={`orderbook-row ${type}-row`}>
    <div className="orderbook-cell price-cell">{formatPrice(price)}</div>
    <div className="orderbook-cell">{formatSize(size)}</div>
    <div className="orderbook-cell">{formatTotal((Number(price) * Number(size)) / 1_000_000)}</div>
  </div>
);

const Marketplace = () => {
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [midPrice, setMidPrice] = useState(null);

  useEffect(() => {
    let ws;

    const connectWebSocket = () => {
      ws = new WebSocket(BACKEND_URL.replace('https', 'wss'));

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'SUBSCRIBE_ORDERBOOK', tokenId: '1' }));
      };

      ws.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.type === 'ORDERBOOK_SNAPSHOT') {
          setOrderbook(data.data);
          if (data.data.asks[0] && data.data.bids[0]) {
            const midPrice =
              (BigInt(data.data.asks[0].price) + BigInt(data.data.bids[0].price)) / 2n;
            setMidPrice(midPrice.toString());
          }
        }
      };

      ws.onclose = () => {
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();
    return () => ws?.close();
  }, []);

  return (
    <main className="marketplace-main">
      <header className="marketplace-main-header"></header>
      <section className="marketplace-content">
        <div className="orderbook-container">
          <div className="orderbook-header">
            <div className="orderbook-header-cell">Price</div>
            <div className="orderbook-header-cell">Amount</div>
            <div className="orderbook-header-cell">Total</div>
          </div>

          <div className="orderbook-asks">
            {orderbook.asks.map((ask, i) => (
              <OrderbookRow key={`ask-${i}`} price={ask.price} size={ask.size} type="ask" />
            ))}
          </div>

          <div className="price-indicator">
            <div className="last-price">{midPrice ? formatPrice(midPrice) : '---'}</div>
          </div>

          <div className="orderbook-bids">
            {orderbook.bids.map((bid, i) => (
              <OrderbookRow key={`bid-${i}`} price={bid.price} size={bid.size} type="bid" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Marketplace;
