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
          {nfts.length === 0 && (
            <section className="nft-empty">
              <h2>No Environmental NFTs found in your wallet.</h2>
              <p>
                It looks like you don't have any environmental NFTs yet. Start exploring the marketplaces to begin your
                collection.
              </p>
            </section>
          )}

          <div className="dashboard-content">
            {nfts.length > 0 &&
              nfts.map(nft => (
                <section key={nft.id} className="dashboard-item">
                  {nft.balance > 1 && <span className="nft-balance">{nft.balance}</span>}
                  <img src={nft.metadata.image} alt={nft.metadata.description} />
                  <h3>{nft.metadata.name}</h3>
                  <p>Emission Allowance: {nft.metadata.attributes[0].value}</p>
                </section>
              ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
