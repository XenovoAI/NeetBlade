import { Card } from "@/components/ui/card";
import { Users, Award, BookOpen } from "lucide-react";

const stats = [
  {
    id: "students",
    icon: Users,
    value: "50,000+",
    label: "Active Students",
  },
  {
    id: "selections",
    icon: Award,
    value: "10,000+",
    label: "NEET Selections",
  },
  {
    id: "materials",
    icon: BookOpen,
    value: "5,000+",
    label: "Study Materials",
  },
];

export default function Trust() {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Leading Institutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful NEET aspirants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id} className="p-8 text-center" data-testid={`card-stat-${stat.id}`}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid={`text-value-${stat.id}`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground" data-testid={`text-label-${stat.id}`}>
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
