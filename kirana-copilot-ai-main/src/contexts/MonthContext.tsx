import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Month {
  id: string;
  label: string;
  shopId: string;
  invoiceCount: number;
  status: "pending" | "processing" | "ready";
}

interface MonthContextType {
  months: Month[];
  selectedMonth: Month | null;
  selectMonth: (month: Month) => void;
  addMonth: (shopId: string, label: string) => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export const MonthProvider = ({ children }: { children: ReactNode }) => {
  const [months, setMonths] = useState<Month[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Month | null>(null);

  const addMonth = (shopId: string, label: string) => {
    const newMonth: Month = {
      id: `month_${Date.now()}`,
      label,
      shopId,
      invoiceCount: 0,
      status: "pending",
    };
    setMonths((prev) => [...prev, newMonth]);
    setSelectedMonth(newMonth);
  };

  return (
    <MonthContext.Provider value={{ months, selectedMonth, selectMonth: setSelectedMonth, addMonth }}>
      {children}
    </MonthContext.Provider>
  );
};

export const useMonth = () => {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
};
