import React from 'react';
import NexaFiHubNavbar from '../components/NexaFiHubNavbar';
import { Outlet } from 'react-router-dom';

const NexaFiHubLayout = () => {
  return (
    <div>
      <NexaFiHubNavbar />

      <Outlet />
    </div>
  );
};

export default NexaFiHubLayout;
