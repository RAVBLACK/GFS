import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useShop } from "@/contexts/ShopContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowRight } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import LightRays from "@/components/LightRays";

const Login = () => {
  const { login, loading } = useAuth();
  const { shops } = useShop();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      setOtpSent(true);
    }
  };

  const handleVerify = async () => {
    await login(phone, otp);
    if (shops.length === 0) {
      navigate("/setup");
    } else {
      navigate("/shops");
    }
  };

  if (loading) return <LoadingScreen message="Verifying OTP..." />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-foreground">
      {/* LightRays Background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#000000"
          raysSpeed={0.5}
          lightSpread={0.6}
          rayLength={0.6}
          pulsating={false}
          fadeDistance={0}
          saturation={0}
          followMouse
          mouseInfluence={0}
          noiseAmount={0}
          distortion={0}
        />
      </div>

      {/* Login Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-16 pb-12 max-w-lg mx-auto animate-fade-in">
        <div className="flex-1 flex flex-col justify-center gap-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary-foreground">Login with Phone</h1>
            <p className="text-primary-foreground/60 text-sm">
              Enter your mobile number to get started
            </p>
          </div>

          <div className="space-y-4 bg-card/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-border/30">
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold text-card-foreground">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-lg text-sm font-semibold text-muted-foreground">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-12 text-lg font-semibold rounded-xl"
                  maxLength={10}
                />
              </div>
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10}
                className="w-full h-14 text-lg font-bold rounded-xl"
              >
                Send OTP <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="font-semibold text-card-foreground">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="tel"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-12 text-2xl text-center font-bold tracking-[0.5em] rounded-xl"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Demo: Enter any 6 digits
                  </p>
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={otp.length < 6}
                  className="w-full h-14 text-lg font-bold rounded-xl"
                >
                  Verify & Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
