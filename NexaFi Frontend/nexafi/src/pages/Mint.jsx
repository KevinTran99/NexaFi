import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mint } from '../utilities/ContractInteractions';
import Modal from '../components/Modal';
import '../styles/mint.css';

const Mint = () => {
  const { walletAddress } = useOutletContext();
  const [selectedNFT, setSelectedNFT] = useState(null);
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
      const parsedNftId = parseInt(selectedNFT);
      const parsedAmount = parseInt(amount);

      setModalMessage(
        'Approve the transaction in MetaMask to continue. \n Please don’t close this page until it’s done!'
      );
      await mint(parsedNftId, parsedAmount);
      setModalMessage('NFT minted successfully!');

      setTimeout(() => {
        setModalMessage('');
        setSelectedNFT(null);
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
    <main className="mint-main">
      <header className="mint-main-header"></header>

      <section className="mint-content">
        {currentStep === 1 && (
          <section className="mint-form">
            <h2 className="mint-form-intro-title">Mint Your NFTs</h2>
            <p className="mint-form-intro-description">
              Minting an NFT on the testnet creates a new token that simulates real-world
              environmental credits. You can test holding, trading, redeeming, or retiring these
              credits to explore the features of our platform.
            </p>

            <p className="mint-form-intro-description">
              Please note that this is a prototype and all transactions occur on the testnet. These
              are not real and do not involve actual funds or credits.
            </p>

            <p className="mint-form-intro-description-last">
              Mint responsibly and explore the capabilities of our platform in this test
              environment!
            </p>
            <button onClick={handleNext} className="acknowledge-button">
              I Understand
            </button>
          </section>
        )}

        {currentStep === 2 && (
          <>
            <section className="mint-form">
              {!walletAddress && (
                <div className="mint-not-connected">
                  <h2 className="mint-not-connected-title">Not Connected</h2>
                  <p>Please connect your wallet using the top right button to proceed.</p>
                </div>
              )}

              {walletAddress && (
                <>
                  <header className="mint-form-header">
                    <h2 className="mint-form-header-title">Select NFT</h2>
                    <p className="mint-form-header-description">Select the NFT you want to mint.</p>
                  </header>

                  <div className="mint-form-options">
                    <div
                      className={`mint-form-options-card ${selectedNFT === 1 ? 'selected' : ''}`}
                      onClick={() => setSelectedNFT(1)}
                    >
                      <h3>EUA Token</h3>
                    </div>

                    <div
                      className={`mint-form-options-card ${selectedNFT === 2 ? 'selected' : ''}`}
                      onClick={() => setSelectedNFT(2)}
                    >
                      <h3>EUAA Token</h3>
                    </div>
                  </div>
                </>
              )}
            </section>

            <div className="mint-navigation">
              <button onClick={handleBack} className="mint-navigation-btn">
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedNFT}
                className={`mint-navigation-btn ${!selectedNFT ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <section className="mint-form">
              <header className="mint-form-header">
                <h2 className="mint-form-header-title">Specify Mint Quantity</h2>
                <p className="mint-form-header-description">
                  Enter the number of NFTs you want to mint.
                </p>
              </header>

              <div>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="1"
                  className="mint-form-amount-input"
                />
              </div>
            </section>

            <div className="mint-navigation">
              <button onClick={handleBack} className="mint-navigation-btn">
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={amount <= 0}
                className={`mint-navigation-btn ${amount <= 0 ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <section className="mint-form">
              <header className="mint-form-header">
                <h2 className="mint-form-header-title">Summary</h2>
              </header>

              <div className="mint-form-summary">
                <p>Selected Option: {selectedNFT === 1 ? 'EUA Token' : 'EUAA Token'}</p>
                <p>Amount: {amount}</p>
              </div>
            </section>

            <div className="mint-navigation">
              <button onClick={handleBack} className="mint-navigation-btn">
                Back
              </button>

              <button onClick={handleSubmit} className="mint-navigation-btn mint-confirm-btn">
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

export default Mint;
