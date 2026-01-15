import {
  currencyMaster,
  type Currency,
  getRandomFxRate,
  currencyFxRateRanges,
} from "@/data/currencyMaster";
import type { QuoteResponse } from "@/types/quotes";
import { generateCustomNanoId, TransactionStatus } from "./utils";
import type { PaymentRequest } from "@/types/paymentRequest";
import type { Transaction } from "@/types/transaction";

const simulatedApiDelay = 1000;

// In-memory storage for transactions (simulating a database)
const transactionStore = new Map<string, Transaction>();

const getQuote = async (
  sourceCurrency: string,
  destinationCurrency: string,
  amount: number
): Promise<
  QuoteResponse & {
    sourceCurrencyObj: Currency;
    destinationCurrencyObj: Currency;
  }
> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, simulatedApiDelay));

  // Get fxRate from currencyMaster
  let fxRate = 1; // Default to 1 if same currency

  const sourceCurrencyData = currencyMaster.find(
    (c) => c.name === sourceCurrency
  );
  const destinationCurrencyData = currencyMaster.find(
    (c) => c.name === destinationCurrency
  );

  if (!sourceCurrencyData || !destinationCurrencyData) {
    throw new Error("Currency not found");
  }

  // Generate fresh random fxRate values for each currency on each quote request
  const sourceRange = currencyFxRateRanges[sourceCurrency];
  const destinationRange = currencyFxRateRanges[destinationCurrency];

  if (!sourceRange || !destinationRange) {
    throw new Error("Currency range not found");
  }

  const sourceFxRate =
    sourceRange.min === sourceRange.max
      ? sourceRange.min
      : getRandomFxRate(sourceRange.min, sourceRange.max);
  const destinationFxRate =
    destinationRange.min === destinationRange.max
      ? destinationRange.min
      : getRandomFxRate(destinationRange.min, destinationRange.max);

  // Update currency objects with fresh fxRate values
  const updatedSourceCurrencyData: Currency = {
    ...sourceCurrencyData,
    fxRate: sourceFxRate,
  };
  const updatedDestinationCurrencyData: Currency = {
    ...destinationCurrencyData,
    fxRate: destinationFxRate,
  };

  if (sourceCurrency !== destinationCurrency) {
    // Calculate exchange rate: destinationfxRate / sourcefxRate
    // This gives us how many units of destination currency = 1 unit of source currency
    fxRate = destinationFxRate / sourceFxRate;
  }

  // Calculate fees (e.g., 0.5% of the amount) in source currency
  const feePercentage = 0.005;
  const fees = amount * feePercentage;

  // Calculate total in source currency (amount + fees)
  const totalInSourceCurrency = amount + fees;

  // Calculate total payable by converting the total (amount + fees) to destination currency
  const totalPayable = totalInSourceCurrency * fxRate;

  // Set quote expiry time to 30 seconds from now
  const quoteExpiryTime = new Date(Date.now() + 30 * 1000).toISOString();

  return {
    fxRate,
    fees,
    totalPayable,
    quoteExpiryTime,
    sourceCurrencyObj: updatedSourceCurrencyData,
    destinationCurrencyObj: updatedDestinationCurrencyData,
  };
};

const pay = async (paymentRequest: PaymentRequest) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, simulatedApiDelay));

  const now = new Date().toISOString();
  const transaction: Transaction = {
    id: generateCustomNanoId(),
    status: TransactionStatus.PROCESSING,
    amount: paymentRequest.totalPayable,
    sourceAmount: paymentRequest.amount, // Store original source amount
    sourceCurrency: paymentRequest.sourceCurrency,
    destinationCurrency: paymentRequest.destinationCurrency,
    sourceCurrencyObj: paymentRequest.sourceCurrencyObj,
    destinationCurrencyObj: paymentRequest.destinationCurrencyObj,
    fees: paymentRequest.fees,
    fxRate: paymentRequest.fxRate, // Store exchange rate
    totalPayable: paymentRequest.totalPayable,
    quoteExpiryTime: "", // Not needed for payment, but required by type
    createdAt: now,
    updatedAt: now,
  };

  // Store transaction in memory
  transactionStore.set(transaction.id, transaction);

  return transaction;
};

const getTransactionStatus = async (
  transactionId: string
): Promise<Transaction> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, simulatedApiDelay));

  const transaction = transactionStore.get(transactionId);

  if (!transaction) {
    throw new Error(`Transaction with id ${transactionId} not found`);
  }

  // Calculate time elapsed since transaction creation (in seconds)
  const now = Date.now();
  const createdAt = new Date(transaction.createdAt).getTime();
  const elapsedSeconds = (now - createdAt) / 1000;

  // Simulate status progression based on elapsed time:
  // 0-2 seconds: PROCESSING
  // 2-5 seconds: SENT
  // 5+ seconds: SETTLED (90% chance) or FAILED (10% chance)
  let newStatus = transaction.status;

  if (elapsedSeconds < 10) {
    newStatus = TransactionStatus.PROCESSING;
  } else if (elapsedSeconds < 25) {
    newStatus = TransactionStatus.SENT;
  } else {
    // After 5 seconds, randomly settle or fail (90% success rate)
    if (transaction.status === TransactionStatus.SENT) {
      newStatus =
        Math.random() < 0.9
          ? TransactionStatus.SETTLED
          : TransactionStatus.FAILED;
    } else {
      // If already settled or failed, keep the same status
      newStatus = transaction.status;
    }
  }

  // Update transaction if status changed
  if (newStatus !== transaction.status) {
    const updatedTransaction: Transaction = {
      ...transaction,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    transactionStore.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }

  return transaction;
};

export { getQuote, pay, getTransactionStatus };
