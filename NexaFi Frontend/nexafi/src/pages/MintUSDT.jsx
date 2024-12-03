import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mintUSDT } from '../utilities/ContractInteractions';
import Modal from '../components/Modal';
import '../styles/mint-usdt.css';

const MintUSDT = () => {
  const { walletAddress } = useOutletContext();
  const [amount, setAmount] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [modalMessage, setModalMessage] = useState('');

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setModalMessage(
        'Approve the transaction in MetaMask to continue. \n Please don’t close this page until it’s done!'
      );
      await mintUSDT(amount);
      setModalMessage('USDT minted successfully!');

      setTimeout(() => {
        setModalMessage('');
        setAmount(0);
        setCurrentStep(1);
      }, 3000);
    } catch (error) {
      if (error.message.includes('User denied transaction')) {
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
    <main className="mint-usdt-main">
      <header className="mint-usdt-main-header"></header>

      <section className="mint-usdt-content">
        {currentStep === 1 && (
          <section className="mint-usdt-form">
            <h2 className="mint-usdt-form-intro-title">Mint USDT on Testnet</h2>
            <p className="mint-usdt-form-intro-description">
              Here, you can mint USDT on the testnet to test out our marketplace.
            </p>

            <p className="mint-usdt-form-intro-description">
              Please note that this is a prototype and all transactions are on the testnet, meaning
              they are not real and will not involve actual funds.
            </p>

            <p className="mint-usdt-form-intro-description-last">
              Mint responsibly and explore the features of our marketplace in this test environment!
            </p>

            <button onClick={handleNext} className="acknowledge-button">
              I Understand
            </button>
          </section>
        )}

        {currentStep === 2 && (
          <>
            <section className="mint-usdt-form">
              {!walletAddress && (
                <div className="mint-usdt-not-connected">
                  <h2 className="mint-usdt-not-connected-title">Not Connected</h2>
                  <p>Please connect your wallet using the top right button to proceed.</p>
                </div>
              )}

              {walletAddress && (
                <>
                  <header className="mint-usdt-form-header">
                    <h2 className="mint-usdt-form-header-title">Specify Mint Quantity</h2>
                    <p className="mint-usdt-form-header-description">
                      Enter the number of USDT you want to mint.
                    </p>
                  </header>

                  <div>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="1"
                      className="mint-usdt-form-amount-input"
                    />
                  </div>
                </>
              )}
            </section>

            <div className="mint-usdt-navigation">
              <button onClick={handleBack} className="mint-usdt-navigation-btn">
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={amount <= 0}
                className={`mint-usdt-navigation-btn ${amount <= 0 ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <section className="mint-usdt-form">
              <header className="mint-usdt-form-header">
                <h2 className="mint-usdt-form-header-title">Summary</h2>
              </header>

              <div className="mint-usdt-form-summary">
                <p>Selected Option: Test USDT</p>
                <p>Amount: {amount}</p>
              </div>
            </section>

            <div className="mint-usdt-navigation">
              <button onClick={handleBack} className="mint-usdt-navigation-btn">
                Back
              </button>

              <button
                onClick={handleSubmit}
                className="mint-usdt-navigation-btn mint-usdt-confirm-btn"
              >
                Confirm
              </button>
            </div>
          </>
        )}
      </section>

      <Modal message={modalMessage} onClose={() => setModalMessage('')} />
    </main>
  );
};

export default MintUSDT;
