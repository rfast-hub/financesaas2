import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Initial session check with persistent session handling
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Session check error:', error);
          setIsAuthenticated(false);
          toast({
            title: "Session Error",
            description: "Please sign in again",
            variant: "destructive",
          });
        } else {
          console.log('Initial session check:', session);
          if (session) {
            // Ensure session is properly persisted
            await supabase.auth.setSession(session);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error during session check:', error);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initialize Supabase auth listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session);

      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            await supabase.auth.setSession(session);
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          break;
        case 'SIGNED_OUT':
          setIsAuthenticated(false);
          queryClient.clear();
          setIsLoading(false);
          break;
        case 'TOKEN_REFRESHED':
          if (session) {
            console.log('Token refreshed:', session);
            await supabase.auth.setSession(session);
            setIsAuthenticated(true);
          }
          break;
        case 'USER_UPDATED':
          if (session) {
            console.log('User updated:', session);
            await supabase.auth.setSession(session);
            setIsAuthenticated(true);
          }
          break;
      }
    });

    // Check session on mount
    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;