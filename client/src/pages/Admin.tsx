import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, BarChart3, Settings, Upload, Trash2, Edit } from "lucide-react";

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Student", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Student", status: "Active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Student", status: "Inactive" },
];

const materials = [
  { id: 1, title: "Physics - Mechanics", subject: "Physics", type: "PDF", uploaded: "2024-01-15" },
  { id: 2, title: "Chemistry - Organic", subject: "Chemistry", type: "Video", uploaded: "2024-01-10" },
];

const tests = [
  { id: 1, name: "NEET Mock Test 1", questions: 180, duration: 180, attempts: 245 },
  { id: 2, name: "Physics Sectional", questions: 30, duration: 60, attempts: 156 },
];

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
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-users">1,245</div>
            <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Tests</span>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-tests">156</div>
            <p className="text-sm text-muted-foreground mt-1">8 added this week</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Study Materials</span>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-total-materials">342</div>
            <p className="text-sm text-muted-foreground mt-1">15 uploaded this week</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Test Attempts</span>
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-test-attempts">5,678</div>
            <p className="text-sm text-muted-foreground mt-1">+24% from last week</p>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">New user registration</p>
                    <p className="text-sm text-muted-foreground">Sarah Williams joined 2 hours ago</p>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Test completed</p>
                    <p className="text-sm text-muted-foreground">156 students completed Mock Test 3</p>
                  </div>
                  <Badge variant="outline">Today</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Material uploaded</p>
                    <p className="text-sm text-muted-foreground">Biology Chapter 12 notes added</p>
                  </div>
                  <Badge variant="outline">Yesterday</Badge>
                </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover-elevate" data-testid={`row-user-${user.id}`}>
                        <td className="py-3 px-4 text-sm text-foreground">{user.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge className={user.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-user-${user.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-user-${user.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <div className="space-y-4">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-4 bg-card rounded-lg hover-elevate" data-testid={`card-material-${material.id}`}>
                    <div>
                      <h3 className="font-medium text-foreground">{material.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{material.subject}</Badge>
                        <Badge variant="outline">{material.type}</Badge>
                        <span className="text-sm text-muted-foreground">Uploaded: {material.uploaded}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-material-${material.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-material-${material.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Test Management</h2>
                <Button data-testid="button-create-test">Create New Test</Button>
              </div>
              <div className="space-y-4">
                {tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-card rounded-lg hover-elevate" data-testid={`card-test-${test.id}`}>
                    <div>
                      <h3 className="font-medium text-foreground">{test.name}</h3>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{test.questions} questions</span>
                        <span>{test.duration} min</span>
                        <span>{test.attempts} attempts</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-test-${test.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-test-${test.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
