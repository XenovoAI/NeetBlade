import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import StudyMaterialsPage from "@/pages/StudyMaterialsPage";
import LiveTestsPage from "@/pages/LiveTestsPage";
import TestInterface from "@/pages/TestInterface";
import TestResults from "@/pages/TestResults";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import ForgotPassword from "@/pages/ForgotPassword";
import Shop from "@/pages/Shop";
import Payment from "@/pages/Payment";
import PaymentSuccess from "@/pages/PaymentSuccess";
import MyPurchases from "@/pages/MyPurchases";
import SimpleTestUpload from "@/pages/SimpleTestUpload";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/payment/:orderId" component={Payment} />
      <Route path="/payment-success/:orderId" component={PaymentSuccess} />
      <Route path="/my-purchases" component={MyPurchases} />
      <Route path="/materials" component={StudyMaterialsPage} />
      <Route path="/materials/:subject" component={StudyMaterialsPage} />
      <Route path="/tests" component={LiveTestsPage} />
      <Route path="/upload-test" component={SimpleTestUpload} />
      <Route path="/test/:id" component={TestInterface} />
      <Route path="/test/:id/results" component={TestResults} />
      <Route path="/results" component={TestResults} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route path="/ForgotPassword" component={ForgotPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
