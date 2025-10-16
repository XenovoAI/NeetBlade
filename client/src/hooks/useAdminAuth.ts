import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "wouter";

const ADMIN_EMAIL = "teamneetblade@gmail.com";

export function useAdminAuth() {
  const [location, setLocation] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const authCheckCompleted = useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckCompleted.current) {
      return;
    }

    let mounted = true;

    const checkAdminAuth = async () => {
      try {
        console.log("🔐 Checking admin authentication...");
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError || !session) {
          console.log("⚠️ No session - redirecting to admin login");
          setIsLoading(false);
          setLocation("/admin/login");
          return;
        }

        const currentUser = session.user;
        setUser(currentUser);

        console.log("🔍 Verifying admin privileges for:", currentUser.email);
        
        // Check both email AND database is_admin field
        const isAdminEmail = currentUser.email === ADMIN_EMAIL;

        // Check database for is_admin flag
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin, email')
          .eq('email', currentUser.email)
          .single();

        if (!mounted) return;

        console.log("💾 Database admin check:", { 
          userData, 
          error: userError?.message,
          is_admin: userData?.is_admin 
        });

        // User is admin if either email matches OR database is_admin is true
        const hasAdminAccess = isAdminEmail || userData?.is_admin === true;

        if (hasAdminAccess) {
          console.log("✅ Admin access granted");
          setIsAdmin(true);
          setIsLoading(false);
        } else {
          console.log("🚫 User is not admin, redirecting to home");
          setIsAdmin(false);
          setIsLoading(false);
          setLocation("/?error=unauthorized");
        }
      } catch (error) {
        console.error("💥 Admin auth check error:", error);
        if (mounted) {
          setIsLoading(false);
          setLocation("/login?redirect=/admin");
        }
      } finally {
        authCheckCompleted.current = true;
      }
    };

    checkAdminAuth();

    // Listen for auth state changes (signout only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("🔄 Auth state changed:", event);
      
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setUser(null);
        setLocation("/login?redirect=/admin");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Empty array - only run once

  return { isAdmin, isLoading, user };
}
