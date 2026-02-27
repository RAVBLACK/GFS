import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { useMonth } from "@/contexts/MonthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store } from "lucide-react";

const shopTypes = ["Kirana / General Store", "Medical Store", "Electronics", "Clothing", "Hardware", "Other"];

const monthOptions = [
  "January 2025", "February 2025", "March 2025", "April 2025",
  "May 2025", "June 2025", "July 2025", "August 2025",
  "September 2025", "October 2025", "November 2025", "December 2025",
];

const FirstTimeSetup = () => {
  const { addShop } = useShop();
  const { addMonth } = useMonth();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shopType, setShopType] = useState("");
  const [month, setMonth] = useState("");

  const canSubmit = shopName && customerName && shopType && month;

  const handleSubmit = () => {
    addShop({ name: shopName, customerName, type: shopType });
    const shopId = `shop_${Date.now()}`;
    addMonth(shopId, month);
    navigate("/upload");
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-12 max-w-lg mx-auto animate-fade-in">
      <div className="flex-1 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-2">
            <Store className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Setup Your Shop</h1>
          <p className="text-muted-foreground text-sm">Tell us about your business</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="font-semibold">Shop Name</Label>
            <Input
              placeholder="e.g. Ramesh General Store"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Your Name</Label>
            <Input
              placeholder="e.g. Ramesh Kumar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Shop Type</Label>
            <Select value={shopType} onValueChange={setShopType}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select shop type" />
              </SelectTrigger>
              <SelectContent>
                {shopTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Select Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-xl mt-4"
        >
          ✅ Save & Upload Invoices
        </Button>
      </div>
    </div>
  );
};

export default FirstTimeSetup;
