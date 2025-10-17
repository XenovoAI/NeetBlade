import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "wouter";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthUser();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                <span className="text-foreground">NEET</span>
                <span className="text-primary"> Blade</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-foreground hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-home">
                Home
              </Link>
              <Link href="/shop" className="text-sm font-medium text-foreground hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-shop">
                Shop
              </Link>
              <Link href="/materials" className="text-sm font-medium text-foreground hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-materials">
                Study Materials
              </Link>
              <Link href="/tests" className="text-sm font-medium text-foreground hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-tests">
                Live Tests
              </Link>
              <Link href="/about" className="text-sm font-medium text-foreground hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-about">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-foreground hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-contact">
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="default" size="default" data-testid="button-dashboard">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="default" data-testid="button-logout" onClick={handleLogout}>
                  Logout
                </Button>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2" data-testid="link-admin">
                  Admin
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="default" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="default" data-testid="button-register">
                    Register
                  </Button>
                </Link>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2" data-testid="link-admin">
                  Admin
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md hover-elevate"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Link href="/" className="block px-3 py-2 text-sm font-medium text-foreground hover-elevate rounded-md" data-testid="mobile-link-home">
              Home
            </Link>
            <Link href="/materials" className="block px-3 py-2 text-sm font-medium text-foreground hover-elevate rounded-md" data-testid="mobile-link-materials">
              Study Materials
            </Link>
            <Link href="/tests" className="block px-3 py-2 text-sm font-medium text-foreground hover-elevate rounded-md" data-testid="mobile-link-tests">
              Live Tests
            </Link>
            <Link href="/about" className="block px-3 py-2 text-sm font-medium text-foreground hover-elevate rounded-md" data-testid="mobile-link-about">
              About
            </Link>
            <Link href="/contact" className="block px-3 py-2 text-sm font-medium text-foreground hover-elevate rounded-md" data-testid="mobile-link-contact">
              Contact
            </Link>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button variant="default" size="default" className="w-full" data-testid="mobile-button-dashboard">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="default" className="w-full" data-testid="mobile-button-logout" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Link href="/admin" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-2" data-testid="mobile-link-admin">
                    Admin
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" size="default" className="w-full" data-testid="mobile-button-login">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button variant="default" size="default" className="w-full" data-testid="mobile-button-register">
                      Register
                    </Button>
                  </Link>
                  <Link href="/admin" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-2" data-testid="mobile-link-admin">
                    Admin
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
