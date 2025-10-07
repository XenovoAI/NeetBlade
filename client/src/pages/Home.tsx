import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StudyMaterials from "@/components/StudyMaterials";
import LiveTests from "@/components/LiveTests";
import Features from "@/components/Features";
import Trust from "@/components/Trust";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StudyMaterials />
      <LiveTests />
      <Features />
      <Trust />
      <Footer />
    </div>
  );
}
