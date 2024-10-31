import { createBrowserRouter, Outlet } from 'react-router-dom';
import NotFound from './components/NotFound';
import NexaFi from './pages/NexaFi';
import NexaFiHubLayout from './components/NexaFiHubLayout';
import NexaFiHub from './pages/NexaFiHub';
import Dashboard from './pages/Dashboard';
import Mint from './pages/Mint';
import Burn from './pages/Burn';
import Marketplace from './pages/Marketplace';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <NexaFi />,
      },
      {
        path: '/nexafihub',
        element: <NexaFiHubLayout />,
        children: [
          {
            index: true,
            element: <NexaFiHub />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'mint',
            element: <Mint />,
          },
          {
            path: 'burn',
            element: <Burn />,
          },
          {
            path: 'marketplace',
            element: <Marketplace />,
          },
        ],
      },
    ],
  },
]);

export default router;
