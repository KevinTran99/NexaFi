import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { burnForExchange, burnForRetirement, fetchNFTs } from '../utilities/ContractInteractions';
import Modal from '../components/Modal';
import '../styles/burn.css';

const Burn = () => {
  const { walletAddress, nfts, setNfts } = useOutletContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount] = useState(0);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const loadNFTs = async () => {
      if (walletAddress) {
        try {
          const nftsData = await fetchNFTs(walletAddress);
          setNfts(nftsData);
        } catch (err) {
          console.error('Error loading NFTs:', err);
        }
      } else {
        setNfts([]);
      }
    };

    loadNFTs();
  }, [walletAddress, setNfts]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleNextCard = () => {
    setCurrentCard(prevCard => (prevCard + 1) % nfts.length);
  };

  const handlePrevCard = () => {
    setCurrentCard(prevCard => (prevCard - 1 + nfts.length) % nfts.length);
  };

  const handleSubmit = async () => {
    try {
      const parsedAmount = parseInt(amount);
      const balance = selectedNFT ? selectedNFT.balance : 0;

      if (parsedAmount > balance) {
        setModalMessage('Insufficient NFT balance');
        return;
      }

      setModalMessage(
        'Approve the transaction in MetaMask to continue. \n Please don’t close this page until it’s done!'
      );

      if (selectedOption === 'Retire') {
        await burnForRetirement(selectedNFT.id, parsedAmount);
        setModalMessage('NFTs retired successfully!');
      } else if (selectedOption === 'Redeem') {
        await burnForExchange(selectedNFT.id, parsedAmount);
        setModalMessage('NFTs redeemed successfully!');
      }

      setTimeout(() => {
        setModalMessage('');
        setCurrentStep(1);
        setCurrentCard(0);
        setSelectedNFT(null);
        setSelectedOption(null);
        setAmount(0);
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
    <main className="burn-main">
      <header className="burn-main-header"></header>

      <section className="burn-content">
        {currentStep === 1 && (
          <section className="burn-form">
            <h1 className="burn-form-intro-title">Burn Your NFTs</h1>
            <p className="burn-form-intro-description">
              Burning your NFT on the testnet permanently removes it, simulating the removal of
              real-world environmental credits. This feature allows you to test our platform’s
              sustainability tools.
            </p>

            <p className="burn-form-intro-description">
              Please note that this is a prototype and all transactions occur on the testnet. These
              are not real and do not involve actual funds or credits.
            </p>

            <p className="burn-form-intro-description-last">
              Proceed with caution and explore our features in this safe, test environment!
            </p>
            <button onClick={handleNext} className="acknowledge-button">
              I Understand
            </button>
          </section>
        )}

        {currentStep === 2 && (
          <>
            <section className="burn-form">
              {!walletAddress && (
                <div className="burn-not-connected">
                  <h2 className="burn-not-connected-title">Not Connected</h2>
                  <p>Please connect your wallet using the top right button to proceed.</p>
                </div>
              )}

              {walletAddress && nfts.length === 0 && (
                <div className="burn-nft-empty">
                  <h2 className="burn-nft-empty-title">
                    No Environmental NFTs found in your wallet.
                  </h2>
                  <p className="burn-nft-empty-description">
                    It looks like you don't have any environmental NFTs yet. Start exploring the
                    marketplace to begin your collection.
                  </p>
                </div>
              )}

              {walletAddress && nfts.length > 0 && (
                <>
                  <header className="burn-form-header">
                    <h2 className="burn-form-header-title">Select NFT</h2>
                    <p className="burn-form-header-description">
                      Select an NFT from your collection to continue with the burn process.
                    </p>
                  </header>

                  <div className="burn-nft-gallery">
                    <button onClick={handlePrevCard} className="burn-arrow-left">
                      {'<'}
                    </button>

                    <div className="burn-nft-display">
                      {(nfts.length > 1
                        ? [nfts[currentCard], nfts[(currentCard + 1) % nfts.length]]
                        : [nfts[currentCard]]
                      ).map(nft => (
                        <div
                          key={nft.id}
                          className={`burn-nft-card ${
                            selectedNFT?.id === nft.id ? 'selected' : ''
                          }`}
                          onClick={() => setSelectedNFT(nft)}
                        >
                          {nft.balance > 1 && (
                            <span className="burn-nft-balance">{nft.balance}</span>
                          )}
                          <img
                            src={nft.metadata.image}
                            alt={nft.metadata.name}
                            className="burn-nft-img"
                          />
                          <h3 className="burn-nft-title">{nft.metadata.name}</h3>
                          <p className="burn-nft-description">
                            Emission Allowance:{' '}
                            {nft.metadata.attributes[0].value.replace('CO2', 'CO₂')}
                          </p>
                        </div>
                      ))}
                    </div>

                    <button onClick={handleNextCard} className="burn-arrow-right">
                      {'>'}
                    </button>
                  </div>
                </>
              )}
            </section>

            <div className="burn-navigation">
              <button onClick={handleBack} className="burn-navigation-btn">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedNFT}
                className={`burn-navigation-btn ${!selectedNFT ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <section className="burn-form">
              <header className="burn-form-header">
                <h2 className="burn-form-header-title">Choose Burn Action</h2>
                <p className="burn-form-header-description">
                  Select whether to burn this NFT for environmental credits or to retire it for
                  sustainability support.
                </p>
              </header>

              <div className="burn-form-options">
                <div
                  className={`burn-form-options-card ${
                    selectedOption === 'Retire' ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedOption('Retire');
                  }}
                >
                  <h3>Burn for Retirement</h3>
                </div>

                <div
                  className={`burn-form-options-card ${
                    selectedOption === 'Redeem' ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedOption('Redeem');
                  }}
                >
                  <h3>Burn to redeem credits</h3>
                </div>
              </div>
            </section>

            <div className="burn-navigation">
              <button onClick={handleBack} className="burn-navigation-btn">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className={`burn-navigation-btn ${!selectedOption ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentStep === 4 && (
          <>
            <section className="burn-form">
              <header className="burn-form-header">
                <h2 className="burn-form-header-title">Specify Burn Quantity</h2>
                <p className="burn-form-header-description">
                  Enter the number of NFTs you want to{' '}
                  {selectedOption === 'Retire' ? 'retire' : 'redeem'}.
                </p>
              </header>

              <div className="burn-form-amount-container">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="1"
                  className="burn-form-amount-input"
                />
              </div>
            </section>

            <div className="burn-navigation">
              <button onClick={handleBack} className="burn-navigation-btn">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={amount <= 0}
                className={`burn-navigation-btn ${amount <= 0 ? 'disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {currentStep === 5 && (
          <>
            <section className="burn-form">
              <header className="burn-form-header">
                <h2 className="burn-form-header-title">Summary</h2>
              </header>

              <div className="burn-form-summary">
                <div className="burn-summary-nft">
                  {amount > 1 && <span className="burn-summary-nft-balance">{amount}</span>}
                  <img
                    src={selectedNFT.metadata.image}
                    alt={selectedNFT.metadata.name}
                    className="burn-summary-nft-img"
                  />
                  <h3 className="burn-summary-nft-title">{selectedNFT.metadata.name}</h3>
                  <p className="burn-summary-nft-description">
                    Emission Allowance:{' '}
                    {selectedNFT.metadata.attributes[0].value.replace('CO2', 'CO₂')}
                  </p>
                </div>

                <div className="burn-options-summary">
                  <p>Selected Option: {selectedOption}</p>
                  <p>Amount: {amount}</p>
                </div>
              </div>
            </section>

            <div className="burn-navigation">
              <button onClick={handleBack} className="burn-navigation-btn">
                Back
              </button>
              <button onClick={handleSubmit} className="burn-navigation-btn">
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

export default Burn;
