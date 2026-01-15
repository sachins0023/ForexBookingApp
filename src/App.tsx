import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "./context/AppContext";
import Navigation from "./components/Navigation";

const AppLayout = () => {
  const { state } = useApp();

  return (
    <div>
      <Navigation />
      {state.error && (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
          <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
            {state.error}
          </div>
        </div>
      )}
      <Outlet />
      <Toaster />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default App;
