
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight,
  Wrench,
  Zap,
  Droplets,
  Home as HomeIcon,
  Paintbrush2,
  Building,
  CheckCircle,
  Construction
} from "lucide-react";

const BFLO_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6895e54df06b3b36be075b1d/de101b8e1_1761892653544-sample.jpeg";

const services = [
  { name: "Plumbing", icon: Droplets, color: "text-blue-600" },
  { name: "Electrical", icon: Zap, color: "text-yellow-600" },
  { name: "Maintenance", icon: Wrench, color: "text-gray-600" },
  { name: "HVAC", icon: HomeIcon, color: "text-orange-600" },
  { name: "Painting", icon: Paintbrush2, color: "text-purple-600" },
  { name: "And More...", icon: Construction, color: "text-gray-900" },
];

const howItWorksSteps = [
  { title: "Request Service", description: "Tell us what you need online, anytime.", icon: "1" },
  { title: "Get a Quote", description: "Receive a transparent, no-obligation quote.", icon: "2" },
  { title: "We Do The Work", description: "Our certified professionals get the job done right.", icon: "3" },
  { title: "Track & Pay", description: "Monitor progress and pay securely through the portal.", icon: "4" },
];

export default function HomePage() {
  const handleLogin = async () => {
    await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img src={BFLO_LOGO_URL} alt="BFLO Contracting" className="h-12 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">BFLO Contracting</h1>
                <p className="text-xs text-gray-600">Licensed & Insured in WNY</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Services</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleLogin} className="text-gray-600 hover:text-gray-900 font-medium">
                Log In
              </Button>
              <Button onClick={handleLogin} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold shadow-lg">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
                Buffalo's Premier
                <span className="block bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">Property Health Portal</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                AI-powered property management, predictive maintenance, and Buffalo's most trusted professionals—all unified in one intelligent platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Button 
                  size="lg" 
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 shadow-xl"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg px-8 py-4"
                >
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Licensed & Insured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">5-Star Rated Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Serving All of WNY</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">AI-Powered Technology</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">Our Services</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional help for any task, big or small. We've got Buffalo covered.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {services.map(service => (
                <div key={service.name} className="text-center group">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 group-hover:bg-yellow-100 transition-colors duration-200 flex items-center justify-center mx-auto mb-4 border border-gray-200 group-hover:border-yellow-300">
                    <service.icon className={`w-10 h-10 ${service.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 lg:py-32 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A simple, streamlined process from start to finish.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, index) => (
                <div key={step.title} className="text-center bg-white p-8 rounded-lg border border-gray-200 shadow-lg">
                  <div className="w-16 h-16 rounded-full bg-yellow-400 text-black font-bold text-2xl flex items-center justify-center mx-auto mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced CTA Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Property Management?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join hundreds of Buffalo homeowners and property managers who trust BFLO Contracting for intelligent property care.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                onClick={handleLogin}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-semibold text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Customer Types Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <HomeIcon className="w-7 h-7 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">For Homeowners</h3>
                </div>
                <p className="text-gray-600 mb-6 text-lg">
                  Keep your home in perfect condition with our comprehensive health monitoring and on-demand services.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">AI-powered home health assessments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Transparent pricing & instant quotes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Real-time job tracking and communication</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Building className="w-7 h-7 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">For Property Managers</h3>
                </div>
                <p className="text-gray-600 mb-6 text-lg">
                  Manage maintenance for all your properties from a single, powerful dashboard.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Multi-property management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Tenant service coordination</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Detailed reporting & analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <img src={BFLO_LOGO_URL} alt="BFLO Contracting" className="h-8 w-auto mx-auto mb-4 filter brightness-0 invert" />
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} BFLO Contracting, LLC. All rights reserved. | Licensed & Insured in Buffalo, NY
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
