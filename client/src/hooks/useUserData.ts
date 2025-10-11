import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useUserData() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch profile data from a 'profiles' table (customize as needed)
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  return { user, profile, loading };
}
