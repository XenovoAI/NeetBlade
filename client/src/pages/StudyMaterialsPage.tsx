import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Bookmark, FileText, Video, Loader2, FileIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Material = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  subject: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
};

export default function StudyMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("physics");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching materials:", fetchError);
        throw fetchError;
      }

      setMaterials(data || []);
    } catch (err: any) {
      console.error("Failed to load materials:", err);
      setError("Failed to load study materials. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-primary" />;
    if (fileType.includes('video')) return <Video className="h-6 w-6 text-primary" />;
    return <FileIcon className="h-6 w-6 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filterMaterials = (subject: string) => {
    return materials
      .filter(m => m.subject === subject)
      .filter(m => 
        !searchTerm || 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const subjects = ['physics', 'chemistry', 'biology'];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Study Materials</h1>
          <p className="text-lg text-muted-foreground">Access comprehensive study materials for all subjects</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search materials..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-materials"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-materials">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading materials...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12" data-testid="error-materials">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchMaterials} className="mt-4">Retry</Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mb-8 grid-cols-3" data-testid="tabs-subjects">
              <TabsTrigger value="physics" data-testid="tab-physics">Physics</TabsTrigger>
              <TabsTrigger value="chemistry" data-testid="tab-chemistry">Chemistry</TabsTrigger>
              <TabsTrigger value="biology" data-testid="tab-biology">Biology</TabsTrigger>
            </TabsList>

            {subjects.map((subject) => {
              const subjectMaterials = filterMaterials(subject);
              
              return (
                <TabsContent key={subject} value={subject}>
                  {subjectMaterials.length === 0 ? (
                    <div className="text-center py-12" data-testid={`empty-${subject}`}>
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? "No materials found matching your search."
                          : `No study materials available for ${subject} yet.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {subjectMaterials.map((material) => (
                        <Card 
                          key={material.id} 
                          className="p-6 hover-elevate transition-all" 
                          data-testid={`card-material-${material.id}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                {getFileIcon(material.file_type)}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                  {material.title}
                                </h3>
                                {material.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {material.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 items-center">
                                  <Badge variant="outline" className="capitalize">
                                    {material.subject}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {formatFileSize(material.file_size)}
                                  </span>
                                  {material.created_at && (
                                    <span className="text-sm text-muted-foreground">
                                      • {new Date(material.created_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                data-testid={`button-bookmark-${material.id}`}
                                title="Bookmark"
                              >
                                <Bookmark className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="default" 
                                data-testid={`button-download-${material.id}`}
                                onClick={() => window.open(material.url, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
}
