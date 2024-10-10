import { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import { useOutletContext } from 'react-router-dom';
import { fetchNFTs } from '../utilities/ContractInteractions';

const Dashboard = () => {
  const { walletAddress, nfts, setNfts } = useOutletContext();
  const [status, setStatus] = useState();

  useEffect(() => {
    const loadNFTs = async () => {
      if (walletAddress) {
        try {
          const nftsData = await fetchNFTs(walletAddress);
          setNfts(nftsData);
          setStatus('');
        } catch (err) {
          setStatus('Failed to load NFTs.');
        }
      } else {
        setNfts([]);
        setStatus(
          <>
            <h1>Not Connected</h1>
            <p>Please connect your wallet using the top right button to view the dashboard.</p>
          </>
        );
      }
    };

    loadNFTs();
  }, [walletAddress, setNfts]);

  return (
    <main className="dashboard-main">
      <header className="dashboard-main-header">
        <img src={'/jungle.png'} alt="Lush green jungle forest" className="dashboard-header-background" />

        <div className="profile-container">
          <div className="profile-content">
            <img src={'/earth-icon.png'} alt="icon of a globe" className="profile-image" />
            <p className="profile-name">
              {walletAddress &&
                ` ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
            </p>{' '}
          </div>
        </div>
      </header>

      {!walletAddress && <section className="dashboard-content not-connected">{status}</section>}

      {walletAddress && walletAddress.length > 0 && (
        <section className="dashboard-content">
          <header className="dashboard-content-header">
            <div className="stat-card">
              <h3 className="stat-value">{nfts.reduce((acc, nft) => acc + parseInt(nft.balance, 10), 0)}</h3>
              <p className="stat-label">Total NFTs Owned</p>
            </div>

            <div className="stat-card">
              <h3 className="stat-value">{nfts.length}</h3>
              <p className="stat-label"> Total Unique NFTs</p>
            </div>
          </header>

          {nfts.length === 0 && (
            <section className="nft-empty">
              <h2 className="empty-msg-title">No Environmental NFTs found in your wallet.</h2>
              <p>
                It looks like you don't have any environmental NFTs yet. Start exploring the marketplaces to begin your
                collection.
              </p>
            </section>
          )}

          <section className="nft-grid">
            {nfts.length > 0 &&
              nfts.map(nft => (
                <article key={nft.id} className="nft-card">
                  {nft.balance > 1 && <span className="nft-balance">{nft.balance}</span>}

                  <img src={nft.metadata.image} alt={nft.metadata.description} className="nft-card-img" />

                  <h3 className="nft-card-title">{nft.metadata.name}</h3>
                  <p className="nft-card-description">
                    Emission Allowance: {nft.metadata.attributes[0].value.replace('CO2', 'CO₂')}
                  </p>
                </article>
              ))}
          </section>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
