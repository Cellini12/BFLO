
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Wrench,
  Zap,
  Droplets,
  Home as HomeIcon,
  Star,
  Calendar,
  Construction,
  Sparkles
} from "lucide-react";

const systemIcons = {
  plumbing: Droplets,
  electrical: Zap,
  hvac: HomeIcon,
  general_maintenance: Wrench,
  other: Construction
};

const getScoreColor = (score) => {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  if (score >= 50) return "text-orange-600";
  return "text-red-600";
};

const getScoreGrade = (score) => {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "C+";
  if (score >= 65) return "C";
  if (score >= 60) return "D+";
  if (score >= 55) return "D";
  return "F";
};

export default function HomeHealthScore({ healthScore, user }) {
  if (!healthScore) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Property Health Score
            <Badge variant="outline" className="ml-2 border-blue-500 text-blue-600 bg-blue-50 font-semibold">Pro Feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unlock Your Property Health Intelligence
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get AI-powered insights, predictive maintenance alerts, and comprehensive property condition analysis.
          </p>
          <Link to={createPageUrl("Subscription")}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-lg">
              <Star className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { overall_score, system_scores, evaluation_type, next_evaluation_due, upsell_opportunities } = healthScore;
  const scoreColorClass = getScoreColor(overall_score);
  const grade = getScoreGrade(overall_score);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Property Health Score</h2>
              </div>
              <p className="text-gray-300 mb-4">
                {healthScore.property_address}
              </p>
              <div className={`text-7xl font-bold mb-2 ${scoreColorClass}`}>{overall_score}</div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`text-lg px-3 py-1 ${scoreColorClass} border-current/50 bg-white/10 font-bold`}>
                  Grade: {grade}
                </Badge>
                <span className="text-gray-300">out of 100</span>
              </div>
                 {evaluation_type === 'onsite_inspection' && (
                  <Badge className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                    <Star className="w-3 h-3 mr-1.5" />
                    Professional Evaluation
                  </Badge>
                )}
            </div>
            <div className="text-right shrink-0">
               {next_evaluation_due && (
                <div className="mt-1 p-4 bg-white/10 rounded-lg text-left border border-gray-600 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Next Evaluation</span>
                  </div>
                   <p className="text-lg font-semibold text-white mt-1">{new Date(next_evaluation_due).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Breakdown */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">System Health Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            {Object.entries(system_scores || {}).map(([system, data]) => {
              const SystemIcon = systemIcons[system] || Wrench;
              const systemScore = data.score || 0;
              const scoreColor = getScoreColor(systemScore);
              
              return (
                <div key={system} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <SystemIcon className={`w-5 h-5 ${scoreColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold capitalize text-gray-900">{system.replace('_', ' ')}</h3>
                        <span className={`text-sm font-bold ${scoreColor}`}>{systemScore}%</span>
                      </div>
                      <Progress value={systemScore} className="h-2 mt-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upsell Opportunities */}
      {upsell_opportunities && upsell_opportunities.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Recommended Improvements
            </CardTitle>
            <p className="text-gray-600">
              Based on your home health analysis, here are some recommendations.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upsell_opportunities.slice(0, 3).map((opportunity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{opportunity.service}</h4>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={opportunity.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {opportunity.priority} priority
                      </Badge>
                      <span className="text-sm font-semibold text-green-600">
                        Est. ${opportunity.estimated_cost}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                    Get Quote
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
