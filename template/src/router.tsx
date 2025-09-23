import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import App from './App';
import ExamplePage from './pages/Example';

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
    ],
  },
]);