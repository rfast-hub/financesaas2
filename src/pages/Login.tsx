import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 5,
  timeWindow: 15 * 60 * 1000, // 15 minutes
};

const Login = () => {
  const navigate = useNavigate();
  const [loginAttempts, setLoginAttempts] = useState<{ count: number; timestamp: number }>(() => {
    const stored = localStorage.getItem('loginAttempts');
    return stored ? JSON.parse(stored) : { count: 0, timestamp: Date.now() };
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Reset login attempts on successful sign in
        setLoginAttempts({ count: 0, timestamp: Date.now() });
        localStorage.setItem('loginAttempts', JSON.stringify({ count: 0, timestamp: Date.now() }));
        navigate("/dashboard");
      }

      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check and update rate limiting
  const checkRateLimit = () => {
    const now = Date.now();
    if (now - loginAttempts.timestamp > RATE_LIMIT.timeWindow) {
      // Reset if time window has passed
      setLoginAttempts({ count: 1, timestamp: now });
      localStorage.setItem('loginAttempts', JSON.stringify({ count: 1, timestamp: now }));
      return false;
    }

    if (loginAttempts.count >= RATE_LIMIT.maxAttempts) {
      const remainingTime = Math.ceil((RATE_LIMIT.timeWindow - (now - loginAttempts.timestamp)) / 60000);
      toast.error(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
      return true;
    }

    // Increment attempt count
    const newAttempts = { count: loginAttempts.count + 1, timestamp: loginAttempts.timestamp };
    setLoginAttempts(newAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(newAttempts));
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to access your crypto dashboard</p>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                  },
                },
              },
            }}
            providers={[]}
            view="sign_in"
            showLinks={false}
            onSubmit={async () => {
              if (checkRateLimit()) {
                return false;
              }
            }}
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside">
              <li>Minimum 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;