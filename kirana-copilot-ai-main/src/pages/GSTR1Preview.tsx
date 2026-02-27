import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, IndianRupee } from "lucide-react";
import { fetchGSTR1 } from "@/services/api";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";

const GSTR1Preview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gstr1Data, setGstr1Data] = useState<{
    summary: {
      totalInvoices: number;
      totalTaxableAmount: number;
      totalCGST: number;
      totalSGST: number;
      totalIGST: number;
      totalTax: number;
      totalAmount: number;
    };
    csvData: string;
  } | null>(null);

  useEffect(() => {
    const loadGSTR1Data = async () => {
      try {
        const data = await fetchGSTR1("current_month");
        setGstr1Data(data);
      } catch (error) {
        console.error("Error loading GSTR-1:", error);
        toast.error(
          error instanceof Error 
            ? error.message 
            : "Failed to load GSTR-1 data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadGSTR1Data();
  }, []);

  const downloadCSV = () => {
    if (!gstr1Data) return;
    
    const blob = new Blob([gstr1Data.csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_Draft_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully!");
  };

  if (loading) {
    return <LoadingScreen message="🧾 Generating GSTR-1 report..." />;
  }

  if (!gstr1Data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-foreground">No GSTR-1 data available</p>
          <p className="text-sm text-muted-foreground">Please analyze invoices first.</p>
          <Button onClick={() => navigate("/upload")} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  const { summary } = gstr1Data;

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 pb-24 max-w-lg mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary font-semibold text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">🧾 GSTR-1 Draft</h1>
        <p className="text-sm text-muted-foreground">December 2024 Summary</p>
      </div>

      {/* Summary card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount to be Paid</p>
            <p className="text-2xl font-extrabold text-foreground">₹{summary.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Invoices", value: summary.totalInvoices },
            { label: "Base Amount", value: `₹${summary.totalTaxableAmount.toLocaleString()}` },
            { label: "Total Tax", value: `₹${summary.totalTax.toLocaleString()}` },
            { label: "CGST", value: `₹${summary.totalCGST.toLocaleString()}` },
            { label: "SGST", value: `₹${summary.totalSGST.toLocaleString()}` },
            { label: "IGST", value: `₹${summary.totalIGST.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</p>
              <p className="text-base font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
        <p className="text-xs text-foreground font-medium">
          ⚠️ This is a DRAFT only. This tool does NOT submit GST returns. Please verify all data before filing on the GST portal.
        </p>
      </div>

      {/* Download */}
      <Button
        onClick={downloadCSV}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-xl gap-2"
      >
        <Download className="w-5 h-5" /> Download CSV Draft
      </Button>

      <Button
        variant="outline"
        onClick={() => navigate("/")}
        className="w-full h-12 mt-3 rounded-xl font-semibold"
      >
        <FileText className="w-4 h-4 mr-2" /> Back to Home
      </Button>
    </div>
  );
};

export default GSTR1Preview;
