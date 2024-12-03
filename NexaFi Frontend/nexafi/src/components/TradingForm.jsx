import { useState } from 'react';
import { ethers } from 'ethers';
import '../styles/tradingform.css';
import {
  checkTokenApprovals,
  executeMarketOrder,
  createLimitOrder,
} from '../utilities/ContractInteractions';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TradingForm = ({ walletAddress }) => {
  const [buyPrice, setBuyPrice] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [status, setStatus] = useState('');

  const createOrder = async (orderType, price, amount) => {
    if (!window.ethereum) {
      setStatus('Please connect your wallet');
      return;
    }

    try {
      if (price.toString().split('.')[1]?.length > 6) {
        setStatus('Price must have 6 decimal places or less');
        return;
      }

      if (!Number.isInteger(Number(amount))) {
        setStatus('NFT amount must be a whole number');
        return;
      }

      setStatus('Checking approvals...');
      await checkTokenApprovals(orderType, price, amount, walletAddress);

      const priceInWei = ethers.parseUnits(price, 6);
      setStatus('Checking for matches...');

      const response = await fetch(`${BACKEND_URL}/api/v1/orderbook/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: '1',
          amount,
          price: priceInWei.toString(),
          buyerAddress: walletAddress,
          orderType,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setStatus(data.error || 'Failed to check for matches');
        return;
      }

      if (data.data.matches) {
        setStatus('Executing market order...');
        await executeMarketOrder(orderType, data.data.matches, walletAddress);
      } else {
        setStatus('Creating limit order...');
        await createLimitOrder(orderType, price, amount);
      }

      setStatus('Order completed successfully!');
      if (orderType === 'buy') {
        setBuyPrice('');
        setBuyAmount('');
      } else {
        setSellPrice('');
        setSellAmount('');
      }
    } catch (error) {
      console.error('Order error:', error);
      if (error.info?.error?.message?.includes('User denied transaction')) {
        setStatus('Transaction was rejected in MetaMask');
      } else if (error.message.includes('insufficient funds')) {
        setStatus('Insufficient funds for transaction');
      } else if (error.message.includes('JSON-RPC error') || error.code === 'UNKNOWN_ERROR') {
        setStatus('Network error, please try again');
      } else {
        setStatus(`Transaction failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="trading-form-container">
      <section className="trading-form-section">
        <header className="trading-form-header trading-form-buy-header">
          <h3>Buy</h3>
        </header>

        <div className="trading-form-content">
          <div className="trading-form-group">
            <label className="trading-form-label">Price (USDT)</label>
            <input
              type="number"
              className="trading-form-input "
              value={buyPrice}
              onChange={e => setBuyPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="trading-form-group">
            <label className="trading-form-label">Amount</label>
            <input
              type="number"
              className="trading-form-input"
              value={buyAmount}
              onChange={e => setBuyAmount(e.target.value)}
              placeholder="0"
              step="1"
              min="1"
            />
          </div>

          <button
            className="trading-form-button"
            onClick={() => createOrder('buy', buyPrice, buyAmount)}
            disabled={!walletAddress || !buyPrice || !buyAmount}
          >
            Place Buy Order
          </button>
        </div>
      </section>

      <section className="trading-form-section">
        <header className="trading-form-header trading-form-sell-header">
          <h3>Sell</h3>
        </header>

        <div className="trading-form-content">
          <div className="trading-form-group">
            <label className="trading-form-label">Price (USDT)</label>
            <input
              type="number"
              className="trading-form-input"
              value={sellPrice}
              onChange={e => setSellPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="trading-form-group">
            <label className="trading-form-label">Amount</label>
            <input
              type="number"
              className="trading-form-input"
              value={sellAmount}
              onChange={e => setSellAmount(e.target.value)}
              placeholder="0"
              step="1"
              min="1"
            />
          </div>

          <button
            className="trading-form-button"
            onClick={() => createOrder('sell', sellPrice, sellAmount)}
            disabled={!walletAddress || !sellPrice || !sellAmount}
          >
            Place Sell Order
          </button>
        </div>
      </section>

      {status && <div className="trading-form-status-message">{status}</div>}
    </div>
  );
};

export default TradingForm;
