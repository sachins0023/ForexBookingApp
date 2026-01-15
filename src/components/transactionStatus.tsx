import { useEffect, useState, useCallback, useRef } from "react";
import { getTransactionStatus } from "@/api";
import type { Transaction } from "@/types/transaction";
import { TransactionStatus } from "@/utils";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Send,
  Clock,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

const POLLING_INTERVAL = 2500; // Poll every 2.5 seconds

const TransactionStatusComponent = ({
  transactionId,
}: {
  transactionId: string;
}) => {
  const { retryPayment, goHome } = useApp();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const previousStatusRef = useRef<string | null>(null);

  const fetchTransactionStatus = useCallback(async () => {
    try {
      setError("");
      const data = await getTransactionStatus(transactionId);

      // Show toast notification when status changes to SETTLED or FAILED
      if (
        previousStatusRef.current !== null &&
        previousStatusRef.current !== data.status
      ) {
        if (data.status === TransactionStatus.SETTLED) {
          toast.success("Payment Settled", {
            description:
              "Your payment has been successfully processed and settled.",
          });
        } else if (data.status === TransactionStatus.FAILED) {
          toast.error("Payment Failed", {
            description:
              "Your payment could not be processed. Please try again.",
          });
        } else if (
          data.status === TransactionStatus.SENT &&
          previousStatusRef.current === TransactionStatus.PROCESSING
        ) {
          toast.info("Payment Sent", {
            description: "Your payment has been sent and is in transit.",
          });
        }
      }

      previousStatusRef.current = data.status;
      setTransaction(data);
      setIsLoading(false);

      // Stop polling if transaction is in final state
      if (
        data.status === TransactionStatus.SETTLED ||
        data.status === TransactionStatus.FAILED
      ) {
        setIsPolling(false);
      }
    } catch (err) {
      setIsLoading(false);
      setIsPolling(false);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch transaction status";
      setError(errorMessage);
      toast.error("Status Update Error", {
        description: errorMessage,
      });
      console.error("Error fetching transaction status:", err);
    }
  }, [transactionId]);

  useEffect(() => {
    // Initial fetch
    fetchTransactionStatus();
  }, [fetchTransactionStatus]);

  useEffect(() => {
    if (!isPolling) return;

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchTransactionStatus();
    }, POLLING_INTERVAL);

    // Cleanup interval on unmount or when polling stops
    return () => clearInterval(intervalId);
  }, [isPolling, fetchTransactionStatus]);

  const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 10,
      minimumFractionDigits: 0,
    });
  };

  const calculateTotalPayableInSourceCurrency = () => {
    if (!transaction?.sourceAmount || !transaction?.fees) return null;
    const amount = parseFloat(transaction.sourceAmount);
    return amount + transaction.fees;
  };

  const calculateConvertedAmount = () => {
    if (!transaction?.sourceAmount || !transaction?.fxRate) return null;
    const amount = parseFloat(transaction.sourceAmount);
    return amount * transaction.fxRate;
  };

  const totalPayableInSourceCurrency = calculateTotalPayableInSourceCurrency();
  const convertedAmount = calculateConvertedAmount();

  const getStatusIcon = () => {
    if (!transaction) return null;

    switch (transaction.status) {
      case TransactionStatus.PROCESSING:
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case TransactionStatus.SENT:
        return <Send className="h-6 w-6 text-yellow-500" />;
      case TransactionStatus.SETTLED:
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case TransactionStatus.FAILED:
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!transaction) return "";

    switch (transaction.status) {
      case TransactionStatus.PROCESSING:
        return "Your payment is being processed...";
      case TransactionStatus.SENT:
        return "Payment has been sent and is in transit";
      case TransactionStatus.SETTLED:
        return "Payment has been successfully settled";
      case TransactionStatus.FAILED:
        return "Payment processing failed";
      default:
        return "Unknown status";
    }
  };

  const getStatusColor = () => {
    if (!transaction) return "";

    switch (transaction.status) {
      case TransactionStatus.PROCESSING:
        return "text-blue-600";
      case TransactionStatus.SENT:
        return "text-yellow-600";
      case TransactionStatus.SETTLED:
        return "text-green-600";
      case TransactionStatus.FAILED:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading && !transaction) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-64" />
              <div className="space-y-2 pt-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !transaction) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-md border border-red-200 dark:border-red-800">
              <p className="font-medium">Error loading transaction</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={fetchTransactionStatus}
              variant="outline"
              className="w-full sm:w-auto sm:min-w-[140px]"
            >
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const isFinalState =
    transaction.status === TransactionStatus.SETTLED ||
    transaction.status === TransactionStatus.FAILED;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Display */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              {getStatusIcon()}
              <div className="flex-1">
                <p className={`font-semibold text-lg ${getStatusColor()}`}>
                  {transaction.status.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getStatusMessage()}
                </p>
              </div>
              {isPolling && !isFinalState && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm font-medium">
                  {transaction.id}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <span className="text-muted-foreground">Source Currency:</span>
                <span className="font-medium">
                  {transaction.sourceCurrencyObj.symbol}{" "}
                  {transaction.sourceCurrency}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <span className="text-muted-foreground">
                  Destination Currency:
                </span>
                <span className="font-medium">
                  {transaction.destinationCurrencyObj.symbol}{" "}
                  {transaction.destinationCurrency}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {transaction.sourceCurrencyObj.symbol}
                  {formatNumber(parseFloat(transaction.sourceAmount))}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <span className="text-muted-foreground">Fees:</span>
                <span className="font-medium">
                  {transaction.sourceCurrencyObj.symbol}
                  {formatNumber(transaction.fees)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-2 text-lg border-t">
                <span className="font-semibold">Total Payable:</span>
                <span className="font-bold">
                  {transaction.sourceCurrencyObj.symbol}
                  {totalPayableInSourceCurrency !== null
                    ? formatNumber(totalPayableInSourceCurrency)
                    : ""}
                </span>
              </div>
              {convertedAmount !== null && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 text-lg">
                  <span className="font-semibold">You Will Receive:</span>
                  <span className="font-bold">
                    {transaction.destinationCurrencyObj.symbol}
                    {formatNumber(convertedAmount)}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-t text-sm text-muted-foreground">
                <span>Created:</span>
                <span>{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 text-sm text-muted-foreground">
                <span>Last Updated:</span>
                <span>{new Date(transaction.updatedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Error Message for Failed Transactions */}
            {transaction.status === TransactionStatus.FAILED && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-400 font-medium">
                  Payment Failed
                </p>
                <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                  Your payment could not be processed. Please try again or
                  contact support if the issue persists.
                </p>
              </div>
            )}

            {/* Success Message for Settled Transactions */}
            {transaction.status === TransactionStatus.SETTLED && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Payment Successful
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Your payment has been successfully processed and settled.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {transaction.status === TransactionStatus.FAILED && (
              <Button
                onClick={() => retryPayment(transaction)}
                className="w-full sm:w-auto sm:min-w-[140px]"
              >
                Try Again
              </Button>
            )}
            {transaction.status === TransactionStatus.FAILED && (
              <Button
                variant="outline"
                className="w-full sm:w-auto sm:min-w-[140px]"
                onClick={() => {
                  // In a real app, this would open support chat or email
                  alert("Please contact support at support@easyfx.com");
                }}
              >
                Contact Support
              </Button>
            )}
            {isFinalState && (
              <Button
                onClick={goHome}
                className="w-full sm:w-auto sm:min-w-[200px] sm:ml-auto"
                variant="default"
              >
                <Home className="mr-2 h-4 w-4" />
                Try Another Transaction
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TransactionStatusComponent;
