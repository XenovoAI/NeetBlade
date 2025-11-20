import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Failed to create session. Please try again.");
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin, email')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError("Unable to verify admin status. Please contact support.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Verify admin status
      if (userData.is_admin !== true && email !== "teamneetblade@gmail.com") {
        setError("Access denied. This page is for administrators only.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success - redirect to admin panel

      setLocation("/admin");
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-16 w-16 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-slate-300">
            <span className="text-purple-400 font-semibold">NEET Blade</span> Administration
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="admin-email" className="text-slate-200">Admin Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@neetblade.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              data-testid="input-admin-email"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="admin-password" className="text-slate-200">Password</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              data-testid="input-admin-password"
              autoComplete="current-password"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
            size="lg" 
            data-testid="button-admin-login"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Sign In as Admin
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 hover:underline" data-testid="link-back-home">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            Not an admin? <Link href="/login" className="text-purple-400 hover:underline">Student Login</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
