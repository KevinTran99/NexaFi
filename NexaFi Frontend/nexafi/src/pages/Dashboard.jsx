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
      {!walletAddress && <section className="dashboard-section not-connected">{status}</section>}

      {walletAddress && walletAddress.length > 0 && (
        <section className="dashboard-section wallet-connected">
          <header className="dashboard-header">
            <div className="stat-card">
              <h3>{nfts.reduce((acc, nft) => acc + parseInt(nft.balance, 10), 0)}</h3>
              <p>Total NFTs Owned</p>
            </div>

            <div className="stat-card">
              <h3>{nfts.length}</h3>
              <p>Total Unique NFTs</p>
            </div>
          </header>

          {nfts.length === 0 && (
            <section className="nft-empty">
              <h2>No Environmental NFTs found in your wallet.</h2>
              <p>
                It looks like you don't have any environmental NFTs yet. Start exploring the marketplaces to begin your
                collection.
              </p>
            </section>
          )}

          <section className="dashboard-content">
            {nfts.length > 0 &&
              nfts.map(nft => (
                <article key={nft.id} className="dashboard-item">
                  {nft.balance > 1 && <span className="nft-balance">{nft.balance}</span>}

                  <img src={nft.metadata.image} alt={nft.metadata.description} />
                  <h3>{nft.metadata.name}</h3>

                  <p>Emission Allowance: {nft.metadata.attributes[0].value.replace('CO2', 'CO₂')}</p>
                </article>
              ))}
          </section>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
