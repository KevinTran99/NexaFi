import { useState } from 'react';
import { ethers } from 'ethers';
import '../styles/tradingform.css';
import {
  checkTokenApprovals,
  executeMarketOrder,
  createLimitOrder,
} from '../utilities/ContractInteractions';
import Modal from './Modal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TradingForm = ({ walletAddress }) => {
  const [buyPrice, setBuyPrice] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const createOrder = async (orderType, price, amount) => {
    if (!window.ethereum) {
      setModalMessage('Please connect your wallet');
      return;
    }

    try {
      if (price.toString().split('.')[1]?.length > 6) {
        setModalMessage('Price must have 6 decimal places or less');
        return;
      }

      if (!Number.isInteger(Number(amount))) {
        setModalMessage('NFT amount must be a whole number');
        return;
      }

      setModalMessage('Checking approvals...');
      await checkTokenApprovals(orderType, price, amount, walletAddress);

      const priceInWei = ethers.parseUnits(price, 6);
      setModalMessage('Checking for matches...');

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
        setModalMessage(data.error || 'Failed to check for matches');
        return;
      }

      if (data.data.matches) {
        setModalMessage(
          'Order reserved for 30 seconds \n Approve in MetaMask to execute the order'
        );
        await executeMarketOrder(orderType, data.data.matches, walletAddress);
      } else {
        setModalMessage('Approve in MetaMask to create limit order');
        await createLimitOrder(orderType, price, amount);
      }

      setModalMessage('Order completed successfully!');
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
        setModalMessage('Transaction was rejected in MetaMask');
      } else if (error.message.includes('insufficient funds')) {
        setModalMessage('Insufficient funds for transaction');
      } else if (error.message.includes('JSON-RPC error') || error.code === 'UNKNOWN_ERROR') {
        setModalMessage('Network error, please try again');
      } else {
        setModalMessage(`Transaction failed: ${error.message}`);
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

      <Modal message={modalMessage} onClose={() => setModalMessage('')} />
    </div>
  );
};

export default TradingForm;
