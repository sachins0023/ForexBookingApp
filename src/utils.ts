const generateCustomNanoId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const TransactionStatus = {
  PROCESSING: "processing",
  SENT: "sent",
  SETTLED: "settled",
  FAILED: "failed",
} as const;

export { generateCustomNanoId };
