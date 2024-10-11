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
    <nav className="nav-section">
      <div className="nav-content">
        <h3>NexaFi Hub</h3>

        <ul className="nav-links">
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
            <Link to={'/nexafihub/marketplace'} className="hub-nav-item">
              Marketplace
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
            {` ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
          </p>
        )}
      </div>
    </nav>
  );
};

export default NexaFiHubNavbar;
