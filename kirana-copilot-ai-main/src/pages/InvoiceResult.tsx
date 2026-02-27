import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Info } from "lucide-react";
import type { InvoiceData } from "@/services/openai";

interface LocationState {
  invoices: InvoiceData[];
  explanation: string;
}

const getConfidenceBadge = (c: number) => {
  if (c >= 0.9)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold bg-success/15 text-success px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" /> High
      </span>
    );
  if (c >= 0.8)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold bg-warning/15 text-warning px-2 py-0.5 rounded-full">
        <Info className="w-3 h-3" /> Medium
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold bg-destructive/15 text-destructive px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" /> Review
    </span>
  );
};

const InvoiceResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Use data from navigation state, fallback to mock data if not available
  const invoices = state?.invoices || [];
  const explanation = state?.explanation || "No analysis results available.";

  // If no invoices, redirect back
  if (invoices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-foreground">No invoice data available</p>
          <p className="text-sm text-muted-foreground">Please upload and analyze invoices first.</p>
          <Button onClick={() => navigate("/upload")} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 pb-24 max-w-lg mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary font-semibold text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-extrabold text-foreground">📊 Analysis Results</h1>
        <p className="text-sm text-muted-foreground">{invoices.length} invoices processed</p>
      </div>

      {/* AI explanation */}
      <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-5">
        <p className="text-sm text-accent-foreground font-medium">
          🤖 {explanation}
        </p>
      </div>

      {/* Invoice cards */}
      <div className="space-y-3 mb-6">
        {invoices.map((inv, i) => (
          <div
            key={inv.id}
            className="bg-card border border-border rounded-xl p-4 shadow-sm animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-sm truncate">{inv.vendor}</p>
                <p className="text-xs text-muted-foreground">{inv.invoiceNo} • {inv.date}</p>
              </div>
              {getConfidenceBadge(inv.confidence)}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-muted rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">Base Amount</p>
                <p className="text-sm font-bold text-foreground">₹{(inv.taxableAmount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">Total Tax</p>
                <p className="text-sm font-bold text-foreground">₹{((inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0)).toLocaleString()}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">To be Paid</p>
                <p className="text-sm font-bold text-primary">₹{(inv.total || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={() => navigate("/gstr1")}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-xl gap-2"
      >
        <FileText className="w-5 h-5" /> View GST Summary
      </Button>
    </div>
  );
};

export default InvoiceResult;
