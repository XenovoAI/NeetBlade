import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/NEET_education_hero_illustration_e7f8c283.png";

export default function Hero() {
  return (
    <section className="relative bg-background py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Ace Your NEET Exam with{" "}
              <span className="text-primary">Expert Study Materials</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
              Access comprehensive NEET preparation materials and practice tests. 
              Prepare effectively and boost your confidence for the exam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/materials">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-explore-materials">
                  Explore Study Materials
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tests">
                <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-start-test">
                  Start Practice Test
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <img 
              src={heroImage} 
              alt="NEET preparation illustration" 
              className="w-full h-auto rounded-xl"
              data-testid="img-hero"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
