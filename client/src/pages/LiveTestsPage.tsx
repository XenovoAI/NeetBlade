import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Play } from "lucide-react";
import { Link } from "wouter";

const allTests = [
  { id: 1, name: "Physics - Mechanics Full Test", duration: 60, questions: 30, difficulty: "Medium", subject: "Physics" },
  { id: 2, name: "Chemistry - Organic Chemistry", duration: 45, questions: 25, difficulty: "Hard", subject: "Chemistry" },
  { id: 3, name: "Biology - Cell Biology", duration: 50, questions: 28, difficulty: "Medium", subject: "Biology" },
  { id: 4, name: "NEET Full Mock Test 1", duration: 180, questions: 180, difficulty: "Hard", subject: "Full Test" },
  { id: 5, name: "NEET Full Mock Test 2", duration: 180, questions: 180, difficulty: "Medium", subject: "Full Test" },
  { id: 6, name: "NEET 2023 Previous Year", duration: 180, questions: 180, difficulty: "Hard", subject: "Previous Year" },
];

export default function LiveTestsPage() {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Live Test Series</h1>
          <p className="text-lg text-muted-foreground">Practice with timed tests and improve your performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allTests.map((test) => (
            <Card key={test.id} className="p-6 hover-elevate transition-all" data-testid={`card-test-${test.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{test.name}</h3>
                  <Badge variant="outline" className="mb-2" data-testid={`badge-subject-${test.id}`}>{test.subject}</Badge>
                </div>
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

              <Link href={`/test/${test.id}`}>
                <Button className="w-full" data-testid={`button-start-${test.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
