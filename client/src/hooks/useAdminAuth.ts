import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "wouter";

const ADMIN_EMAIL = "teamneetblade@gmail.com";

export function useAdminAuth() {
  const [, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const hasCheckedAuth = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const checkAdminAuth = async () => {
      // Prevent multiple simultaneous checks
      if (hasCheckedAuth.current) return;
      hasCheckedAuth.current = true;
      
      try {
        console.log("Starting admin authentication check...");
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check result:", { 
          hasSession: !!session, 
          error: sessionError?.message,
          userEmail: session?.user?.email 
        });
        
        if (!isMounted.current) return;
        
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
        if (isMounted.current) {
          setUser(currentUser);
        }

        // Check both email AND database is_admin field
        console.log("Checking admin status for:", currentUser.email);
        
        // First check email
        const isAdminEmail = currentUser.email === ADMIN_EMAIL;
        console.log("Email check:", { currentEmail: currentUser.email, isMatch: isAdminEmail });

        // Also check database for is_admin flag
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin, email')
          .eq('email', currentUser.email)
          .single();

        console.log("Database admin check:", { 
          userData, 
          error: userError?.message,
          is_admin: userData?.is_admin 
        });

        if (!isMounted.current) return;

        // User is admin if either email matches OR database is_admin is true
        const hasAdminAccess = isAdminEmail || userData?.is_admin === true;

        if (hasAdminAccess) {
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
        if (isMounted.current) {
          setIsLoading(false);
          setLocation("/login?redirect=/admin");
        }
      }
    };

    // Run the check
    checkAdminAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      if (event === 'SIGNED_OUT' && isMounted.current) {
        setIsAdmin(false);
        setUser(null);
        setLocation("/login?redirect=/admin");
      }
    });

    return () => {
      isMounted.current = false;
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array - run only once on mount

  return { isAdmin, isLoading, user };
}
