import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.tsx";
import QuotePage from "./pages/QuotePage.tsx";
import QuoteResponsePage from "./pages/QuoteResponsePage.tsx";
import PaymentPage from "./pages/PaymentPage.tsx";
import TransactionPage from "./pages/TransactionPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/quote" replace />,
      },
      {
        path: "quote",
        element: <QuotePage />,
      },
      {
        path: "quote-response",
        element: <QuoteResponsePage />,
      },
      {
        path: "pay",
        element: <PaymentPage />,
      },
      {
        path: "transaction/:transactionId",
        element: <TransactionPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
