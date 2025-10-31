import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Job } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Phone, 
  Zap,
  Droplets,
  Flame,
  Shield,
  Clock,
  DollarSign,
  CheckCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EMERGENCY_SERVICES = [
  {
    type: "plumbing",
    title: "Plumbing Emergency",
    icon: Droplets,
    description: "Burst pipes, major leaks, no water",
    basePrice: 150,
    examples: ["Burst water pipe", "Major leak", "No hot water", "Blocked main drain"]
  },
  {
    type: "electrical",
    title: "Electrical Emergency", 
    icon: Zap,
    description: "Power outage, sparking, electrical hazards",
    basePrice: 200,
    examples: ["Power outage", "Sparking outlets", "Electrical fire risk", "Exposed wires"]
  },
  {
    type: "hvac",
    title: "HVAC Emergency",
    icon: Flame,
    description: "No heating/cooling in extreme weather",
    basePrice: 175,
    examples: ["No heat in winter", "AC failure in summer", "Gas leak smell", "Furnace not working"]
  },
  {
    type: "general_maintenance",
    title: "Security Emergency",
    icon: Shield,
    description: "Broken locks, security breaches",
    basePrice: 125,
    examples: ["Broken door lock", "Window won't close", "Security system failure"]
  }
];

export default function EmergencyService() {
  const [user, setUser] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_address: "",
    phone_contact: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        property_address: currentUser.address || "",
        phone_contact: currentUser.phone || ""
      }));
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData(prev => ({
      ...prev,
      title: `EMERGENCY: ${service.title}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await Job.create({
        ...formData,
        service_type: selectedService.type,
        priority: "urgent",
        customer_id: user.id,
        request_type: "standard",
        estimated_labor_cost: selectedService.basePrice,
        notes: `EMERGENCY SERVICE REQUEST - Base rate: $${selectedService.basePrice}\nContact: ${formData.phone_contact}`
      });

      setRequestSubmitted(true);
    } catch (error) {
      console.error("Error submitting emergency request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (requestSubmitted) {
    return (
      <div className="p-4 lg:p-8 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Emergency Request Submitted!</h1>
              <p className="text-lg text-gray-600 mb-6">
                We've received your emergency service request and are dispatching a technician immediately.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="font-semibold text-blue-800">What happens next:</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• A technician will call you within 15 minutes</li>
                  <li>• Emergency dispatch typically arrives within 60-90 minutes</li>
                  <li>• You'll receive real-time updates via the app</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-red-600 hover:bg-red-700" asChild>
                  <a href="tel:555-EMERGENCY">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Emergency Line
                  </a>
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/jobs"}>
                  Track Your Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Emergency Service</h1>
          </div>
          <p className="text-lg text-gray-600">
            24/7 Emergency response for urgent home service needs
          </p>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency services have priority dispatch and higher rates.</strong> 
            Base emergency fee starts at $125-$200 plus standard service charges.
          </AlertDescription>
        </Alert>

        {!selectedService ? (
          /* Service Selection */
          <div className="grid md:grid-cols-2 gap-6">
            {EMERGENCY_SERVICES.map((service) => (
              <Card 
                key={service.type}
                className="bg-white/60 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer"
                onClick={() => handleServiceSelect(service)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center">
                      <service.icon className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">{service.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Emergency base rate:</span>
                      <Badge className="bg-red-100 text-red-800">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${service.basePrice}+
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Common emergencies:</p>
                      <div className="space-y-1">
                        {service.examples.slice(0, 2).map((example, index) => (
                          <p key={index} className="text-xs text-gray-600">• {example}</p>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Request Emergency Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Emergency Request Form */
          <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <selectedService.icon className="w-8 h-8 text-red-600" />
                <div>
                  <CardTitle className="text-xl text-gray-900">{selectedService.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-red-100 text-red-800">
                      <Clock className="w-3 h-3 mr-1" />
                      60-90 min response
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ${selectedService.basePrice} base rate
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Description *
                  </label>
                  <Textarea
                    placeholder="Describe your emergency situation in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Address *
                    </label>
                    <Input
                      placeholder="Where should we come?"
                      value={formData.property_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone *
                    </label>
                    <Input
                      type="tel"
                      placeholder="Phone number for immediate contact"
                      value={formData.phone_contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_contact: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Please confirm:</strong> This is a true emergency requiring immediate dispatch. 
                    Emergency services carry premium rates and will be charged to your account.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setSelectedService(null)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Dispatch Emergency Service Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        <Card className="bg-red-600 text-white border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Life-Threatening Emergency?</h3>
            <p className="mb-4">For gas leaks, electrical fires, or immediate danger, call 911 first</p>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600" asChild>
              <a href="tel:911">
                <Phone className="w-4 h-4 mr-2" />
                Call 911
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}