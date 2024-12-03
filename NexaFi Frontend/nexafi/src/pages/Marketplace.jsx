import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ethers } from 'ethers';
import { fetchNFTs, fetchUSDTBalance } from '../utilities/ContractInteractions';
import TradingForm from '../components/TradingForm';
import PriceChart from '../components/PriceChart';
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
  const { walletAddress } = useOutletContext();
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [midPrice, setMidPrice] = useState(null);
  const [balances, setBalances] = useState({ usdt: '0', nft: '0' });

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

  useEffect(() => {
    const loadBalances = async () => {
      if (walletAddress) {
        try {
          const [nfts, usdtBalance] = await Promise.all([
            fetchNFTs(walletAddress),
            fetchUSDTBalance(walletAddress),
          ]);

          const nft = nfts.find(nft => nft.id === 1);

          setBalances({
            usdt: usdtBalance,
            nft: nft ? nft.balance.toString() : '0',
          });
        } catch (err) {
          console.error('Error loading balances:', err);
        }
      } else {
        setBalances({ usdt: '0', nft: '0' });
      }
    };

    loadBalances();
  }, [walletAddress]);

  return (
    <main className="marketplace-main">
      <header className="marketplace-main-header"></header>
      <section className="marketplace-content">
        <section className="marketplace-overview"></section>

        <section className="market-main">
          <section className="orderbook-section">
            <header className="orderbook-header">
              <div className="orderbook-header-cell">Price</div>
              <div className="orderbook-header-cell">Amount</div>
              <div className="orderbook-header-cell">Total</div>
            </header>

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
          </section>

          <section className="trading-dashboard">
            <div className="chart-container">
              <PriceChart />
            </div>

            <div className="balance-display-container">
              <div className="balance-item">
                <span className="balance-label">USDT Balance:</span>
                <span className="balance-value">
                  {parseFloat(ethers.formatUnits(balances.usdt, 6)).toFixed(2)}
                </span>
              </div>

              <div className="balance-item">
                <span className="balance-label">NFT Balance:</span>
                <span className="balance-value">{balances.nft}</span>
              </div>
            </div>

            <TradingForm walletAddress={walletAddress} />
          </section>
        </section>
      </section>
    </main>
  );
};

export default Marketplace;
