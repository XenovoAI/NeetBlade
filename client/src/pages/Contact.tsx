import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted", { name, email, subject, message });
    alert("Thank you for contacting us! We'll get back to you soon.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    data-testid="input-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your query..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    data-testid="textarea-message"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full md:w-auto" data-testid="button-send">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground">support@neetblade.com</p>
              <p className="text-muted-foreground">info@neetblade.com</p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground">+91 98765 43210</p>
              <p className="text-muted-foreground">Mon-Sat: 9AM - 6PM</p>
            </Card>

            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Address</h3>
              <p className="text-muted-foreground">
                123 Education Plaza<br />
                Mumbai, Maharashtra<br />
                India - 400001
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
