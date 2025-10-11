
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, BookOpen, Award, Play } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const { user, profile, loading } = useUserData();
  const [tests, setTests] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Fetch real test results
    supabase
      .from("tests")
      .select("id,name,score,date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(({ data }) => setTests(data || []));
    // Fetch real bookmarks
    supabase
      .from("bookmarks")
      .select("id,title,subject")
      .eq("user_id", user.id)
      .then(({ data }) => setBookmarks(data || []));
    // Fetch real performance analytics
    supabase
      .from("performance")
      .select("subject,percent")
      .eq("user_id", user.id)
      .then(({ data }) => setPerformance(data || []));
    // Fetch subscription status
    supabase
      .from("subscriptions")
      .select("status,plan")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setSubscription(data));
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ""} alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {profile?.name ? profile.name.split(" ").map(n => n[0]).join("") : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-username">{profile?.name || user?.email}</h1>
              <p className="text-muted-foreground">{profile?.bio || "NEET Aspirant"}</p>
            </div>
          </div>
          <Button variant="outline" data-testid="button-edit-profile">Edit Profile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Subscription</span>
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-subscription-status">
              {subscription ? `${subscription.status} (${subscription.plan})` : "-"}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Tests Taken</span>
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-tests-taken">{tests.length}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Avg. Score</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-avg-score">
              {tests.length ? `${Math.round(tests.reduce((a, t) => a + (t.score || 0), 0) / tests.length)}%` : "-"}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Study Time</span>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-study-time">{profile?.study_time || "-"}h</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Materials</span>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="text-materials-count">{profile?.materials_count || "-"}</div>
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
                {tests.length === 0 && <div className="text-muted-foreground">No test results yet.</div>}
                {tests.map((test) => (
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
                {bookmarks.length === 0 && <div className="text-muted-foreground">No bookmarks yet.</div>}
                {bookmarks.map((material) => (
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
                {performance.length === 0 && <div className="text-muted-foreground">No analytics yet.</div>}
                {performance.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-foreground font-medium">{item.subject}</span>
                      <span className="text-muted-foreground">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }}></div>
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
