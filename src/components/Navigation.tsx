import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { useApp } from "@/context/AppContext";

const Navigation = () => {
  const { goHome } = useApp();

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="w-full flex h-14 items-center justify-between">
        <div className="flex items-center pl-4 sm:pl-6">
          <h1 className="text-base sm:text-lg font-semibold">EasyFX</h1>
        </div>
        <div className="flex items-center pr-4 sm:pr-6">
          <Button
            onClick={goHome}
            variant="ghost"
            size="sm"
            className="gap-2 !pr-0"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Go Home</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
