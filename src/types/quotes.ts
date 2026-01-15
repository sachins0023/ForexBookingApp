import type { Currency } from "@/data/currencyMaster";

interface QuoteResponse {
  fxRate: number;
  fees: number;
  totalPayable: number;
  quoteExpiryTime: string; // ISO 8601 timestamp
}

type Quote =
  | (QuoteResponse & {
      sourceCurrency: string;
      destinationCurrency: string;
      sourceCurrencyObj: Currency;
      destinationCurrencyObj: Currency;
      amount: string;
    })
  | null;

export type { QuoteResponse, Quote };
