import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IndianRupee, Loader2, AlertCircle, ExternalLink, CheckCircle2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payment() {
  const [, params] = useRoute("/payment/:orderId");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<any>(null);
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

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
      toast({
        title: "Unauthorized",
        description: "Please login to continue",
        variant: "destructive",
      });
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
      toast({
        title: "Order Not Found",
        description: "Invalid order ID",
        variant: "destructive",
      });
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

  const handleProceedToPayment = () => {
    setPaymentProcessing(true);
    // Open Razorpay payment link in new window
    const paymentWindow = window.open(order.payment_link, '_blank');
    
    // Start checking for payment completion
    toast({
      title: "Payment Window Opened",
      description: "Complete your payment and click 'I have completed payment'",
    });
  };

  const handlePaymentCompleted = async () => {
    toast({
      title: "Verifying Payment",
      description: "Please wait while we verify your payment...",
    });

    // Update order status to completed
    const { error } = await supabase
      .from("orders")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", order.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to success page
    setLocation(`/payment-success/${order.id}`);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Complete Your Purchase</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {material && (
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-32 h-32 bg-muted rounded flex-shrink-0">
                    {material.thumbnail_url ? (
                      <img
                        src={material.thumbnail_url}
                        alt={material.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{material.title}</h3>
                    <Badge className="mb-2 capitalize">{material.subject}</Badge>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {material.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Size: {formatFileSize(material.file_size)}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Instructions</h2>
              
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> After clicking "Proceed to Payment", you will be redirected to Razorpay's secure payment page. Complete the payment and return here to confirm.
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <p>Click "Proceed to Payment" button below</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <p>Complete payment on Razorpay page (UPI, Card, Net Banking)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <p>Return to this page and click "I have completed payment"</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <p>Get instant download access to your material</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Price Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {order?.amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="flex items-center">
                    <IndianRupee className="h-4 w-4" />
                    {(order?.amount * 0.18)?.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="flex items-center text-primary">
                      <IndianRupee className="h-5 w-5" />
                      {(order?.amount * 1.18)?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={paymentProcessing || order?.status === "completed"}
                  data-testid="button-proceed-payment"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>

                {paymentProcessing && (
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    onClick={handlePaymentCompleted}
                    data-testid="button-payment-done"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    I have completed payment
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure payment powered by Razorpay
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
