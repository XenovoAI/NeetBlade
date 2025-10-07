import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Privacy Policy</h1>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            At NEET Blade, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Personal information such as name, email address, and phone number</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Academic information and test performance data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Usage data and preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Payment information for subscription services</span>
            </li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Provide, maintain, and improve our services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Process your transactions and send related information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Send you technical notices, updates, and support messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Respond to your comments and questions</span>
            </li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Access and receive a copy of your personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Rectify inaccurate personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Request deletion of your personal data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Object to processing of your personal data</span>
            </li>
          </ul>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at privacy@neetblade.com
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
