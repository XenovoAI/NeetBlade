import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Beaker, Dna } from "lucide-react";
import { Link } from "wouter";

const subjects = [
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    description: "Master fundamental concepts and problem-solving techniques",
    chapters: 35,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: Beaker,
    description: "Comprehensive organic, inorganic, and physical chemistry",
    chapters: 30,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    description: "In-depth coverage of botany and zoology topics",
    chapters: 38,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export default function StudyMaterials() {
  return (
    <section className="py-12 md:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Study Materials
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access subject-wise study materials curated by expert faculty
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Card key={subject.id} className="p-6 hover-elevate transition-all" data-testid={`card-subject-${subject.id}`}>
                <div className={`w-12 h-12 rounded-lg ${subject.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${subject.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{subject.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {subject.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {subject.chapters} Chapters
                  </span>
                </div>
                <Link href={`/materials/${subject.id}`}>
                  <Button variant="outline" className="w-full" data-testid={`button-access-${subject.id}`}>
                    Access Materials
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
