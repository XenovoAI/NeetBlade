import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function TestResults() {
  const score = 75;
  const totalQuestions = 180;
  const correctAnswers = 135;
  const incorrectAnswers = 30;
  const unanswered = 15;
  const timeTaken = "02:45:30";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Test Completed!</h1>
          <p className="text-lg text-muted-foreground">Here's how you performed</p>
        </div>

        <Card className="p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-primary mb-2" data-testid="text-score">{score}%</div>
            <p className="text-muted-foreground">Overall Score</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-foreground" data-testid="text-correct">{correctAnswers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-foreground" data-testid="text-incorrect">{incorrectAnswers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Incorrect Answers</p>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground" data-testid="text-time">{timeTaken}</span>
              </div>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-2" data-testid="text-unanswered">{unanswered}</div>
              <p className="text-sm text-muted-foreground">Unanswered</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Subject-wise Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-medium">Physics</span>
                <Badge variant="outline" data-testid="badge-physics-score">45/60 (75%)</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-medium">Chemistry</span>
                <Badge variant="outline" data-testid="badge-chemistry-score">42/60 (70%)</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground font-medium">Biology</span>
                <Badge variant="outline" data-testid="badge-biology-score">48/60 (80%)</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/tests">
            <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-more-tests">
              Take More Tests
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-dashboard">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
