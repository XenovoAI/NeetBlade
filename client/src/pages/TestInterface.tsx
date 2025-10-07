import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const questions = [
  {
    id: 1,
    question: "What is the SI unit of force?",
    options: ["Newton", "Joule", "Watt", "Pascal"],
    correct: 0,
  },
  {
    id: 2,
    question: "Which organelle is known as the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correct: 1,
  },
  {
    id: 3,
    question: "What is the molecular formula of water?",
    options: ["H2O", "CO2", "O2", "H2O2"],
    correct: 0,
  },
];

export default function TestInterface() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    console.log("Test submitted", answers);
    setLocation("/results");
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">NEET Mock Test</h1>
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${timeLeft < 300 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`text-lg font-semibold ${timeLeft < 300 ? "text-destructive" : "text-foreground"}`} data-testid="text-timer">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="mb-6">
                <Badge className="mb-4" data-testid="badge-question-number">Question {currentQuestion + 1} of {questions.length}</Badge>
                <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-question">
                  {questions[currentQuestion].question}
                </h2>

                <RadioGroup
                  value={answers[currentQuestion]?.toString()}
                  onValueChange={(value) => {
                    setAnswers({ ...answers, [currentQuestion]: parseInt(value) });
                  }}
                  data-testid="radio-options"
                >
                  {questions[currentQuestion].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover-elevate transition-all">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} data-testid={`radio-option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={() => setShowSubmitDialog(true)} data-testid="button-submit">
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    data-testid="button-next"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-md font-medium transition-all ${
                      currentQuestion === index
                        ? "bg-primary text-primary-foreground"
                        : answers[index] !== undefined
                        ? "bg-green-100 text-green-800"
                        : "bg-secondary text-secondary-foreground"
                    } hover-elevate`}
                    data-testid={`button-question-${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100"></div>
                  <span className="text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-secondary"></div>
                  <span className="text-muted-foreground">Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Current</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit the test? You have answered {Object.keys(answers).length} out of {questions.length} questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} data-testid="button-confirm-submit">Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
