
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUser } from "@/components/hooks/useUser";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Home as HomeIcon,
  Calendar,
  Wrench,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Sparkles,
  Star,
  Plus,
  ExternalLink
} from "lucide-react";

export default function PropertyInsights() {
  const { user, isLoading: isUserLoading } = useUser();
  const [address, setAddress] = useState("");
  const [propertyData, setPropertyData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadUserJobs();
    }
  }, [user]);

  const loadUserJobs = async () => {
    if (!user) return;
    try {
      const userJobs = await base44.entities.Job.filter({ customer_id: user.id }, "-created_date", 100);
      setJobs(userJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  const searchProperty = async () => {
    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }

    setIsSearching(true);
    setError("");
    
    try {
      // Use AI to fetch property data from the internet
      const prompt = `Look up the property at this address: "${address}". 
      
      Find and return:
      1. The year the house was built (construction year)
      2. Property type (single-family, multi-family, etc.)
      3. Approximate square footage if available
      4. Last known sale date/year if available
      5. Neighborhood/area characteristics
      6. Common issues for homes of this age in this location
      
      If you cannot find specific data, make reasonable estimates based on the location and typical housing in that area.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            year_built: { type: "number" },
            property_type: { type: "string" },
            square_footage: { type: "number" },
            last_sale_year: { type: "number" },
            neighborhood_info: { type: "string" },
            data_confidence: { 
              type: "string", 
              enum: ["high", "medium", "low"] 
            }
          }
        }
      });

      const propertyAge = new Date().getFullYear() - response.year_built;

      // Generate maintenance insights based on property age
      const insightsPrompt = `A ${propertyAge}-year-old ${response.property_type} home (built in ${response.year_built}) needs specific maintenance attention.
      
      Provide:
      1. Critical systems that typically need replacement at this age (HVAC, roof, plumbing, electrical)
      2. Age-specific maintenance tasks homeowners should prioritize
      3. Common issues for homes of this era
      4. Estimated costs for major upcoming replacements
      5. Preventive maintenance schedule
      6. Red flags to watch for
      
      Be specific with timelines and realistic cost estimates for the Buffalo, NY area.`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: insightsPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            critical_systems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  system: { type: "string" },
                  typical_lifespan: { type: "number" },
                  current_age: { type: "number" },
                  status: { 
                    type: "string",
                    enum: ["good", "monitor", "replace_soon", "critical"]
                  },
                  estimated_replacement_cost: { type: "number" }
                }
              }
            },
            maintenance_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  frequency: { type: "string" },
                  importance: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  estimated_cost: { type: "number" }
                }
              }
            },
            common_issues: { type: "array", items: { type: "string" } },
            preventive_schedule: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            overall_assessment: { type: "string" }
          }
        }
      });

      setPropertyData({
        ...response,
        property_age: propertyAge,
        insights,
        searched_address: address
      });

      // Auto-save to HomeHealthScore if user is logged in
      if (user) {
        try {
          const existingScores = await base44.entities.HomeHealthScore.filter(
            { customer_id: user.id, property_address: address },
            "-last_updated",
            1
          );

          const healthScoreData = {
            customer_id: user.id,
            property_address: address,
            overall_score: calculateHealthScore(insights, propertyAge),
            evaluation_type: "algorithm",
            system_scores: generateSystemScores(insights),
            upsell_opportunities: insights.maintenance_priorities.slice(0, 5).map(priority => ({
              service: priority.task,
              description: `Recommended for ${propertyAge}-year-old homes. Frequency: ${priority.frequency}`,
              estimated_cost: priority.estimated_cost,
              priority: priority.importance,
              status: "suggested"
            }))
          };

          let savedScore;
          if (existingScores.length > 0) {
            await base44.entities.HomeHealthScore.update(existingScores[0].id, healthScoreData);
            savedScore = { ...existingScores[0], ...healthScoreData };
          } else {
            savedScore = await base44.entities.HomeHealthScore.create(healthScoreData);
          }
          
          setHealthScore(savedScore);
          await loadUserJobs();
        } catch (saveError) {
          console.error("Error saving health score:", saveError);
        }
      }

    } catch (error) {
      console.error("Error searching property:", error);
      setError("Failed to fetch property data. Please try again or enter a more specific address.");
    } finally {
      setIsSearching(false);
    }
  };

  const calculateHealthScore = (insights, age) => {
    let score = 100;
    
    // Deduct points based on critical systems
    insights.critical_systems?.forEach(system => {
      if (system.status === "critical") score -= 20;
      else if (system.status === "replace_soon") score -= 10;
      else if (system.status === "monitor") score -= 5;
    });

    // Age penalty (gradual decline)
    if (age > 50) score -= 15;
    else if (age > 30) score -= 10;
    else if (age > 20) score -= 5;

    return Math.max(score, 0);
  };

  const generateSystemScores = (insights) => {
    const systems = {};
    
    insights.critical_systems?.forEach(system => {
      const systemName = system.system.toLowerCase().includes('hvac') ? 'hvac' :
                        system.system.toLowerCase().includes('plumb') ? 'plumbing' :
                        system.system.toLowerCase().includes('electric') ? 'electrical' :
                        'general_maintenance';
      
      let score = 100;
      if (system.status === "critical") score = 40;
      else if (system.status === "replace_soon") score = 60;
      else if (system.status === "monitor") score = 75;
      
      systems[systemName] = {
        score,
        issues: system.status !== "good" ? [system.system] : [],
        recommendations: [`${system.system}: ${system.status}`]
      };
    });

    return systems;
  };

  const getStatusColor = (status) => {
    const colors = {
      good: "bg-green-100 text-green-800 border-green-300",
      monitor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      replace_soon: "bg-orange-100 text-orange-800 border-orange-300",
      critical: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || colors.monitor;
  };

  const getImportanceColor = (importance) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[importance] || colors.medium;
  };

  const getOpportunityStatus = (opportunity) => {
    if (!opportunity.job_id) return 'suggested';
    
    const relatedJob = jobs.find(j => j.id === opportunity.job_id);
    if (!relatedJob) return opportunity.status || 'suggested';
    
    if (relatedJob.status === 'completed') return 'completed';
    if (['scheduled', 'in_progress'].includes(relatedJob.status)) return 'scheduled';
    
    return opportunity.status || 'suggested';
  };

  const scheduleMaintenancePriority = (opportunity, index) => {
    // Map the importance to job priority
    const priorityMap = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'urgent'
    };

    // Determine service type based on task keywords
    let serviceType = 'general_maintenance';
    const taskLower = opportunity.service.toLowerCase();
    if (taskLower.includes('plumb') || taskLower.includes('pipe') || taskLower.includes('drain')) {
      serviceType = 'plumbing';
    } else if (taskLower.includes('electric') || taskLower.includes('wire') || taskLower.includes('outlet')) {
      serviceType = 'electrical';
    } else if (taskLower.includes('hvac') || taskLower.includes('heat') || taskLower.includes('air') || taskLower.includes('furnace')) {
      serviceType = 'hvac';
    } else if (taskLower.includes('roof')) {
      serviceType = 'roofing';
    } else if (taskLower.includes('paint')) {
      serviceType = 'painting';
    }

    const currentStatus = getOpportunityStatus(opportunity);

    if (currentStatus === 'scheduled') {
      const job = jobs.find(j => j.id === opportunity.job_id);
      if (job) {
        window.location.href = createPageUrl(`Jobs/${job.id}`);
        return;
      }
    }

    const params = new URLSearchParams({
      action: 'new',
      from_property_insights: 'true',
      health_score_id: healthScore?.id || '',
      opportunity_index: index.toString(),
      title: opportunity.service,
      description: opportunity.description || `${opportunity.service}. Frequency: ${opportunity.frequency}`,
      service_type: serviceType,
      priority: priorityMap[opportunity.priority] || 'medium',
      property_address: propertyData?.searched_address || address
    });

    window.location.href = createPageUrl(`Jobs?${params.toString()}`);
  };

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Property Insights</h1>
          </div>
          <p className="text-lg text-gray-600">
            Enter any address to get AI-powered maintenance insights based on property age and location
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Enter property address (e.g., 123 Main St, Buffalo, NY 14201)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchProperty()}
                  className="pl-10 text-lg h-14"
                />
              </div>
              <Button
                onClick={searchProperty}
                disabled={isSearching || !address.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 px-8"
                size="lg"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search Property
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {propertyData && (
          <div className="space-y-6">
            
            {/* Property Overview */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <HomeIcon className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">{propertyData.searched_address}</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-blue-100 text-sm mb-1">Built</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {propertyData.year_built}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-100 text-sm mb-1">Property Age</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          {propertyData.property_age} years
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-100 text-sm mb-1">Type</div>
                        <div className="text-xl font-semibold capitalize">
                          {propertyData.property_type}
                        </div>
                      </div>
                      {propertyData.square_footage && (
                        <div>
                          <div className="text-blue-100 text-sm mb-1">Size</div>
                          <div className="text-xl font-semibold">
                            {propertyData.square_footage.toLocaleString()} sq ft
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge className="bg-white/20 text-white border border-white/30 text-sm">
                    {propertyData.data_confidence} confidence
                  </Badge>
                </div>
                
                {propertyData.neighborhood_info && (
                  <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur">
                    <p className="text-sm text-white/90">{propertyData.neighborhood_info}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overall Assessment */}
            {propertyData.insights?.overall_assessment && (
              <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {propertyData.insights.overall_assessment}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Critical Systems */}
              <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    Critical Systems Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyData.insights?.critical_systems?.map((system, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{system.system}</h3>
                          <Badge className={`${getStatusColor(system.status)} border`}>
                            {system.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Typical Lifespan:</span> {system.typical_lifespan} years
                          </div>
                          <div>
                            <span className="font-medium">Current Age:</span> ~{system.current_age} years
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Replacement Cost:</span>{' '}
                            <span className="text-green-600 font-semibold">
                              ${system.estimated_replacement_cost?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Priorities - NOW CLICKABLE */}
              <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Maintenance Priorities
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Click "Schedule" to create a job for any maintenance task
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthScore?.upsell_opportunities ? (
                      healthScore.upsell_opportunities.map((opportunity, index) => {
                        const status = getOpportunityStatus(opportunity);
                        const isCompleted = status === 'completed';
                        const isScheduled = status === 'scheduled';
                        
                        return (
                          <div 
                            key={index} 
                            className={`p-3 border rounded-lg transition-all ${
                              isCompleted ? 'bg-green-50 border-green-200' : 
                              isScheduled ? 'bg-blue-50 border-blue-200' : 
                              'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {isCompleted && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                  {isScheduled && <Calendar className="w-4 h-4 text-blue-600" />}
                                  <h4 className="font-medium text-gray-900">{opportunity.service}</h4>
                                  <Badge className={`${getImportanceColor(opportunity.priority)} text-xs`}>
                                    {opportunity.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{opportunity.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-sm font-semibold text-green-600">
                                    Est. ${opportunity.estimated_cost?.toLocaleString()}
                                  </span>
                                  {isCompleted && (
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      ✓ Completed
                                    </Badge>
                                  )}
                                  {isScheduled && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      Scheduled
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {!isCompleted && (
                                <Button 
                                  onClick={() => scheduleMaintenancePriority(opportunity, index)}
                                  size="sm"
                                  className={isScheduled ? 
                                    "bg-blue-600 hover:bg-blue-700" : 
                                    "bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                                  }
                                >
                                  {isScheduled ? (
                                    <>
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      View Job
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-1" />
                                      Schedule
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : propertyData.insights?.maintenance_priorities?.slice(0, 6).map((priority, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{priority.task}</h4>
                            <Badge className={`${getImportanceColor(priority.importance)} text-xs`}>
                              {priority.importance}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Frequency: {priority.frequency}</p>
                        </div>
                        <div className="text-sm font-semibold text-green-600 ml-4">
                          ${priority.estimated_cost?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Common Issues & Red Flags */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {propertyData.insights?.common_issues && propertyData.insights.common_issues.length > 0 && (
                <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      Common Issues for This Age
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {propertyData.insights.common_issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {propertyData.insights?.red_flags && propertyData.insights.red_flags.length > 0 && (
                <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Red Flags to Watch For
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {propertyData.insights.red_flags.map((flag, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preventive Schedule */}
            {propertyData.insights?.preventive_schedule && (
              <Card className="bg-green-50 border-green-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Calendar className="w-5 h-5" />
                    Recommended Preventive Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 leading-relaxed">
                    {propertyData.insights.preventive_schedule}
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
