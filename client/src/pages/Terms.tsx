import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Terms of Service</h1>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using NEET Blade, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You agree to use NEET Blade only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use the service in any way that violates any applicable law or regulation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Share your account credentials with others</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Upload or distribute any content that infringes intellectual property rights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Attempt to gain unauthorized access to any portion of the service</span>
            </li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The content, features, and functionality of NEET Blade are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Payment and Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            Subscription fees are billed in advance on a recurring basis. Refunds are provided only in accordance with our refund policy, which is available upon request.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account and access to the service immediately, without prior notice, for any breach of these Terms.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            NEET Blade shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For any questions about these Terms, please contact us at legal@neetblade.com
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
