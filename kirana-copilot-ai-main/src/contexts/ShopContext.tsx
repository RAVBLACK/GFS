import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Shop {
  id: string;
  name: string;
  customerName: string;
  type: string;
  createdAt: string;
}

interface ShopContextType {
  shops: Shop[];
  selectedShop: Shop | null;
  selectShop: (shop: Shop) => void;
  addShop: (shop: Omit<Shop, "id" | "createdAt">) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const addShop = (data: Omit<Shop, "id" | "createdAt">) => {
    const newShop: Shop = {
      ...data,
      id: `shop_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setShops((prev) => [...prev, newShop]);
    setSelectedShop(newShop);
  };

  return (
    <ShopContext.Provider value={{ shops, selectedShop, selectShop: setSelectedShop, addShop }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
};
