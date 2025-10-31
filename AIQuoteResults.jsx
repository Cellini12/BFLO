import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Send,
  TrendingUp,
  Wrench,
  Calendar
} from "lucide-react";

const complexityColors = {
  simple: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  complex: "bg-red-100 text-red-800 border-red-200"
};

const confidenceColors = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-green-100 text-green-800 border-green-200"
};

export default function AIQuoteResults({ 
  quote, 
  projectData, 
  photos, 
  onSaveRequest, 
  onStartOver 
}) {
  // Calculate labor cost with new pricing structure: $100 first hour, $70 additional hours
  const calculateLaborCost = (hours) => {
    if (hours <= 1) return 100;
    return 100 + ((hours - 1) * 70);
  };

  const totalMaterialsCost = quote.materials?.reduce((sum, item) => sum + item.estimated_cost, 0) || 0;
  const laborCost = calculateLaborCost(quote.labor_hours);
  const totalEstimate = laborCost + totalMaterialsCost;

  return (
    <div className="space-y-6">
      
      {/* Main Quote Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">AI Quote Generated!</h2>
            <p className="text-purple-100 mb-6">Based on your photos and description</p>
            
            <div className="text-6xl font-bold mb-4">
              ${totalEstimate.toLocaleString()}
            </div>
            <div className="text-purple-100 text-lg">
              Estimated Total Cost
            </div>
            
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1" />
                <div className="font-semibold">{quote.timeline_days} Days</div>
                <div className="text-sm text-purple-100">Estimated Timeline</div>
              </div>
              <div className="text-center">
                <Wrench className="w-6 h-6 mx-auto mb-1" />
                <div className="font-semibold">{quote.labor_hours} Hours</div>
                <div className="text-sm text-purple-100">Labor Required</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Analysis */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex gap-3 mb-4">
              <Badge className={`${complexityColors[quote.complexity]} border`}>
                {quote.complexity} complexity
              </Badge>
              <Badge className={`${confidenceColors[quote.confidence_level]} border`}>
                {quote.confidence_level} confidence
              </Badge>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Analysis:</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{quote.analysis}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Work Needed:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {quote.work_needed?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {quote.considerations && quote.considerations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Considerations:
                </h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {quote.considerations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simplified Cost Breakdown */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Labor - Simplified */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">Professional Labor</span>
                <span className="text-2xl font-bold text-blue-600">${laborCost}</span>
              </div>
              <div className="text-sm text-gray-600">
                {quote.labor_hours <= 1 
                  ? `${quote.labor_hours} hour @ $100/hour`
                  : `1 hour @ $100, ${(quote.labor_hours - 1).toFixed(1)} hours @ $70/hour`
                }
              </div>
            </div>
            
            {/* Materials - Simplified */}
            {quote.materials && quote.materials.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">Materials & Supplies</span>
                  <span className="text-2xl font-bold text-green-600">${totalMaterialsCost}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {quote.materials.map((material, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{material.item}</span>
                      <span className="font-medium">${material.estimated_cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Total */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total Estimate:</span>
                <span className="text-3xl font-bold text-purple-600">${totalEstimate.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Final quote may vary after on-site evaluation
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="text-sm font-semibold text-gray-900">{quote.timeline_days} Days</div>
                <div className="text-xs text-gray-500">Timeline</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Wrench className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="text-sm font-semibold text-gray-900">{quote.complexity}</div>
                <div className="text-xs text-gray-500">Complexity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Summary */}
      <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Project Details:</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Title:</span> {projectData.title}</div>
                <div><span className="font-medium">Service Type:</span> {projectData.service_type}</div>
                <div><span className="font-medium">Urgency:</span> {projectData.urgency}</div>
                {projectData.description && (
                  <div><span className="font-medium">Description:</span> {projectData.description}</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Photos Analyzed:</h4>
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(0, 4).map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.edited_url || photo.url}
                    alt="Project photo"
                    className="w-full h-16 object-cover rounded border"
                  />
                ))}
                {photos.length > 4 && (
                  <div className="w-full h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                    +{photos.length - 4} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" onClick={onStartOver} size="lg">
          <RotateCcw className="w-5 h-5 mr-2" />
          Start Over
        </Button>
        <Button onClick={onSaveRequest} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Send className="w-5 h-5 mr-2" />
          Request Official Quote
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important Note:</p>
            <p>
              This is an AI-generated estimate based on your photos and description. 
              Final pricing will be determined after an on-site evaluation by our professional team. 
              Actual costs may vary based on site conditions, local building codes, and material availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}