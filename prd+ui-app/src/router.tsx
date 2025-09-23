import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import ProductionDashboard from "./pages/ProductionDashboard";
import App from "./App";
import ExamplePage from "./pages/Example";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProductionDashboard />
      },
      {
        path: "example",
        element: <ExamplePage />
      },
      {
        path: "test",
        element: <App />
      }
    ]
  }
]);
