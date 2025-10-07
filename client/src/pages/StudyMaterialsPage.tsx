import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Bookmark, FileText, Video } from "lucide-react";
import { useState } from "react";

const materials = {
  physics: [
    { id: 1, title: "Mechanics - Laws of Motion", type: "PDF", size: "2.5 MB", chapter: "Chapter 5" },
    { id: 2, title: "Thermodynamics Video Lecture", type: "Video", size: "125 MB", chapter: "Chapter 12" },
    { id: 3, title: "Electrostatics Notes", type: "PDF", size: "1.8 MB", chapter: "Chapter 1" },
  ],
  chemistry: [
    { id: 4, title: "Organic Chemistry - Hydrocarbons", type: "PDF", size: "3.2 MB", chapter: "Chapter 13" },
    { id: 5, title: "Chemical Bonding Video", type: "Video", size: "98 MB", chapter: "Chapter 4" },
    { id: 6, title: "Periodic Table Notes", type: "PDF", size: "2.1 MB", chapter: "Chapter 3" },
  ],
  biology: [
    { id: 7, title: "Cell Biology Detailed Notes", type: "PDF", size: "4.1 MB", chapter: "Chapter 8" },
    { id: 8, title: "Human Physiology Video Series", type: "Video", size: "156 MB", chapter: "Chapter 18" },
    { id: 9, title: "Plant Anatomy Notes", type: "PDF", size: "2.8 MB", chapter: "Chapter 6" },
  ],
};

export default function StudyMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("");

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

        <Tabs defaultValue="physics" className="w-full">
          <TabsList className="grid w-full max-w-md mb-8 grid-cols-3" data-testid="tabs-subjects">
            <TabsTrigger value="physics" data-testid="tab-physics">Physics</TabsTrigger>
            <TabsTrigger value="chemistry" data-testid="tab-chemistry">Chemistry</TabsTrigger>
            <TabsTrigger value="biology" data-testid="tab-biology">Biology</TabsTrigger>
          </TabsList>

          {Object.entries(materials).map(([subject, items]) => (
            <TabsContent key={subject} value={subject}>
              <div className="grid grid-cols-1 gap-4">
                {items.map((material) => (
                  <Card key={material.id} className="p-6 hover-elevate transition-all" data-testid={`card-material-${material.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {material.type === "PDF" ? (
                            <FileText className="h-6 w-6 text-primary" />
                          ) : (
                            <Video className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-1">{material.title}</h3>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="outline" data-testid={`badge-chapter-${material.id}`}>{material.chapter}</Badge>
                            <span className="text-sm text-muted-foreground">{material.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" data-testid={`button-bookmark-${material.id}`}>
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button variant="default" data-testid={`button-download-${material.id}`}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
