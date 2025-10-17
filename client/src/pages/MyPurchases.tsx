import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Loader2, ShoppingBag, IndianRupee } from "lucide-react";

type Purchase = {
  id: string;
  material_id: string;
  amount: number;
  status: string;
  created_at: string;
  completed_at: string;
  material: {
    id: string;
    title: string;
    description: string;
    subject: string;
    thumbnail_url: string;
    url: string;
    file_name: string;
    file_size: number;
  };
};

export default function MyPurchases() {
  const [location, setLocation] = useLocation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndFetchPurchases();
  }, []);

  const checkUserAndFetchPurchases = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLocation("/login?redirect=/my-purchases");
      return;
    }

    setUser(session.user);
    await fetchPurchases(session.user.id);
  };

  const fetchPurchases = async (userId: string) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        material:materials (
          id,
          title,
          description,
          subject,
          thumbnail_url,
          url,
          file_name,
          file_size
        )
      `)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (!error && data) {
      setPurchases(data as any);
    }

    setLoading(false);
  };

  const handleDownload = (material: any) => {
    if (material?.url) {
      window.open(material.url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" />
            My Purchases
          </h1>
          <p className="text-lg text-muted-foreground">
            Access all your purchased study materials
          </p>
        </div>

        {/* Empty State */}
        {purchases.length === 0 && (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Purchases Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't purchased any study materials yet
            </p>
            <Button onClick={() => setLocation("/shop")} data-testid="button-browse-materials">
              Browse Materials
            </Button>
          </Card>
        )}

        {/* Purchases List */}
        {purchases.length > 0 && (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="p-6" data-testid="purchase-card">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="w-full md:w-48 h-32 bg-muted rounded flex-shrink-0">
                    {purchase.material?.thumbnail_url ? (
                      <img
                        src={purchase.material.thumbnail_url}
                        alt={purchase.material.title}
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-xl mb-2" data-testid="purchase-title">
                          {purchase.material?.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="capitalize">{purchase.material?.subject}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(purchase.material?.file_size)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                          <IndianRupee className="h-4 w-4" />
                          {purchase.amount.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Purchased on {formatDate(purchase.completed_at || purchase.created_at)}
                        </p>
                      </div>
                    </div>

                    {purchase.material?.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {purchase.material.description}
                      </p>
                    )}

                    <Button
                      onClick={() => handleDownload(purchase.material)}
                      data-testid="button-download"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Material
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {purchases.length > 0 && (
          <Card className="p-6 mt-8">
            <h3 className="font-semibold text-lg mb-4">Purchase Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
                <p className="text-2xl font-bold">{purchases.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-2xl font-bold flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {purchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subjects</p>
                <div className="flex gap-1 flex-wrap mt-1">
                  {Array.from(new Set(purchases.map(p => p.material?.subject))).map(subject => (
                    <Badge key={subject} variant="outline" className="capitalize">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
