import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Target, Users, Award, BookOpen } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">About NEET Blade</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering NEET aspirants with quality education and comprehensive study materials
          </p>
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            NEET Blade is dedicated to providing high-quality, accessible, and comprehensive preparation materials for NEET aspirants across India. We believe that every student deserves access to excellent educational resources, regardless of their background or location.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform combines expert-curated content, innovative learning tools, and performance analytics to help students achieve their dreams of becoming medical professionals.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Our Vision</h3>
            <p className="text-muted-foreground">
              To become India's most trusted NEET preparation platform, helping thousands of students achieve their medical career aspirations.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Expert Faculty</h3>
            <p className="text-muted-foreground">
              Learn from experienced educators and NEET toppers who understand the exam pattern and what it takes to succeed.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Proven Results</h3>
            <p className="text-muted-foreground">
              Our students have consistently achieved top ranks in NEET, with a success rate that speaks for itself.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Comprehensive Content</h3>
            <p className="text-muted-foreground">
              From detailed notes to video lectures and practice tests, we provide everything you need in one place.
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Choose Us?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground">Updated content aligned with the latest NEET syllabus and exam pattern</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground">Live test series with detailed performance analytics</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground">Mobile-friendly platform for learning on the go</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground">24/7 doubt resolution and student support</p>
            </li>
          </ul>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
