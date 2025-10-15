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
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("No session found, redirecting to login");
        setIsLoading(false);
        setLocation("/login?redirect=/admin");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // Check if user email matches admin email
      if (currentUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setIsLoading(false);
      } else {
        console.log("User is not admin, redirecting to home");
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
