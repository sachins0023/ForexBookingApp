import { Navigate } from "react-router";
import QuoteResponse from "@/components/quoteResponse";
import { useApp } from "@/context/AppContext";

const QuoteResponsePage = () => {
  const { state } = useApp();

  // Redirect to quote page if no quote exists
  if (!state.quote) {
    return <Navigate to="/quote" replace />;
  }

  return <QuoteResponse />;
};

export default QuoteResponsePage;
