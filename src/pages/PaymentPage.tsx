import { Navigate } from "react-router";
import PaymentRequest from "@/components/pay";
import { useApp } from "@/context/AppContext";

const PaymentPage = () => {
  const { state } = useApp();

  // Redirect to quote page if no payment request exists
  // But don't redirect if we have a transaction (navigation is in progress)
  if (!state.paymentRequest && !state.transaction) {
    return <Navigate to="/quote" replace />;
  }

  // If payment request is null but we have a transaction, navigation is happening
  // Just show nothing while navigation completes
  if (!state.paymentRequest && state.transaction) {
    return null;
  }

  return <PaymentRequest />;
};

export default PaymentPage;
