import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useShop } from "@/contexts/ShopContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";
import LightRays from "@/components/LightRays";
import { setupRecaptcha } from "@/lib/firebase";
import { sendOTP, verifyOTP } from "@/services/auth";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

const Login = () => {
  const { loading, setUser } = useAuth();
  const { shops } = useShop();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Setup reCAPTCHA on component mount
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      setRecaptchaVerifier(verifier);
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      toast.error('Failed to initialize authentication');
    }

    // Cleanup on unmount
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!recaptchaVerifier) {
      toast.error('reCAPTCHA not initialized. Please refresh the page.');
      return;
    }

    setSending(true);

    try {
      const confirmation = await sendOTP(phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: unknown) {
      console.error('Error sending OTP:', error);
      
      // Handle specific Firebase errors
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('auth/invalid-phone-number')) {
          toast.error('Invalid phone number format. Please enter 10 digits.');
        } else if (errorMessage.includes('auth/too-many-requests')) {
          toast.error('Too many requests. Please try again after some time.');
        } else if (errorMessage.includes('auth/invalid-app-credential')) {
          toast.error('Firebase configuration error. Please contact support.');
        } else if (errorMessage.includes('auth/unauthorized-domain')) {
          toast.error('Unauthorized domain. Please contact support.');
        } else if (errorMessage.includes('auth/quota-exceeded')) {
          toast.error('SMS quota exceeded. Please try with test numbers.');
        } else {
          toast.error(`Failed to send OTP: ${errorMessage}`);
        }
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      
      // Recreate reCAPTCHA verifier on error
      try {
        if (recaptchaVerifier) {
          recaptchaVerifier.clear();
        }
        const newVerifier = setupRecaptcha('recaptcha-container');
        setRecaptchaVerifier(newVerifier);
      } catch (recaptchaError) {
        console.error('Error recreating reCAPTCHA:', recaptchaError);
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      toast.error('Please request OTP first');
      return;
    }

    setVerifying(true);

    try {
      const user = await verifyOTP(confirmationResult, otp);
      
      // Update auth context
      setUser({
        uid: user.uid,
        phone: user.phoneNumber || phone,
        displayName: user.displayName || undefined,
      });

      toast.success('Login successful!');
      
      // Navigate based on shop setup
      if (shops.length === 0) {
        navigate("/setup");
      } else {
        navigate("/shops");
      }
    } catch (error: unknown) {
      console.error('Error verifying OTP:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('invalid-verification-code')) {
          toast.error('Invalid OTP. Please try again.');
        } else if (error.message.includes('code-expired')) {
          toast.error('OTP expired. Please request a new one.');
          setOtpSent(false);
          setOtp('');
        } else {
          toast.error('Failed to verify OTP. Please try again.');
        }
      } else {
        toast.error('Failed to verify OTP. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingScreen message="Loading..." />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-foreground">
      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container"></div>

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
              Enter your mobile number to receive OTP
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
                  disabled={otpSent}
                />
              </div>
            </div>

            {!otpSent ? (
              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10 || sending}
                className="w-full h-14 text-lg font-bold rounded-xl"
              >
                {sending ? 'Sending...' : 'Send OTP'} <ArrowRight className="w-5 h-5 ml-2" />
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
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit OTP sent to +91-{phone}
                  </p>
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={otp.length < 6 || verifying}
                  className="w-full h-14 text-lg font-bold rounded-xl"
                >
                  {verifying ? 'Verifying...' : 'Verify & Continue'}
                </Button>
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setConfirmationResult(null);
                  }}
                  className="text-sm text-primary hover:underline w-full text-center"
                >
                  Change phone number
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
