import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Smartphone } from "lucide-react";
import SplashCursor from "@/components/SplashCursor";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/shops");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-24 max-w-lg mx-auto relative">
      <SplashCursor
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
      />

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 animate-fade-in relative z-10">
        {/* Logo area */}
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <FileText className="w-10 h-10 text-primary-foreground" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-foreground leading-tight">
            GST Filing<br />Copilot
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
            Upload invoice photos, let AI prepare your GSTR-1 draft. Simple, fast, and made for kirana stores.
          </p>
        </div>

        {/* Features */}
        <div className="w-full space-y-3">
          {[
            { icon: Smartphone, text: "Snap invoice photos from your phone" },
            { icon: FileText, text: "AI reads & extracts GST data for you" },
            { icon: Shield, text: "Download GSTR-1 draft CSV — we never submit" },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl p-4 text-left shadow-sm border border-border animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg mt-4"
        >
          🚀 Start Now
        </Button>

        <p className="text-xs text-muted-foreground">
          Free to use • No GST submission • Just draft preparation
        </p>
      </div>
    </div>
  );
};

export default Home;
