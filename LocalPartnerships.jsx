import React, { useState, useEffect } from "react";
import { LocalPartnership } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ExternalLink, 
  Phone, 
  MapPin,
  Gift,
  Percent,
  Calendar,
  Home,
  Shield,
  Sofa,
  Wrench
} from "lucide-react";
import { format } from "date-fns";

const categoryIcons = {
  home_improvement: Home,
  insurance: Shield,
  appliances: Wrench,
  furniture: Sofa,
  security: Shield,
  other: Store
};

export default function LocalPartnerships() {
  const [partnerships, setPartnerships] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPartnerships();
  }, []);

  const loadPartnerships = async () => {
    try {
      const activePartnerships = await LocalPartnership.filter({ is_active: true });
      setPartnerships(activePartnerships);
    } catch (error) {
      console.error("Error loading partnerships:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartnerships = partnerships.filter(partnership => 
    selectedCategory === "all" || partnership.category === selectedCategory
  );

  const categories = [
    { value: "all", label: "All Partners" },
    { value: "home_improvement", label: "Home Improvement" },
    { value: "insurance", label: "Insurance" },
    { value: "appliances", label: "Appliances" },
    { value: "furniture", label: "Furniture" },
    { value: "security", label: "Security" },
    { value: "other", label: "Other" }
  ];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Partner Offers</h1>
          </div>
          <p className="text-lg text-gray-600">
            Exclusive deals and discounts from our trusted local partners
          </p>
        </div>

        {/* Category Filter */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partnerships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartnerships.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners found</h3>
              <p className="text-gray-500">Check back later for new exclusive offers</p>
            </div>
          ) : (
            filteredPartnerships.map((partnership) => {
              const CategoryIcon = categoryIcons[partnership.category] || Store;
              const isExpiringSoon = partnership.valid_until && 
                new Date(partnership.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              return (
                <Card key={partnership.id} className="bg-white/60 backdrop-blur border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                          {partnership.logo_url ? (
                            <img 
                              src={partnership.logo_url} 
                              alt={partnership.partner_name}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <CategoryIcon className="w-6 h-6 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{partnership.partner_name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{partnership.business_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {partnership.discount_percentage && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <Percent className="w-3 h-3 mr-1" />
                          {partnership.discount_percentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">{partnership.offer_title}</h4>
                      <p className="text-gray-600 text-sm">{partnership.offer_description}</p>
                    </div>
                    
                    {partnership.discount_code && (
                      <div className="bg-gray-50 p-3 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-xs font-medium text-gray-700 mb-1">Discount Code:</p>
                        <p className="font-bold text-lg text-gray-900 tracking-wider">{partnership.discount_code}</p>
                      </div>
                    )}
                    
                    {partnership.valid_until && (
                      <div className={`flex items-center gap-2 text-sm ${isExpiringSoon ? 'text-red-600' : 'text-gray-600'}`}>
                        <Calendar className="w-4 h-4" />
                        <span>Valid until {format(new Date(partnership.valid_until), "MMM d, yyyy")}</span>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {partnership.website_url && (
                        <Button className="w-full bg-orange-600 hover:bg-orange-700" asChild>
                          <a href={partnership.website_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        {partnership.phone && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`tel:${partnership.phone}`}>
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </a>
                          </Button>
                        )}
                        {partnership.address && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://maps.google.com?q=${encodeURIComponent(partnership.address)}`} target="_blank" rel="noopener noreferrer">
                              <MapPin className="w-4 h-4 mr-1" />
                              Directions
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}