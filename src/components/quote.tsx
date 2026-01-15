import { useState } from "react";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CurrencySelect from "@/components/currencySelect";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

const Quote = () => {
  const { getQuote } = useApp();
  const [sourceCurrency, setSourceCurrency] = useState<string>("");
  const [destinationCurrency, setDestinationCurrency] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isFetchingQuote, setIsFetchingQuote] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!sourceCurrency) {
      setError("Please select a source currency");
      return;
    }
    if (!destinationCurrency) {
      setError("Please select a destination currency");
      return;
    }
    if (sourceCurrency === destinationCurrency) {
      setError("Source and destination currencies must be different");
      return;
    }
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setIsFetchingQuote(true);
    try {
      await getQuote(sourceCurrency, destinationCurrency, amount);
    } catch (err) {
      setError("Failed to get quote. Please try again.");
      console.error(err);
    } finally {
      setIsFetchingQuote(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Get Quote</CardTitle>
        </CardHeader>
        <form id="quote-form" onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source-currency">Source Currency</Label>
                  <CurrencySelect
                    label="Source Currency"
                    value={sourceCurrency}
                    onValueChange={setSourceCurrency}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-currency">
                    Destination Currency
                  </Label>
                  <CurrencySelect
                    label="Destination Currency"
                    value={destinationCurrency}
                    onValueChange={setDestinationCurrency}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              form="quote-form"
              disabled={isFetchingQuote}
              className="w-full sm:w-auto sm:min-w-[140px] sm:ml-auto"
            >
              {isFetchingQuote ? "Getting Quote..." : "Get Quote"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Quote;
