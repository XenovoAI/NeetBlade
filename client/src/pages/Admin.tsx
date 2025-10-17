import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAuth } from "@/hooks/useAdminAuth";

type User = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, FileText, BarChart3, Settings, Upload, Trash2, Edit, Loader2, ShieldAlert, IndianRupee, Copy, ExternalLink } from "lucide-react";
import AdminMaterialUploadModal from "./AdminMaterialUploadModal";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { isAdmin, isLoading, user } = useAdminAuth();
  const { toast } = useToast();
  
  // Declare ALL hooks at the top before any conditional returns
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userCount, setUserCount] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Payment related states
  const [paymentAmount, setPaymentAmount] = useState("");
  const [generatedPaymentLink, setGeneratedPaymentLink] = useState("");
  const razorpayBaseLink = "https://razorpay.me/@teamneetblade";

  useEffect(() => {
    // Only fetch data if admin
    if (!isAdmin || isLoading) return;
    
    // Fetch counts
    supabase.from("users").select("id", { count: "exact", head: true }).then(({ count }) => setUserCount(count || 0));
    supabase.from("tests").select("id", { count: "exact", head: true }).then(({ count }) => setTestCount(count || 0));
    supabase.from("materials").select("id", { count: "exact", head: true }).then(({ count }) => setMaterialCount(count || 0));
    supabase.from("attempts").select("id", { count: "exact", head: true }).then(({ count }) => setAttemptCount(count || 0));
    // Fetch users
    supabase.from("users").select("id, email, username, created_at").then(({ data }) => setUsers(data || []));
    // Fetch materials
    refreshMaterials();
  }, [isAdmin, isLoading]);

  const refreshMaterials = async () => {
    setLoadingMaterials(true);
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setMaterials(data);
      setMaterialCount(data.length);
    }
    setLoadingMaterials(false);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return;
    
    setDeletingId(id);
    const { error } = await supabase.from("materials").delete().eq("id", id);
    
    if (!error) {
      await refreshMaterials();
    } else {
      alert("Failed to delete material: " + error.message);
    }
    setDeletingId(null);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generatePaymentLink = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Generate payment link with amount
    const amount = parseFloat(paymentAmount);
    const linkWithAmount = `${razorpayBaseLink}/${amount}`;
    setGeneratedPaymentLink(linkWithAmount);
    
    toast({
      title: "Payment Link Generated",
      description: `Payment link for ₹${amount} created successfully`,
    });
  };

  const copyPaymentLink = () => {
    if (generatedPaymentLink) {
      navigator.clipboard.writeText(generatedPaymentLink);
      toast({
        title: "Link Copied",
        description: "Payment link copied to clipboard",
      });
    }
  };

  const openPaymentLink = () => {
    if (generatedPaymentLink) {
      window.open(generatedPaymentLink, '_blank');
    }
  };
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not admin, show unauthorized message (shouldn't reach here due to redirect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin panel.
          </p>
          <Button onClick={() => window.location.href = "/"}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-lg text-muted-foreground">Manage your NEET Blade platform</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-users">{userCount}</div>
            <p className="text-sm text-muted-foreground mt-1">{userCount === 0 ? "No users yet" : `${userCount} users`}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Tests</span>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-tests">{testCount}</div>
            <p className="text-sm text-muted-foreground mt-1">{testCount === 0 ? "No tests created" : `${testCount} tests`}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Study Materials</span>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-materials">{materialCount}</div>
            <p className="text-sm text-muted-foreground mt-1">{materialCount === 0 ? "No materials uploaded" : `${materialCount} materials`}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Test Attempts</span>
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-test-attempts">{attemptCount}</div>
            <p className="text-sm text-muted-foreground mt-1">{attemptCount === 0 ? "No attempts yet" : `${attemptCount} attempts`}</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6" data-testid="tabs-admin">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="materials" data-testid="tab-materials">Materials</TabsTrigger>
            <TabsTrigger value="tests" data-testid="tab-tests">Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Recent Activity</h2>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recent activity to display</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <div className="flex gap-2">
                  <Input placeholder="Search users..." className="w-64" data-testid="input-search-users" value={search} onChange={e => setSearch(e.target.value)} />
                  <Button data-testid="button-add-user">Add User</Button>
                </div>
              </div>
              <div>
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No users found. Add your first user to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Username</th>
                          <th className="px-4 py-2 text-left">Joined</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase())).map(user => (
                          <tr key={user.id} className="border-b">
                            <td className="px-4 py-2">{user.email}</td>
                            <td className="px-4 py-2">{user.username}</td>
                            <td className="px-4 py-2">{user.created_at?.slice(0, 10)}</td>
                            <td className="px-4 py-2 flex gap-2">
                              <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                              <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Study Materials</h2>
                <Button data-testid="button-upload-material" onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </div>
              <AdminMaterialUploadModal open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={refreshMaterials} />
              
              {loadingMaterials ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading materials...</p>
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No study materials uploaded yet.</p>
                  <Button onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Material
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Subject</th>
                        <th className="px-4 py-2 text-left">Size</th>
                        <th className="px-4 py-2 text-left">Uploaded</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map(material => (
                        <tr key={material.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{material.title}</div>
                              {material.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {material.description.length > 60 
                                    ? material.description.substring(0, 60) + '...' 
                                    : material.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize">
                              {material.subject || 'N/A'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {formatFileSize(material.file_size)}
                          </td>
                          <td className="px-4 py-3">{material.created_at?.slice(0, 10)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(material.url, '_blank')}
                                title="View"
                              >
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDeleteMaterial(material.id)}
                                disabled={deletingId === material.id}
                              >
                                {deletingId === material.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Test Management</h2>
                <Button data-testid="button-create-test">Create New Test</Button>
              </div>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tests created. Create your first test to get started.</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
