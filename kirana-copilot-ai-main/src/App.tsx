import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShopProvider } from "@/contexts/ShopContext";
import { MonthProvider } from "@/contexts/MonthContext";
import BottomNav from "@/components/BottomNav";
import Home from "./pages/Home";
import Login from "./pages/Login";
import FirstTimeSetup from "./pages/FirstTimeSetup";
import ShopDashboard from "./pages/ShopDashboard";
import MonthDashboard from "./pages/MonthDashboard";
import UploadInvoice from "./pages/UploadInvoice";
import InvoiceResult from "./pages/InvoiceResult";
import GSTR1Preview from "./pages/GSTR1Preview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ShopProvider>
        <MonthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/setup" element={<FirstTimeSetup />} />
                <Route path="/shops" element={<ShopDashboard />} />
                <Route path="/months" element={<MonthDashboard />} />
                <Route path="/upload" element={<UploadInvoice />} />
                <Route path="/results" element={<InvoiceResult />} />
                <Route path="/gstr1" element={<GSTR1Preview />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </BrowserRouter>
          </TooltipProvider>
        </MonthProvider>
      </ShopProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
