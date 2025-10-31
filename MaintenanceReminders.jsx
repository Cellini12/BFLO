import React, { useState, useEffect } from "react";
import { useUser } from "@/components/hooks/useUser";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  Bell, 
  Plus,
  CheckCircle,
  AlertCircle,
  Wrench,
  Home,
  Zap,
  Brain,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Info
} from "lucide-react";
import { format, addMonths, isAfter, isBefore, differenceInMonths } from "date-fns";

export default function MaintenanceReminders() {
  const { user, isLoading: isUserLoading } = useUser();
  const [reminders, setReminders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [properties, setProperties] = useState([]);
  const [predictiveInsights, setPredictiveInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [userReminders, userJobs, userProperties] = await Promise.all([
        base44.entities.MaintenanceReminder.filter({ customer_id: user.id }, "-next_due_date", 100),
        base44.entities.Job.filter({ customer_id: user.id }, "-created_date", 200),
        base44.entities.Property.filter({ owner_id: user.id }, "-created_date", 10)
      ]);
      
      setReminders(userReminders);
      setJobs(userJobs);
      setProperties(userProperties);
      
      // Auto-run AI analysis if user has sufficient data
      if (userJobs.length >= 3 && userProperties.length > 0) {
        await runPredictiveAnalysis(userJobs, userProperties, userReminders);
      }
    } catch (error) {
      console.error("Error loading maintenance reminders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runPredictiveAnalysis = async (jobsData = jobs, propertiesData = properties, remindersData = reminders) => {
    setIsAnalyzing(true);
    try {
      const prompt = `You are an AI maintenance prediction system for a property management platform. Analyze the following data and provide predictive maintenance recommendations.

PROPERTY DATA:
${JSON.stringify(propertiesData.map(p => ({
  address: p.property_address,
  year_built: p.year_built,
  property_age: new Date().getFullYear() - p.year_built,
  hvac_age_years: p.hvac_age_years,
  hvac_last_serviced: p.hvac_last_serviced,
  water_heater_age_years: p.water_heater_age_years,
  roof_last_replaced: p.roof_last_replaced,
  roof_type: p.roof_type,
  driveway_type: p.driveway_type,
  driveway_last_sealed: p.driveway_last_sealed
})), null, 2)}

SERVICE HISTORY (Last 6 months):
${JSON.stringify(jobsData.slice(0, 20).map(j => ({
  title: j.title,
  service_type: j.service_type,
  status: j.status,
  created_date: j.created_date,
  description: j.description
})), null, 2)}

EXISTING REMINDERS:
${JSON.stringify(remindersData.map(r => ({
  title: r.title,
  service_type: r.service_type,
  frequency_months: r.frequency_months,
  next_due_date: r.next_due_date
})), null, 2)}

Based on this data, provide:
1. Predictive maintenance recommendations for the next 6 months
2. Risk assessment for each system
3. Optimal timing for each maintenance task
4. Cost estimates for Buffalo, NY area
5. Priority level for each recommendation

Consider:
- Equipment age and typical lifespan
- Seasonal factors (Buffalo winters)
- Past service patterns
- Industry best practices
- Preventive vs reactive maintenance`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_health_score: {
              type: "number",
              minimum: 0,
              maximum: 100
            },
            risk_level: {
              type: "string",
              enum: ["low", "moderate", "high", "critical"]
            },
            predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  service_type: { 
                    type: "string",
                    enum: ["plumbing", "electrical", "hvac", "general_maintenance", "roofing", "other"]
                  },
                  recommended_date: { type: "string" },
                  risk_score: { 
                    type: "number",
                    minimum: 0,
                    maximum: 100
                  },
                  priority: { 
                    type: "string",
                    enum: ["low", "medium", "high", "urgent"]
                  },
                  reasoning: { type: "string" },
                  estimated_cost: { type: "number" },
                  failure_indicators: {
                    type: "array",
                    items: { type: "string" }
                  },
                  preventive_actions: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            system_risks: {
              type: "object",
              properties: {
                hvac: { 
                  type: "object",
                  properties: {
                    risk_level: { type: "string" },
                    next_failure_estimate: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } }
                  }
                },
                plumbing: { 
                  type: "object",
                  properties: {
                    risk_level: { type: "string" },
                    next_failure_estimate: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } }
                  }
                },
                electrical: { 
                  type: "object",
                  properties: {
                    risk_level: { type: "string" },
                    next_failure_estimate: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } }
                  }
                },
                roof: { 
                  type: "object",
                  properties: {
                    risk_level: { type: "string" },
                    next_failure_estimate: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } }
                  }
                }
              }
            },
            seasonal_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  season: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } }
                }
              }
            },
            cost_optimization_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPredictiveInsights(analysis);
    } catch (error) {
      console.error("Error running predictive analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createReminderFromJob = async (job) => {
    const frequencyMap = {
      hvac: 6,
      plumbing: 12,
      electrical: 24,
      general_maintenance: 3,
      cleaning: 1,
      landscaping: 3,
      painting: 36,
      roofing: 12
    };

    const frequency = frequencyMap[job.service_type] || 12;
    const nextDue = addMonths(new Date(), frequency);

    try {
      await base44.entities.MaintenanceReminder.create({
        customer_id: user.id,
        service_type: job.service_type,
        title: `${job.title} - Follow-up`,
        description: `Regular maintenance for: ${job.description}`,
        frequency_months: frequency,
        last_service_date: job.scheduled_date || job.created_date,
        next_due_date: nextDue.toISOString().split('T')[0],
        original_job_id: job.id
      });

      await loadData();
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  const createPredictiveReminder = async (prediction) => {
    try {
      await base44.entities.MaintenanceReminder.create({
        customer_id: user.id,
        service_type: prediction.service_type,
        title: prediction.task,
        description: `AI-predicted maintenance: ${prediction.reasoning}`,
        frequency_months: 6,
        next_due_date: prediction.recommended_date,
        is_active: true
      });

      await loadData();
    } catch (error) {
      console.error("Error creating predictive reminder:", error);
    }
  };

  const scheduleMaintenanceJob = async (reminder) => {
    try {
      await base44.entities.Job.create({
        title: reminder.title,
        description: reminder.description,
        property_address: properties[0]?.property_address || user.address,
        service_type: reminder.service_type,
        priority: "medium",
        customer_id: user.id,
        request_type: "standard"
      });

      const nextDue = addMonths(new Date(), reminder.frequency_months);
      await base44.entities.MaintenanceReminder.update(reminder.id, {
        last_service_date: new Date().toISOString().split('T')[0],
        next_due_date: nextDue.toISOString().split('T')[0],
        reminder_sent: false
      });

      await loadData();
    } catch (error) {
      console.error("Error scheduling maintenance job:", error);
    }
  };

  const schedulePredictiveJob = async (prediction) => {
    try {
      await base44.entities.Job.create({
        title: prediction.task,
        description: `${prediction.reasoning}\n\nEstimated cost: $${prediction.estimated_cost}`,
        property_address: properties[0]?.property_address || user.address,
        service_type: prediction.service_type,
        priority: prediction.priority,
        customer_id: user.id,
        request_type: "standard"
      });

      await loadData();
    } catch (error) {
      console.error("Error scheduling predictive job:", error);
    }
  };

  const overdueReminders = reminders.filter(r => isBefore(new Date(r.next_due_date), new Date()));
  const upcomingReminders = reminders.filter(r => isAfter(new Date(r.next_due_date), new Date()));
  const availableJobs = jobs.filter(job => 
    !reminders.some(reminder => reminder.original_job_id === job.id)
  );

  const getRiskColor = (riskLevel) => {
    const colors = {
      low: "text-green-600 bg-green-100 border-green-300",
      moderate: "text-yellow-600 bg-yellow-100 border-yellow-300",
      high: "text-orange-600 bg-orange-100 border-orange-300",
      critical: "text-red-600 bg-red-100 border-red-300",
      urgent: "text-red-600 bg-red-100 border-red-300"
    };
    return colors[riskLevel] || colors.moderate;
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-gray-200 rounded-xl"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">AI-Powered Maintenance</h1>
          </div>
          <p className="text-lg text-gray-600">
            Predictive insights to prevent issues before they happen
          </p>
        </div>

        {/* AI Analysis Button */}
        {!predictiveInsights && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Brain className="w-10 h-10 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Get AI-Powered Maintenance Predictions</h3>
                    <p className="text-sm text-gray-600">Analyze your property data to predict future maintenance needs</p>
                  </div>
                </div>
                <Button 
                  onClick={() => runPredictiveAnalysis()}
                  disabled={isAnalyzing || jobs.length < 3}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>
              {jobs.length < 3 && (
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Need at least 3 completed jobs for accurate AI predictions
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Predictive Insights */}
        {predictiveInsights && (
          <div className="space-y-6">
            
            {/* Overall Health Score */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="w-8 h-8" />
                      <h2 className="text-2xl font-bold">AI Maintenance Health Score</h2>
                    </div>
                    <p className="text-blue-100">Based on predictive analysis of your property data</p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold">{predictiveInsights.overall_health_score}</div>
                    <Badge className={`mt-2 ${getRiskColor(predictiveInsights.risk_level)} border`}>
                      {predictiveInsights.risk_level} risk
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => runPredictiveAnalysis()}
                  disabled={isAnalyzing}
                  className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
                </Button>
              </CardContent>
            </Card>

            {/* System Risk Assessment */}
            {predictiveInsights.system_risks && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    System Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(predictiveInsights.system_risks).map(([system, data]) => (
                      <div key={system} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold capitalize text-gray-900">{system}</h4>
                          <Badge className={getRiskColor(data.risk_level)}>
                            {data.risk_level}
                          </Badge>
                        </div>
                        {data.next_failure_estimate && (
                          <p className="text-sm text-gray-600 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {data.next_failure_estimate}
                          </p>
                        )}
                        {data.recommendations && data.recommendations.length > 0 && (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {data.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Predictions */}
            <Card className="bg-white/80 backdrop-blur border-purple-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI-Predicted Maintenance Tasks ({predictiveInsights.predictions.length})
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Proactive recommendations based on your property's condition and service history
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveInsights.predictions.map((prediction, index) => (
                    <div key={index} className={`p-4 border-2 rounded-lg ${getRiskColor(prediction.priority)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900">{prediction.task}</h3>
                            <Badge className={getRiskColor(prediction.priority)}>
                              {prediction.priority} priority
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Risk: {prediction.risk_score}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{prediction.reasoning}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Recommended: {format(new Date(prediction.recommended_date), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                              Est. ${prediction.estimated_cost}
                            </span>
                          </div>

                          {prediction.failure_indicators && prediction.failure_indicators.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Warning Signs:</p>
                              <div className="flex flex-wrap gap-2">
                                {prediction.failure_indicators.map((indicator, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {prediction.preventive_actions && prediction.preventive_actions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">Preventive Actions:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {prediction.preventive_actions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            onClick={() => schedulePredictiveJob(prediction)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Schedule Now
                          </Button>
                          <Button 
                            onClick={() => createPredictiveReminder(prediction)}
                            size="sm"
                            variant="outline"
                          >
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Recommendations */}
            {predictiveInsights.seasonal_recommendations && predictiveInsights.seasonal_recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Seasonal Maintenance Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {predictiveInsights.seasonal_recommendations.map((season, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">{season.season}</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {season.tasks.map((task, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cost Optimization */}
            {predictiveInsights.cost_optimization_tips && predictiveInsights.cost_optimization_tips.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="w-5 h-5" />
                    Cost Optimization Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {predictiveInsights.cost_optimization_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-green-900">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Overdue Reminders */}
        {overdueReminders.length > 0 && (
          <Card className="bg-red-50 border-red-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                Overdue Maintenance ({overdueReminders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                    <div>
                      <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                      <p className="text-sm text-gray-600">{reminder.description}</p>
                      <p className="text-sm text-red-600 mt-1">
                        Due: {format(new Date(reminder.next_due_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button 
                      onClick={() => scheduleMaintenanceJob(reminder)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Schedule Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Reminders */}
          <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Upcoming Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">All caught up on maintenance!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingReminders.slice(0, 5).map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Due: {format(new Date(reminder.next_due_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {reminder.frequency_months} months
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create New Reminders */}
          <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Set Up New Reminders
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Turn completed jobs into recurring maintenance reminders
              </p>
            </CardHeader>
            <CardContent>
              {availableJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No completed jobs available for reminders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{job.service_type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          Completed: {format(new Date(job.scheduled_date || job.created_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => createReminderFromJob(job)}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Set Reminder
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}