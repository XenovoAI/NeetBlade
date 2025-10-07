import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, BarChart3, Settings, Upload, Trash2, Edit } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">Manage your NEET Blade platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-users">0</div>
            <p className="text-sm text-muted-foreground mt-1">No users yet</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Tests</span>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-tests">0</div>
            <p className="text-sm text-muted-foreground mt-1">No tests created</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Study Materials</span>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-materials">0</div>
            <p className="text-sm text-muted-foreground mt-1">No materials uploaded</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Test Attempts</span>
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-test-attempts">0</div>
            <p className="text-sm text-muted-foreground mt-1">No attempts yet</p>
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
                  <Input placeholder="Search users..." className="w-64" data-testid="input-search-users" />
                  <Button data-testid="button-add-user">Add User</Button>
                </div>
              </div>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found. Add your first user to get started.</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="materials">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Study Materials</h2>
                <Button data-testid="button-upload-material">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </div>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No study materials uploaded. Upload your first material to get started.</p>
              </div>
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
