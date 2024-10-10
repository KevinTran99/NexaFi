import { useState } from 'react';
import NexaFiHubNavbar from '../components/NexaFiHubNavbar';
import { Outlet } from 'react-router-dom';

const NexaFiHubLayout = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [nfts, setNfts] = useState([]);

  return (
    <div>
      <NexaFiHubNavbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />

      <Outlet context={{ walletAddress, nfts, setNfts }} />
    </div>
  );
};

export default NexaFiHubLayout;
