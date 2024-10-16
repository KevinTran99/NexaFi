import { useState, useEffect } from 'react';
import '../styles/hub-hero.css';
import { NavLink } from 'react-router-dom';

const currentTokenIds = 2;

const HubHero = () => {
  const [nfts, setNfts] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    const loadNFTs = async () => {
      const nftData = [];

      for (let i = 1; i <= currentTokenIds; i++) {
        try {
          const response = await fetch(`/metadata/${i}.json`);
          const data = await response.json();

          nftData.push(data);
        } catch (err) {
          console.error('Error fetching NFT data:', err);
        }
      }

      setNfts(nftData);
    };

    loadNFTs();
  }, []);

  const handleCardClick = () => {
    setCurrentCard(prevCard => (prevCard + 1) % nfts.length);
  };

  return (
    <section className="hub-hero-main">
      <div
        className="hub-hero-background"
        style={{
          backgroundImage: nfts.length > 0 ? `url(${nfts[currentCard].image})` : 'none',
        }}
      />

      <div className="hub-hero-content-container">
        <div className="hub-hero-content">
          <h1 className={`hub-hero-title ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>
            Discover & Collect Environmental NFTs
          </h1>
          <p className={`hub-hero-description ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>
            Join our vibrant marketplace to buy, trade, and invest in NFTs that represent real-world environmental
            credits.
          </p>

          <NavLink to={'/nexafihub/marketplace'} className="hub-hero-cta">
            Get Started
          </NavLink>

          <div className="hub-hero-stats">
            <div className="hub-hero-stat">
              <span className={`hub-hero-stat-value ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>240k+</span>
              <span className={`hub-hero-stat-label ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>Total Sales</span>
            </div>
            <div className="hub-hero-stat">
              <span className={`hub-hero-stat-value ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>100k+</span>
              <span className={`hub-hero-stat-label ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>Auctions</span>
            </div>
            <div className="hub-hero-stat">
              <span className={`hub-hero-stat-value ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>50k+</span>
              <span className={`hub-hero-stat-label ${nfts.length === 0 ? 'hub-nfts-empty' : ''}`}>Minted</span>
            </div>
          </div>
        </div>

        <div className="hub-nft-card" onClick={nfts.length > 0 ? handleCardClick : undefined}>
          {nfts.length > 0 && (
            <>
              <img src={nfts[currentCard].image} alt={nfts[currentCard].description} className="hub-nft-card-img" />
              <h3 className="hub-nft-card-title">{nfts[currentCard].name}</h3>
              <p className="hub-nft-card-description">
                Emission Allowance: {nfts[currentCard].attributes[0].value.replace('CO2', 'CO₂')}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HubHero;
