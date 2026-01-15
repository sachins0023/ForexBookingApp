export interface Currency {
  id: number;
  name: string;
  symbol: string;
  fxRate: number; // Conversion factor compared to USD (1 USD = fxRate * currency)
}

// Helper function to generate random fxRate between min and max with decimal precision
export const getRandomFxRate = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Currency fxRate ranges for random generation
export const currencyFxRateRanges: Record<
  string,
  { min: number; max: number }
> = {
  USD: { min: 1.0, max: 1.0 },
  EUR: { min: 0.85, max: 1.15 },
  GBP: { min: 0.75, max: 0.95 },
  JPY: { min: 140.0, max: 160.0 },
  AUD: { min: 1.45, max: 1.65 },
  CAD: { min: 1.3, max: 1.5 },
  CHF: { min: 0.85, max: 1.05 },
  CNY: { min: 6.8, max: 7.4 },
  INR: { min: 82.0, max: 85.0 },
  NZD: { min: 1.6, max: 1.8 },
};

export const currencyMaster: Currency[] = [
  {
    id: 1,
    name: "USD",
    symbol: "$",
    fxRate: 1.0, // Base currency
  },
  {
    id: 2,
    name: "EUR",
    symbol: "€",
    fxRate: getRandomFxRate(0.85, 1.15), // Initial random value
  },
  {
    id: 3,
    name: "GBP",
    symbol: "£",
    fxRate: getRandomFxRate(0.75, 0.95), // Initial random value
  },
  {
    id: 4,
    name: "JPY",
    symbol: "¥",
    fxRate: getRandomFxRate(140.0, 160.0), // Initial random value
  },
  {
    id: 5,
    name: "AUD",
    symbol: "A$",
    fxRate: getRandomFxRate(1.45, 1.65), // Initial random value
  },
  {
    id: 6,
    name: "CAD",
    symbol: "C$",
    fxRate: getRandomFxRate(1.3, 1.5), // Initial random value
  },
  {
    id: 7,
    name: "CHF",
    symbol: "CHF",
    fxRate: getRandomFxRate(0.85, 1.05), // Initial random value
  },
  {
    id: 8,
    name: "CNY",
    symbol: "¥",
    fxRate: getRandomFxRate(6.8, 7.4), // Initial random value
  },
  {
    id: 9,
    name: "INR",
    symbol: "₹",
    fxRate: getRandomFxRate(82.0, 85.0), // Initial random value
  },
  {
    id: 10,
    name: "NZD",
    symbol: "NZ$",
    fxRate: getRandomFxRate(1.6, 1.8), // Initial random value
  },
];
