import type { Currency } from "@/data/currencyMaster";

type TransactionStatusType =
  typeof import("@/utils").TransactionStatus[keyof typeof import("@/utils").TransactionStatus];

interface Transaction {
  id: string;
  status: TransactionStatusType;
  amount: number; // totalPayable in destination currency
  sourceAmount: string; // Original amount in source currency
  sourceCurrency: string;
  destinationCurrency: string;
  sourceCurrencyObj: Currency;
  destinationCurrencyObj: Currency;
  fees: number;
  fxRate: number; // Exchange rate
  totalPayable: number;
  quoteExpiryTime: string;
  createdAt: string; // ISO timestamp when transaction was created
  updatedAt: string; // ISO timestamp when status was last updated
}

export type { Transaction };
