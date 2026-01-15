import type { Currency } from "@/data/currencyMaster";

type PaymentRequest = {
  sourceCurrency: string;
  destinationCurrency: string;
  sourceCurrencyObj: Currency;
  destinationCurrencyObj: Currency;
  amount: string;
  fxRate: number;
  fees: number;
  totalPayable: number;
};

export type { PaymentRequest };
