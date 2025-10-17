import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, FileText, Loader2, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const [, params] = useRoute("/payment-success/:orderId");
  const [location, setLocation] = useLocation();
  
  const [order, setOrder] = useState<any>(null);
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.orderId) {
      fetchOrderDetails(params.orderId);
    }
  }, [params?.orderId]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLocation("/login");
      return;
    }

    // Fetch order details
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", session.user.id)
      .single();

    if (orderError || !orderData) {
      setLocation("/shop");
      return;
    }

    setOrder(orderData);

    // Fetch material details
    const { data: materialData } = await supabase
      .from("materials")
      .select("*")
      .eq("id", orderData.material_id)
      .single();

    if (materialData) {
      setMaterial(materialData);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (material?.url) {
      window.open(material.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your study material is ready to download.
            </p>
          </div>

          {/* Order Details */}
          {material && (
            <Card className="p-6 mb-6 text-left bg-muted/50">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 bg-background rounded flex-shrink-0">
                  {material.thumbnail_url ? (
                    <img
                      src={material.thumbnail_url}
                      alt={material.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{material.title}</h3>
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {material.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Order ID: <span className="font-mono">{order?.id.slice(0, 8)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Amount Paid: ₹{order?.amount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Download Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full md:w-auto"
              onClick={handleDownload}
              data-testid="button-download-material"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Study Material
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/my-purchases")}
                data-testid="button-my-purchases"
              >
                View My Purchases
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/shop")}
                data-testid="button-continue-shopping"
              >
                Continue Shopping
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-left">
            <h4 className="font-semibold mb-2">📧 What's Next?</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Download your material using the button above</li>
              <li>• Access all your purchases anytime in "My Purchases"</li>
              <li>• You will receive an email confirmation shortly</li>
              <li>• For any issues, contact support@neetblade.com</li>
            </ul>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
