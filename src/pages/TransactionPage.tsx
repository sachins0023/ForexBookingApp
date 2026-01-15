import { useParams } from "react-router";
import TransactionStatusComponent from "@/components/transactionStatus";

const TransactionPage = () => {
  const { transactionId } = useParams<{ transactionId: string }>();

  if (!transactionId) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
          Transaction ID is required
        </div>
      </div>
    );
  }

  return <TransactionStatusComponent transactionId={transactionId} />;
};

export default TransactionPage;
