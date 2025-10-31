import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertCircle,
  Save
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SERVICE_TYPES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "general_maintenance", label: "General Maintenance" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning" },
  { value: "painting", label: "Painting" },
  { value: "roofing", label: "Roofing" },
  { value: "other", label: "Other" }
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export default function JobForm({ onSubmit, onCancel, user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_address: user?.address || "",
    service_type: "",
    priority: "medium",
    request_type: "standard",
    estimated_labor_cost: 0,
    is_recurring: false,
    recurrence_frequency: "none"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromPropertyInsights, setFromPropertyInsights] = useState(false);
  const [healthScoreId, setHealthScoreId] = useState(null);
  const [opportunityIndex, setOpportunityIndex] = useState(null);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rebookId = urlParams.get('rebook_id');
    
    // Check if coming from Property Insights
    const fromInsights = urlParams.get('from_property_insights') === 'true';
    const scoreId = urlParams.get('health_score_id');
    const oppIndex = urlParams.get('opportunity_index');
    
    setFromPropertyInsights(fromInsights);
    setHealthScoreId(scoreId);
    setOpportunityIndex(oppIndex);
    
    if (fromInsights) {
      // Pre-fill from URL params
      setFormData(prev => ({
        ...prev,
        title: urlParams.get('title') || prev.title,
        description: urlParams.get('description') || prev.description,
        property_address: urlParams.get('property_address') || prev.property_address,
        service_type: urlParams.get('service_type') || prev.service_type,
        priority: urlParams.get('priority') || prev.priority,
      }));
    } else if (rebookId) {
      loadJobToRebook(rebookId);
    }
  }, []);

  const loadJobToRebook = async (jobId) => {
    try {
      const job = await base44.entities.Job.get(jobId);
      setFormData(prev => ({
        ...prev,
        title: `${job.title} (Re-booked)`,
        description: job.description,
        property_address: job.property_address,
        service_type: job.service_type,
        priority: job.priority,
      }));
    } catch (error) {
      console.error("Failed to load job for rebooking:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSubmit = { ...formData };
    if (dataToSubmit.request_type === 'cumulative' && !dataToSubmit.estimated_labor_cost) {
      dataToSubmit.estimated_labor_cost = 75;
    }

    try {
      const newJob = await onSubmit(dataToSubmit);
      
      // If this job was created from Property Insights, update the HomeHealthScore
      if (fromPropertyInsights && healthScoreId && opportunityIndex !== null) {
        try {
          const healthScore = await base44.entities.HomeHealthScore.get(healthScoreId);
          
          if (healthScore && healthScore.upsell_opportunities) {
            const updatedOpportunities = [...healthScore.upsell_opportunities];
            const oppIdx = parseInt(opportunityIndex);
            
            if (updatedOpportunities[oppIdx]) {
              updatedOpportunities[oppIdx] = {
                ...updatedOpportunities[oppIdx],
                status: 'scheduled',
                job_id: newJob.id
              };
              
              await base44.entities.HomeHealthScore.update(healthScoreId, {
                upsell_opportunities: updatedOpportunities
              });
            }
          }
        } catch (error) {
          console.error("Error updating health score:", error);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onCancel} size="icon">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Service Request</h1>
          <p className="text-gray-600">Tell us what you need help with</p>
        </div>
      </div>

      <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Request Type *</Label>
              <RadioGroup
                defaultValue="standard"
                onValueChange={(value) => handleChange("request_type", value)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="standard" id="r1" className="peer sr-only" />
                  <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Standard Request
                    <span className="text-xs text-gray-500 mt-1 text-center">For regular, single service needs.</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="cumulative" id="r2" className="peer sr-only" />
                  <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Small Task
                    <span className="text-xs text-gray-500 mt-1 text-center">Add to your cumulative list for a future visit.</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                What do you need help with? *
              </Label>
              <Input
                id="title"
                placeholder="e.g., Fix leaking faucet, Install ceiling fan"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                className="border-gray-200"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service_type" className="text-sm font-medium text-gray-700">
                  Service Type *
                </Label>
                <select
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => handleChange("service_type", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select service type</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Priority Level
                </Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="property_address" className="text-sm font-medium text-gray-700">
                Property Address *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="property_address"
                  placeholder="Where should we come?"
                  value={formData.property_address}
                  onChange={(e) => handleChange("property_address", e.target.value)}
                  required
                  className="pl-10 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Detailed Description
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide more details about what you need..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="border-gray-200"
              />
              <p className="text-sm text-gray-500">
                The more details you provide, the better we can help you
              </p>
            </div>

            {formData.request_type === 'standard' && (
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_recurring" className="font-medium">Set up recurring service?</Label>
                  <Switch
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => handleChange('is_recurring', checked)}
                  />
                </div>
                {formData.is_recurring && (
                  <div>
                    <Label htmlFor="recurrence_frequency" className="text-sm">How often?</Label>
                    <select
                      id="recurrence_frequency"
                      value={formData.recurrence_frequency}
                      onChange={(e) => handleChange("recurrence_frequency", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Every 2 Weeks</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• We'll review your request within 24 hours</li>
                    <li>• You can upload photos to help us understand the job</li>
                    <li>• We'll provide you with a detailed quote</li>
                    <li>• Once approved, we'll schedule the work</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}