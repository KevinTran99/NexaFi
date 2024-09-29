import { createBrowserRouter, Outlet } from 'react-router-dom';
import NexaFi from './pages/NexaFi';
import NexaFiHub from './pages/NexaFiHub';
import NotFound from './components/NotFound';

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
        element: <NexaFiHub />,
      },
    ],
  },
]);

export default router;
