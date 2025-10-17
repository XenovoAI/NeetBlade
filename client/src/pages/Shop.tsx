import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IndianRupee, FileText, ShoppingCart, Search, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Material = {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  thumbnail_url: string;
  file_name: string;
  file_size: number;
  created_at: string;
};

export default function Shop() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [searchQuery, selectedSubject, materials]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchMaterials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .not("price", "is", null)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMaterials(data);
      setFilteredMaterials(data);
    }
    setLoading(false);
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter(m => m.subject === selectedSubject);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleBuyNow = async (material: Material) => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase study materials",
        variant: "destructive",
      });
      setLocation(`/login?redirect=/shop`);
      return;
    }

    // Check if user already owns this material
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("material_id", material.id)
      .eq("status", "completed")
      .single();

    if (existingOrder) {
      toast({
        title: "Already Purchased",
        description: "You already own this material. Check 'My Purchases'",
      });
      setLocation("/my-purchases");
      return;
    }

    // Create pending order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        material_id: material.id,
        user_email: user.email,
        amount: material.price,
        status: "pending",
        payment_link: `https://razorpay.me/@teamneetblade?amount=T%2FpUAiSSrhOK7IH%2BNk7Kdg%3D%3D`,
      })
      .select()
      .single();

    if (orderError) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to payment page
    setLocation(`/payment/${order.id}`);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Study Materials Store
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse and purchase premium NEET study materials
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-materials"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedSubject === "all" ? "default" : "outline"}
              onClick={() => setSelectedSubject("all")}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button
              variant={selectedSubject === "physics" ? "default" : "outline"}
              onClick={() => setSelectedSubject("physics")}
              data-testid="filter-physics"
            >
              Physics
            </Button>
            <Button
              variant={selectedSubject === "chemistry" ? "default" : "outline"}
              onClick={() => setSelectedSubject("chemistry")}
              data-testid="filter-chemistry"
            >
              Chemistry
            </Button>
            <Button
              variant={selectedSubject === "biology" ? "default" : "outline"}
              onClick={() => setSelectedSubject("biology")}
              data-testid="filter-biology"
            >
              Biology
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading materials...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No materials found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedSubject !== "all"
                ? "Try adjusting your filters"
                : "Check back later for new materials"}
            </p>
          </div>
        )}

        {/* Materials Grid */}
        {!loading && filteredMaterials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid="material-card">
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative">
                  {material.thumbnail_url ? (
                    <img
                      src={material.thumbnail_url}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 capitalize">
                    {material.subject}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid="material-title">
                    {material.title}
                  </h3>
                  
                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {material.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                      <IndianRupee className="h-5 w-5" />
                      {material.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(material.file_size)}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleBuyNow(material)}
                    data-testid="button-buy-now"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
