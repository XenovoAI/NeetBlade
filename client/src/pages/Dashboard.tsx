import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, BookOpen, Award, Play } from "lucide-react";

const recentTests = [
  { id: 1, name: "NEET Mock Test 1", score: 75, date: "2 days ago" },
  { id: 2, name: "Physics - Mechanics", score: 82, date: "5 days ago" },
  { id: 3, name: "Chemistry - Organic", score: 68, date: "1 week ago" },
];

const bookmarkedMaterials = [
  { id: 1, title: "Thermodynamics Notes", subject: "Physics" },
  { id: 2, title: "Organic Chemistry Video", subject: "Chemistry" },
  { id: 3, title: "Cell Biology Notes", subject: "Biology" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">JD</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-username">John Doe</h1>
              <p className="text-muted-foreground">NEET 2025 Aspirant</p>
            </div>
          </div>
          <Button variant="outline" data-testid="button-edit-profile">Edit Profile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tests Taken</span>
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-tests-taken">24</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg. Score</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-avg-score">72%</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Study Time</span>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-study-time">45h</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Materials</span>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-materials-count">156</div>
          </Card>
        </div>

        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="mb-6" data-testid="tabs-dashboard">
            <TabsTrigger value="tests" data-testid="tab-tests">Recent Tests</TabsTrigger>
            <TabsTrigger value="bookmarks" data-testid="tab-bookmarks">Bookmarked Materials</TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Test Results</h2>
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-card rounded-lg hover-elevate transition-all" data-testid={`card-recent-test-${test.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" data-testid={`badge-score-${test.id}`}>{test.score}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Bookmarked Materials</h2>
              <div className="space-y-4">
                {bookmarkedMaterials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-4 bg-card rounded-lg hover-elevate transition-all" data-testid={`card-bookmark-${material.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{material.title}</h3>
                        <p className="text-sm text-muted-foreground">{material.subject}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-${material.id}`}>View</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Performance Analytics</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Physics</span>
                    <span className="text-muted-foreground">78%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Chemistry</span>
                    <span className="text-muted-foreground">65%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">Biology</span>
                    <span className="text-muted-foreground">73%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "73%" }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
