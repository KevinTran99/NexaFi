import { useState } from 'react';
import NexaFiHubNavbar from '../components/NexaFiHubNavbar';
import { Outlet } from 'react-router-dom';

const NexaFiHubLayout = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('');

  return (
    <div>
      <NexaFiHubNavbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} setStatus={setStatus} />

      <Outlet context={{ walletAddress, status }} />
    </div>
  );
};

export default NexaFiHubLayout;
