import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

const QuoteResponse = () => {
  const { state, getQuote, continueToPayment } = useApp();
  const { quote, isLoading } = state;
  const getCountdown = ({
    quoteExpiryTime,
  }: {
    quoteExpiryTime: string | undefined;
  }) => {
    if (!quoteExpiryTime) return 0;
    return Math.floor(
      (new Date(quoteExpiryTime).getTime() - Date.now()) / 1000
    );
  };
  const [countdown, setCountdown] = useState<number>(
    getCountdown({ quoteExpiryTime: quote?.quoteExpiryTime })
  );

  useEffect(() => {
    // Reset countdown when quote changes
    setCountdown(getCountdown({ quoteExpiryTime: quote?.quoteExpiryTime }));

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quote?.quoteExpiryTime]);

  const handleRefetch = async () => {
    if (
      !quote?.sourceCurrency ||
      !quote?.destinationCurrency ||
      !quote?.amount
    ) {
      return;
    }
    await getQuote(
      quote.sourceCurrency,
      quote.destinationCurrency,
      quote.amount
    );
    // Countdown will be reset automatically when quote prop updates via useEffect
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 10,
      minimumFractionDigits: 0,
    });
  };

  const calculateFeePercentage = () => {
    if (!quote?.amount || quote?.fees === undefined || quote?.fees === null)
      return null;
    const amount = parseFloat(quote.amount);
    if (amount === 0 || isNaN(amount)) return null;
    const percentage = (quote.fees / amount) * 100;
    if (isNaN(percentage) || !isFinite(percentage)) return null;
    return percentage.toFixed(2);
  };

  const calculateTotalPayableInSourceCurrency = () => {
    if (!quote?.amount || !quote?.fees) return null;
    const amount = parseFloat(quote.amount);
    return amount + quote.fees;
  };

  const calculateConvertedAmount = () => {
    if (!quote?.amount || !quote?.fxRate) return null;
    const amount = parseFloat(quote.amount);
    return amount * quote.fxRate;
  };

  const feePercentage = calculateFeePercentage();
  const totalPayableInSourceCurrency = calculateTotalPayableInSourceCurrency();
  const convertedAmount = calculateConvertedAmount();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-2 text-lg">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
              <Skeleton className="h-9 w-full sm:w-32" />
              <Skeleton className="h-9 w-full sm:w-36" />
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">Source Currency:</span>
              <span className="font-medium">
                {quote
                  ? `${quote.sourceCurrencyObj.symbol} ${quote.sourceCurrency}`
                  : ""}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">
                Destination Currency:
              </span>
              <span className="font-medium">
                {quote
                  ? `${quote.destinationCurrencyObj.symbol} ${quote.destinationCurrency}`
                  : ""}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {quote
                  ? `${quote.sourceCurrencyObj.symbol}${formatNumber(
                      parseFloat(quote.amount)
                    )}`
                  : ""}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">Exchange Rate:</span>
              <span className="font-medium">
                {quote ? formatNumber(quote.fxRate) : ""}{" "}
                {quote?.sourceCurrencyObj.symbol}/
                {quote?.destinationCurrencyObj.symbol}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 border-b">
              <span className="text-muted-foreground">
                Fees{feePercentage ? ` (${feePercentage}%)` : ""}:
              </span>
              <span className="font-medium">
                {quote
                  ? `${quote.sourceCurrencyObj.symbol}${formatNumber(
                      quote.fees
                    )}`
                  : ""}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-2 text-lg border-t">
              <span className="font-semibold">Total Payable:</span>
              <span className="font-bold">
                {quote && totalPayableInSourceCurrency !== null
                  ? `${quote.sourceCurrencyObj.symbol}${formatNumber(
                      totalPayableInSourceCurrency
                    )}`
                  : ""}
              </span>
            </div>
            {convertedAmount !== null && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-2 text-lg">
                <span className="font-semibold">You Will Receive:</span>
                <span className="font-bold">
                  {quote
                    ? `${quote.destinationCurrencyObj.symbol}${formatNumber(
                        convertedAmount
                      )}`
                    : ""}
                </span>
              </div>
            )}
            {quote?.quoteExpiryTime && (
              <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                Quote expires at:{" "}
                {new Date(quote?.quoteExpiryTime).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto sm:min-w-[140px]"
              onClick={handleRefetch}
            >
              Refetch Quote
            </Button>
            <Button
              className="w-full sm:w-auto sm:min-w-[140px]"
              disabled={countdown <= 0}
              onClick={() => quote && continueToPayment(quote)}
            >
              {countdown <= 0 ? "Continue" : `Continue (${countdown}s)`}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuoteResponse;
