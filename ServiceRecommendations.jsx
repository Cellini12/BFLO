import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  Car,
  Trees,
  Home,
  Zap,
  Droplets,
  Wind,
  AlertCircle,
  Calendar,
  DollarSign
} from "lucide-react";
import { differenceInMonths, differenceInYears, format } from "date-fns";

const serviceIcons = {
  hvac: Wind,
  plumbing: Droplets,
  electrical: Zap,
  roof: Home,
  driveway: Car,
  landscaping: Trees,
  general: Wrench
};

export default function ServiceRecommendations({ property, onCreateJob }) {
  if (!property) return null;

  const recommendations = [];
  const now = new Date();

  // HVAC Recommendations
  if (property.hvac_type && property.hvac_type !== 'none') {
    const hvacAge = property.hvac_age_years;
    const lastServiced = property.hvac_last_serviced ? new Date(property.hvac_last_serviced) : null;
    const monthsSinceService = lastServiced ? differenceInMonths(now, lastServiced) : 999;

    if (monthsSinceService >= 12 || !lastServiced) {
      recommendations.push({
        id: 'hvac_service',
        title: 'HVAC System Maintenance',
        description: lastServiced ? 
          `Last serviced ${format(lastServiced, 'MMM yyyy')}. Annual maintenance is recommended.` :
          'Annual HVAC maintenance recommended to ensure optimal performance.',
        service_type: 'hvac',
        priority: monthsSinceService >= 18 ? 'high' : 'medium',
        estimated_cost: 150,
        icon: 'hvac',
        reason: 'Preventive Maintenance'
      });
    }

    if (hvacAge >= 15) {
      recommendations.push({
        id: 'hvac_replacement',
        title: 'HVAC System Replacement',
        description: `Your ${hvacAge}-year-old system is approaching end of life. Consider replacement to avoid costly repairs.`,
        service_type: 'hvac',
        priority: hvacAge >= 20 ? 'high' : 'medium',
        estimated_cost: 5500,
        icon: 'hvac',
        reason: 'System Age'
      });
    }
  }

  // Water Heater Recommendations
  if (property.water_heater_age_years) {
    const heaterAge = property.water_heater_age_years;
    const isTank = property.water_heater_type === 'tank';
    const expectedLife = isTank ? 10 : 20;

    if (heaterAge >= expectedLife - 2) {
      recommendations.push({
        id: 'water_heater_replacement',
        title: 'Water Heater Replacement',
        description: `Your ${heaterAge}-year-old ${property.water_heater_type} water heater is near the end of its ${expectedLife}-year lifespan.`,
        service_type: 'plumbing',
        priority: heaterAge >= expectedLife ? 'high' : 'medium',
        estimated_cost: isTank ? 1200 : 2500,
        icon: 'plumbing',
        reason: 'Equipment Age'
      });
    }
  }

  // Roof Recommendations
  if (property.roof_last_replaced) {
    const roofAge = differenceInYears(now, new Date(property.roof_last_replaced));
    const isAsphalt = property.roof_type === 'asphalt_shingles';
    const expectedLife = isAsphalt ? 20 : 30;

    if (roofAge >= expectedLife - 3) {
      recommendations.push({
        id: 'roof_inspection',
        title: 'Roof Inspection & Potential Replacement',
        description: `Your ${roofAge}-year-old ${property.roof_type?.replace('_', ' ')} roof should be inspected. Typical lifespan is ${expectedLife} years.`,
        service_type: 'roofing',
        priority: roofAge >= expectedLife ? 'high' : 'medium',
        estimated_cost: roofAge >= expectedLife ? 8500 : 350,
        icon: 'roof',
        reason: 'Roof Age'
      });
    }
  }

  // Driveway Sealing (Asphalt only)
  if (property.driveway_type === 'asphalt') {
    const lastSealed = property.driveway_last_sealed ? new Date(property.driveway_last_sealed) : null;
    const yearsSinceSealing = lastSealed ? differenceInYears(now, lastSealed) : 999;

    if (yearsSinceSealing >= 2 || !lastSealed) {
      recommendations.push({
        id: 'driveway_sealing',
        title: 'Driveway Sealing',
        description: lastSealed ?
          `Last sealed ${format(lastSealed, 'yyyy')}. Asphalt driveways should be sealed every 2-3 years.` :
          'Asphalt driveways should be sealed every 2-3 years to protect and extend their life.',
        service_type: 'other',
        priority: yearsSinceSealing >= 4 ? 'high' : 'low',
        estimated_cost: 400,
        icon: 'driveway',
        reason: 'Preventive Care'
      });
    }
  }

  // Landscaping Service
  if (property.needs_landscaping_service) {
    recommendations.push({
      id: 'landscaping_service',
      title: 'Lawn Care & Landscaping Service',
      description: 'Connect with trusted local landscaping partners for regular lawn maintenance.',
      service_type: 'landscaping',
      priority: 'low',
      estimated_cost: 150,
      icon: 'landscaping',
      reason: 'Requested Service',
      isPartnerService: true
    });
  }

  // Electrical Panel Upgrade
  if (property.electrical_panel_amps && property.electrical_panel_amps < 100) {
    recommendations.push({
      id: 'electrical_upgrade',
      title: 'Electrical Panel Upgrade',
      description: `Your ${property.electrical_panel_amps}-amp panel may be insufficient for modern electrical demands. Consider upgrading to 200 amps.`,
      service_type: 'electrical',
      priority: 'medium',
      estimated_cost: 2500,
      icon: 'electrical',
      reason: 'Safety & Capacity'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (recommendations.length === 0) {
    return null;
  }

  const handleQuickAction = (rec) => {
    const params = new URLSearchParams({
      action: 'new',
      from_recommendations: 'true',
      title: rec.title,
      description: rec.description,
      service_type: rec.service_type,
      priority: rec.priority,
      property_address: property.property_address,
      estimated_cost: rec.estimated_cost
    });

    if (rec.isPartnerService) {
      window.location.href = createPageUrl("LocalPartnerships");
    } else {
      window.location.href = createPageUrl(`Jobs?${params.toString()}`);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <AlertCircle className="w-6 h-6" />
          Recommended Services ({recommendations.length})
        </CardTitle>
        <p className="text-yellow-800 text-sm">
          Based on your property profile, here are services you may need
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.slice(0, 5).map((rec) => {
            const Icon = serviceIcons[rec.icon] || Wrench;
            const priorityColors = {
              high: 'bg-red-100 text-red-800 border-red-300',
              medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
              low: 'bg-blue-100 text-blue-800 border-blue-300'
            };

            return (
              <div key={rec.id} className="p-4 bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <Badge className={`${priorityColors[rec.priority]} border text-xs`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {rec.reason}
                      </span>
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <DollarSign className="w-3 h-3" />
                        Est. ${rec.estimated_cost.toLocaleString()}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleQuickAction(rec)}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      {rec.isPartnerService ? 'Find Partners' : 'Request Service'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {recommendations.length > 5 && (
          <Button variant="outline" className="w-full mt-4" asChild>
            <Link to={createPageUrl("PropertyInsights")}>
              View All {recommendations.length} Recommendations
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}