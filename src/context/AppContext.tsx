import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { getQuote } from "@/api";
import type { PaymentRequest as PaymentRequestType } from "@/types/paymentRequest";
import type { Quote as QuoteType } from "@/types/quotes";
import type { Transaction } from "@/types/transaction";
import { toast } from "sonner";

// State interface
interface AppState {
  quote: QuoteType;
  paymentRequest: PaymentRequestType | null;
  transaction: Transaction | null;
  isLoading: boolean;
  error: string;
}

// Action types
type AppAction =
  | { type: "GET_QUOTE_START" }
  | {
      type: "GET_QUOTE_SUCCESS";
      payload: QuoteType;
    }
  | { type: "GET_QUOTE_ERROR"; payload: string }
  | { type: "CONTINUE_TO_PAYMENT"; payload: PaymentRequestType }
  | { type: "PAYMENT_SUCCESS"; payload: Transaction }
  | { type: "RETRY_PAYMENT" }
  | { type: "GO_HOME" }
  | { type: "CLEAR_ERROR" };

// Initial state
const initialState: AppState = {
  quote: null,
  paymentRequest: null,
  transaction: null,
  isLoading: false,
  error: "",
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "GET_QUOTE_START":
      return {
        ...state,
        isLoading: true,
        error: "",
      };

    case "GET_QUOTE_SUCCESS":
      return {
        ...state,
        quote: action.payload,
        isLoading: false,
        error: "",
      };

    case "GET_QUOTE_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case "CONTINUE_TO_PAYMENT":
      return {
        ...state,
        paymentRequest: action.payload,
        error: "",
      };

    case "PAYMENT_SUCCESS":
      return {
        ...state,
        transaction: action.payload,
        paymentRequest: null,
        error: "",
      };

    case "RETRY_PAYMENT":
      return {
        ...state,
        transaction: null,
        paymentRequest: null,
        quote: null,
        error: "",
      };

    case "GO_HOME":
      return {
        ...initialState,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: "",
      };

    default:
      return state;
  }
};

// Context interface
interface AppContextType {
  state: AppState;
  getQuote: (
    sourceCurrency: string,
    destinationCurrency: string,
    amount: string
  ) => Promise<void>;
  continueToPayment: (quote: QuoteType) => void;
  paymentSuccess: (transaction: Transaction) => void;
  retryPayment: (transaction: Transaction) => void;
  goHome: () => void;
  clearError: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigate = useNavigate();

  const handleGetQuote = async (
    sourceCurrency: string,
    destinationCurrency: string,
    amount: string
  ): Promise<void> => {
    dispatch({ type: "GET_QUOTE_START" });
    try {
      const response = await getQuote(
        sourceCurrency,
        destinationCurrency,
        parseFloat(amount)
      );
      const quoteData: QuoteType = {
        ...response,
        sourceCurrency,
        destinationCurrency,
        amount,
      };
      dispatch({ type: "GET_QUOTE_SUCCESS", payload: quoteData });
      toast.success("Quote retrieved successfully", {
        description: `FX rate: ${response.fxRate.toFixed(4)}`,
      });
      navigate("/quote-response");
    } catch (err) {
      const errorMessage = "Failed to get quote. Please try again.";
      dispatch({
        type: "GET_QUOTE_ERROR",
        payload: err instanceof Error ? err.message : errorMessage,
      });
      toast.error("Quote Error", {
        description: err instanceof Error ? err.message : errorMessage,
      });
      console.error(err);
    }
  };

  const handleContinueToPayment = (quote: QuoteType) => {
    if (!quote) {
      dispatch({
        type: "GET_QUOTE_ERROR",
        payload: "No quote found",
      });
      return;
    }
    const paymentRequest: PaymentRequestType = {
      sourceCurrency: quote.sourceCurrency,
      destinationCurrency: quote.destinationCurrency,
      sourceCurrencyObj: quote.sourceCurrencyObj,
      destinationCurrencyObj: quote.destinationCurrencyObj,
      amount: quote.amount,
      fxRate: quote.fxRate,
      fees: quote.fees,
      totalPayable: quote.totalPayable,
    };
    dispatch({ type: "CONTINUE_TO_PAYMENT", payload: paymentRequest });
    navigate("/pay");
  };

  const handlePaymentSuccess = (transaction: Transaction) => {
    const transactionPath = `/transaction/${transaction.id}`;

    // Navigate first, then update state to prevent PaymentPage redirect
    navigate(transactionPath);

    // Update state after navigation is initiated
    setTimeout(() => {
      dispatch({ type: "PAYMENT_SUCCESS", payload: transaction });
      toast.success("Payment submitted successfully", {
        description: `Transaction ID: ${transaction.id.substring(0, 8)}...`,
      });
    }, 100);
  };

  const handleRetryPayment = (transaction: Transaction) => {
    dispatch({ type: "RETRY_PAYMENT" });
    toast.info("Retrying payment", {
      description: "Fetching a new quote...",
    });
    // Automatically refetch the quote with original values
    handleGetQuote(
      transaction.sourceCurrency,
      transaction.destinationCurrency,
      transaction.sourceAmount
    );
    // Navigation will happen in handleGetQuote after success
  };

  const handleGoHome = () => {
    dispatch({ type: "GO_HOME" });
    toast.success("Welcome back!", {
      description: "Ready to start a new transaction",
    });
    navigate("/quote");
  };

  const handleClearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AppContextType = {
    state,
    getQuote: handleGetQuote,
    continueToPayment: handleContinueToPayment,
    paymentSuccess: handlePaymentSuccess,
    retryPayment: handleRetryPayment,
    goHome: handleGoHome,
    clearError: handleClearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
