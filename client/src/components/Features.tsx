import { Card } from "@/components/ui/card";
import { BookOpen, Video, BarChart3, Smartphone, GraduationCap, Headphones } from "lucide-react";

const features = [
  {
    id: "notes",
    icon: BookOpen,
    title: "Comprehensive Notes",
    description: "Detailed chapter-wise notes covering the entire NEET syllabus",
  },
  {
    id: "videos",
    icon: Video,
    title: "Video Solutions",
    description: "Step-by-step video explanations for complex problems",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your progress with detailed performance insights",
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Study anytime, anywhere with our mobile-optimized platform",
  },
  {
    id: "faculty",
    icon: GraduationCap,
    title: "Expert Faculty",
    description: "Learn from experienced NEET educators and toppers",
  },
  {
    id: "support",
    icon: Headphones,
    title: "24/7 Support",
    description: "Get your doubts resolved anytime with our support team",
  },
];

export default function Features() {
  return (
    <section className="py-12 md:py-20 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose NEET Blade?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in your NEET preparation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="p-6 text-center hover-elevate transition-all" data-testid={`card-feature-${feature.id}`}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
