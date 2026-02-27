import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { useMonth } from "@/contexts/MonthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, ChevronRight, ArrowLeft } from "lucide-react";

const monthOptions = [
  "January 2025", "February 2025", "March 2025", "April 2025",
  "May 2025", "June 2025", "July 2025", "August 2025",
  "September 2025", "October 2025", "November 2025", "December 2025",
];

const MonthDashboard = () => {
  const { selectedShop } = useShop();
  const { months, addMonth, selectMonth } = useMonth();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [newMonth, setNewMonth] = useState("");

  const shopMonths = months.filter((m) => m.shopId === selectedShop?.id);

  const handleMonthClick = (month: typeof months[0]) => {
    selectMonth(month);
    navigate("/upload");
  };

  const handleAddMonth = () => {
    if (selectedShop && newMonth) {
      addMonth(selectedShop.id, newMonth);
      setShowAdd(false);
      setNewMonth("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 pb-24 max-w-lg mx-auto animate-fade-in">
      <button onClick={() => navigate("/shops")} className="flex items-center gap-1 text-primary font-semibold text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Shops
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">{selectedShop?.name}</h1>
        <p className="text-sm text-muted-foreground">Select or add a month</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Months</h2>
        <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Month
        </Button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3 animate-slide-up">
          <Select value={newMonth} onValueChange={setNewMonth}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button onClick={handleAddMonth} disabled={!newMonth} className="flex-1 rounded-xl">Add</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {shopMonths.length === 0 && !showAdd ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No months added</p>
          <p className="text-sm text-muted-foreground">Add a month to start uploading invoices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shopMonths.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMonthClick(m)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{m.label}</p>
                <p className="text-sm text-muted-foreground">
                  {m.invoiceCount} invoices • {m.status}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthDashboard;
