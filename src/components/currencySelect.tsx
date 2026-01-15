import { useState, useMemo, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { currencyMaster } from "@/data/currencyMaster";
import { SearchIcon } from "lucide-react";

interface CurrencySelectProps {
  label: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const CurrencySelect = ({
  label,
  value,
  onValueChange,
}: CurrencySelectProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search term
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  const filteredCurrencies = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return currencyMaster;
    }
    const term = debouncedSearchTerm.toLowerCase();
    return currencyMaster.filter(
      (currency) =>
        currency.name.toLowerCase().includes(term) ||
        currency.symbol.toLowerCase().includes(term)
    );
  }, [debouncedSearchTerm]);

  // Reset search term when select closes
  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setDebouncedSearchTerm("");
    }
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={value}
        onValueChange={onValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent
          className="w-[var(--radix-select-trigger-width)]"
          position="popper"
          sideOffset={4}
        >
          <div className="sticky top-0 z-10 bg-popover p-2 border-b">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search currencies..."
                value={searchInput}
                onChange={(e) => {
                  e.stopPropagation();
                  setSearchInput(e.target.value);
                }}
                className="pl-8 h-8"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") {
                    setSearchInput("");
                    setDebouncedSearchTerm("");
                    setOpen(false);
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.name}>
                  {currency.name} ({currency.symbol})
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No currencies found
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelect;
