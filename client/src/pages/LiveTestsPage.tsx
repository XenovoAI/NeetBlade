import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

interface TestSeriesPdf {
  id: string;
  title: string;
  subject: string;
  pdf_url: string;
  created_at: string;
}

export default function LiveTestsPage() {
  const [testSeries, setTestSeries] = useState<TestSeriesPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-series-pdfs`);

      if (!response.ok) {
        throw new Error('Failed to fetch test series');
      }

      const data = await response.json();
      setTestSeries(data.data || []);
    } catch (error) {
      console.error('Error fetching test series:', error);
      setError(error instanceof Error ? error.message : 'Failed to load test series');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading tests...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-red-600">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Test Series</h1>
          <p className="text-lg text-muted-foreground">Practice with available tests</p>
        </div>

        {testSeries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tests available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testSeries.map((ts) => (
              <Card key={ts.id} className="p-6 hover-elevate transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{ts.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{ts.subject}</Badge>
                    </div>
                  </div>
                </div>

                <a href={ts.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}