import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import App from './App';
import ExamplePage from './pages/Example';
import ProductionDashboard from './pages/ProductionDashboard';
import StationExecutionMonitor from './pages/StationExecutionMonitor';
import StationDashboard from './pages/StationDashboard';
import ProductConfiguration from './pages/ProductConfiguration';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: 'example',
        element: <ExamplePage />,
      },
      {
        path: 'production',
        element: <ProductionDashboard />,
      },
      {
        path: 'station-monitor',
        element: <StationExecutionMonitor />,
      },
      {
        path: 'dashboard',
        element: <StationDashboard />,
      },
      {
        path: 'product-config',
        element: <ProductConfiguration />,
      },
    ],
  },
]);