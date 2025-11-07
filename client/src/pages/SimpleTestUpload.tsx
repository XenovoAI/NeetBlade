import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api";
import { Plus, Trash2, Save } from "lucide-react";

interface Question {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
}

export default function SimpleTestUpload() {
  const [testTitle, setTestTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState("180");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Validation
      if (!testTitle || !subject || !duration) {
        throw new Error("Please fill in test title, subject, and duration");
      }

      const validQuestions = questions.filter((q) => q.question_text.trim() !== "");
      if (validQuestions.length === 0) {
        throw new Error("Please add at least one question");
      }

      // Create test
      const testResponse = await fetch(`${API_BASE_URL}/api/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: testTitle,
          subject: subject,
          duration_minutes: parseInt(duration),
          description: description,
          status: "scheduled",
        }),
      });

      if (!testResponse.ok) {
        throw new Error("Failed to create test");
      }

      const testData = await testResponse.json();
      const testId = testData.data.id;

      // Add questions
      if (validQuestions.length > 0) {
        const questionsResponse = await fetch(`${API_BASE_URL}/api/tests/${testId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: validQuestions }),
        });

        if (!questionsResponse.ok) {
          throw new Error("Test created but failed to add questions");
        }
      }

      setMessage("✅ Test created successfully!");
      
      // Reset form
      setTestTitle("");
      setSubject("");
      setDuration("180");
      setDescription("");
      setQuestions([
        {
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: 0,
        },
      ]);
    } catch (error) {
      setMessage(`❌ ${error instanceof Error ? error.message : "Failed to create test"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upload Test Series
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a new test with questions
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g., NEET Physics Mock Test"
                  required
                  data-testid="input-test-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Physics"
                    required
                    data-testid="input-subject"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="180"
                    required
                    data-testid="input-duration"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the test"
                  data-testid="input-description"
                />
              </div>
            </div>
          </Card>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button type="button" onClick={addQuestion} variant="outline" data-testid="button-add-question">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((q, index) => (
              <Card key={index} className="p-6 mb-4" data-testid={`question-card-${index}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Question {index + 1}</h3>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      data-testid={`button-remove-question-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={q.question_text}
                      onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                      placeholder="Enter your question"
                      data-testid={`input-question-text-${index}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Option A</Label>
                      <Input
                        value={q.option_a}
                        onChange={(e) => updateQuestion(index, "option_a", e.target.value)}
                        placeholder="Option A"
                        data-testid={`input-option-a-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Option B</Label>
                      <Input
                        value={q.option_b}
                        onChange={(e) => updateQuestion(index, "option_b", e.target.value)}
                        placeholder="Option B"
                        data-testid={`input-option-b-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Option C</Label>
                      <Input
                        value={q.option_c}
                        onChange={(e) => updateQuestion(index, "option_c", e.target.value)}
                        placeholder="Option C"
                        data-testid={`input-option-c-${index}`}
                      />
                    </div>
                    <div>
                      <Label>Option D</Label>
                      <Input
                        value={q.option_d}
                        onChange={(e) => updateQuestion(index, "option_d", e.target.value)}
                        placeholder="Option D"
                        data-testid={`input-option-d-${index}`}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Correct Answer</Label>
                    <select
                      value={q.correct_option}
                      onChange={(e) => updateQuestion(index, "correct_option", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-md"
                      data-testid={`select-correct-option-${index}`}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full" data-testid="button-submit-test">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating Test..." : "Create Test"}
          </Button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
