import { useNavigate } from "react-router-dom";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Store, ChevronRight, LogOut } from "lucide-react";

const ShopDashboard = () => {
  const { user, logout } = useAuth();
  const { shops, selectShop } = useShop();
  const navigate = useNavigate();

  const handleShopClick = (shop: typeof shops[0]) => {
    selectShop(shop);
    navigate("/months");
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 pb-24 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-extrabold text-foreground">
            {user?.displayName || "User"} 👋
          </h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Shops list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Your Shops</h2>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-1"
          onClick={() => navigate("/setup")}
        >
          <Plus className="w-4 h-4" /> Add Shop
        </Button>
      </div>

      {shops.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Store className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No shops yet</p>
            <p className="text-sm text-muted-foreground">Add your first shop to get started</p>
          </div>
          <Button onClick={() => navigate("/setup")} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Shop
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleShopClick(shop)}
              className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{shop.name}</p>
                <p className="text-sm text-muted-foreground">{shop.type}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopDashboard;
