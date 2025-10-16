import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "wouter";

const ADMIN_EMAIL = "teamneetblade@gmail.com";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      console.log("Starting admin authentication check...");
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log("Session check result:", { 
        hasSession: !!session, 
        error: sessionError?.message,
        userEmail: session?.user?.email 
      });
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setIsLoading(false);
        setLocation("/login?redirect=/admin");
        return;
      }

      if (!session) {
        console.log("No session found, redirecting to login");
        setIsLoading(false);
        setLocation("/login?redirect=/admin");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      console.log("Checking admin status:", {
        currentEmail: currentUser.email,
        adminEmail: ADMIN_EMAIL,
        isMatch: currentUser.email === ADMIN_EMAIL
      });

      // Check if user email matches admin email
      if (currentUser.email === ADMIN_EMAIL) {
        console.log("✓ Admin access granted");
        setIsAdmin(true);
        setIsLoading(false);
      } else {
        console.log("✗ User is not admin, redirecting to home");
        setIsAdmin(false);
        setIsLoading(false);
        setLocation("/?error=unauthorized");
      }
    } catch (error) {
      console.error("Admin auth check error:", error);
      setIsLoading(false);
      setLocation("/login?redirect=/admin");
    }
  };

  return { isAdmin, isLoading, user };
}
