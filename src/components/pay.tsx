import { pay } from "@/api";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

const PaymentRequest = () => {
  const { state, paymentSuccess } = useApp();
  const { paymentRequest } = state;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!paymentRequest) {
    return null;
  }
  const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 10,
      minimumFractionDigits: 0,
    });
  };

  const calculateTotalPayableInSourceCurrency = () => {
    const amount = parseFloat(paymentRequest.amount);
    return amount + paymentRequest.fees;
  };

  const calculateConvertedAmount = () => {
    const amount = parseFloat(paymentRequest.amount);
    return amount * paymentRequest.fxRate;
  };

  const totalPayableInSourceCurrency = calculateTotalPayableInSourceCurrency();
  const convertedAmount = calculateConvertedAmount();

  const handlePay = async () => {
    // Prevent double submission
    if (isLoading || isSubmitted) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setIsSubmitted(true);

      if (!paymentRequest) {
        throw new Error("Payment request not found");
      }

      const transaction = await pay(paymentRequest);

      // On success, navigate to transaction status
      paymentSuccess(transaction);
    } catch (err) {
      // Reset submission state on error to allow retry
      setIsSubmitted(false);

      // Handle different error types
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("network") || err.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (err.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else {
          errorMessage = err.message || "Payment failed. Please try again.";
        }
      }

      setError(errorMessage);
      toast.error("Payment Failed", {
        description: errorMessage,
      });

      console.error("Error paying:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">Source Currency:</span>
              <span className="font-medium">
                {paymentRequest.sourceCurrencyObj.symbol}{" "}
                {paymentRequest.sourceCurrency}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">
                Destination Currency:
              </span>
              <span className="font-medium">
                {paymentRequest.destinationCurrencyObj.symbol}{" "}
                {paymentRequest.destinationCurrency}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {paymentRequest.sourceCurrencyObj.symbol}
                {formatNumber(parseFloat(paymentRequest.amount))}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">FX Rate:</span>
              <span className="font-medium">
                {formatNumber(paymentRequest.fxRate)}{" "}
                {paymentRequest.sourceCurrencyObj.symbol}/
                {paymentRequest.destinationCurrencyObj.symbol}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">Fees:</span>
              <span className="font-medium">
                {paymentRequest.sourceCurrencyObj.symbol}
                {formatNumber(paymentRequest.fees)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-2 text-lg border-t">
              <span className="font-semibold">Total Payable:</span>
              <span className="font-bold">
                {paymentRequest.sourceCurrencyObj.symbol}
                {formatNumber(totalPayableInSourceCurrency)}
              </span>
            </div>
            {convertedAmount !== null && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 text-lg">
                <span className="font-semibold">You Will Receive:</span>
                <span className="font-bold">
                  {paymentRequest.destinationCurrencyObj.symbol}
                  {formatNumber(convertedAmount)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col gap-3 w-full">
            <Button
              className="w-full sm:w-auto sm:min-w-[140px] sm:ml-auto"
              onClick={handlePay}
              disabled={isLoading || isSubmitted}
            >
              {isLoading ? "Processing Payment..." : "Pay"}
            </Button>
            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <p className="font-medium">Payment Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentRequest;
