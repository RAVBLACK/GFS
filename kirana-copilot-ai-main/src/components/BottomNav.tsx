import { NavLink, useLocation } from "react-router-dom";
import { Home, Store, Upload, FileText } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shops", icon: Store, label: "Shops" },
  { to: "/upload", icon: Upload, label: "Upload" },
  { to: "/gstr1", icon: FileText, label: "GST" },
];

const BottomNav = () => {
  const location = useLocation();

  // Hide on login/setup pages
  if (["/login", "/setup"].includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
