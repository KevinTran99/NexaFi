import { useEffect } from 'react';
import '../styles/nexafi-hub-navbar.css';
import { Link } from 'react-router-dom';
import { connectWallet, getConnectedWallet, walletListener } from '../utilities/WalletInteractions';

const NexaFiHubNavbar = ({ walletAddress, setWalletAddress }) => {
  useEffect(() => {
    const initialize = async () => {
      try {
        const { address } = await getConnectedWallet();
        setWalletAddress(address);

        if (address) {
          walletListener(setWalletAddress);
        }
      } catch (err) {
        console.error('Error loading wallet data: ', err.message);
      }
    };

    initialize();
  }, [setWalletAddress]);

  const handleConnectWallet = async () => {
    const walletResponse = await connectWallet();

    setWalletAddress(walletResponse.address);
  };

  return (
    <nav className="hub-nav-section">
      <div className="hub-nav-content">
        <div className="hub-brand-wrapper">
          <img src="/brand-logo.png" alt="NexaFi Logo" className="hub-nav-logo" />
          <h3 className="hub-brand-name">NexaFi Hub</h3>
        </div>

        <ul className="hub-nav-links">
          <li>
            <Link to={'/nexafihub'} className="hub-nav-item">
              Home
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/dashboard'} className="hub-nav-item">
              Dashboard
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/mint'} className="hub-nav-item">
              Mint
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/burn'} className="hub-nav-item">
              Burn
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/marketplace'} className="hub-nav-item">
              Marketplace
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/mint-usdt'} className="hub-nav-item">
              Mint USDT
            </Link>
          </li>
        </ul>

        {!walletAddress && (
          <button className="wallet-button" onClick={handleConnectWallet}>
            Connect wallet
          </button>
        )}

        {walletAddress && walletAddress.length > 0 && (
          <p className="wallet-address">
            Connected:
            {` ${walletAddress.substring(0, 6)}...${walletAddress.substring(
              walletAddress.length - 4
            )}`}
          </p>
        )}
      </div>
    </nav>
  );
};

export default NexaFiHubNavbar;
