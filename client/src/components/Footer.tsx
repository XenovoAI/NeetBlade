import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiTelegram, SiYoutube, SiInstagram } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-foreground">NEET</span>
              <span className="text-primary"> Blade</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Your comprehensive NEET preparation platform with expert study materials and live tests.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://telegram.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center hover-elevate transition-all"
                data-testid="link-telegram"
              >
                <SiTelegram className="h-5 w-5 text-secondary-foreground" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center hover-elevate transition-all"
                data-testid="link-youtube"
              >
                <SiYoutube className="h-5 w-5 text-secondary-foreground" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center hover-elevate transition-all"
                data-testid="link-instagram"
              >
                <SiInstagram className="h-5 w-5 text-secondary-foreground" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-about">
                About Us
              </Link>
              <Link href="/materials" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-materials">
                Study Materials
              </Link>
              <Link href="/tests" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-tests">
                Live Tests
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contact">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-terms">
                Terms of Service
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get updates on new materials and tests
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button size="default" data-testid="button-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} NEET Blade. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
