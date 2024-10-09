import { useState } from 'react';
import NexaFiHubNavbar from '../components/NexaFiHubNavbar';
import { Outlet } from 'react-router-dom';

const NexaFiHubLayout = () => {
  const [walletAddress, setWalletAddress] = useState('');

  return (
    <div>
      <NexaFiHubNavbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />

      <Outlet context={{ walletAddress }} />
    </div>
  );
};

export default NexaFiHubLayout;
