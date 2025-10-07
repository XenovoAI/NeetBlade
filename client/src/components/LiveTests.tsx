import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, TrendingUp } from "lucide-react";

const tests = {
  sectional: [
    {
      id: "physics-1",
      name: "Physics - Mechanics",
      duration: 60,
      questions: 30,
      difficulty: "Medium",
    },
    {
      id: "chemistry-1",
      name: "Chemistry - Organic",
      duration: 45,
      questions: 25,
      difficulty: "Hard",
    },
  ],
  fullLength: [
    {
      id: "full-1",
      name: "NEET Full Mock Test 1",
      duration: 180,
      questions: 180,
      difficulty: "Hard",
    },
    {
      id: "full-2",
      name: "NEET Full Mock Test 2",
      duration: 180,
      questions: 180,
      difficulty: "Medium",
    },
  ],
  previousYear: [
    {
      id: "py-2023",
      name: "NEET 2023 Paper",
      duration: 180,
      questions: 180,
      difficulty: "Hard",
    },
    {
      id: "py-2022",
      name: "NEET 2022 Paper",
      duration: 180,
      questions: 180,
      difficulty: "Medium",
    },
  ],
};

function TestCard({ test }: { test: typeof tests.sectional[0] }) {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  return (
    <Card className="p-6 hover-elevate transition-all" data-testid={`card-test-${test.id}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{test.name}</h3>
        <Badge className={difficultyColors[test.difficulty as keyof typeof difficultyColors]} data-testid={`badge-difficulty-${test.id}`}>
          {test.difficulty}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{test.duration} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{test.questions} questions</span>
        </div>
      </div>

      <Button className="w-full" data-testid={`button-start-${test.id}`}>
        Start Test
      </Button>
    </Card>
  );
}

export default function LiveTests() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Live Test Series & Mock Exams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice with timed tests and track your performance
          </p>
        </div>

        <Tabs defaultValue="sectional" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8" data-testid="tabs-test-categories">
            <TabsTrigger value="sectional" data-testid="tab-sectional">Sectional Tests</TabsTrigger>
            <TabsTrigger value="fullLength" data-testid="tab-full-length">Full-Length Tests</TabsTrigger>
            <TabsTrigger value="previousYear" data-testid="tab-previous-year">Previous Year</TabsTrigger>
          </TabsList>

          <TabsContent value="sectional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.sectional.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fullLength">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.fullLength.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="previousYear">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tests.previousYear.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
