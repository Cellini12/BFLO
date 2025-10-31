import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
} from "lucide-react";

export default function StatsCards({ jobs, quotes, user }) {
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const pendingJobs = jobs.filter(job => ['pending', 'quoted'].includes(job.status)).length;
  const totalQuoteCount = quotes.length;
  const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted').length;

  const statsData = [
    {
      title: "Completed Jobs",
      value: completedJobs,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-gradient-to-br from-green-100 to-green-200",
      borderColor: "border-green-300"
    },
    {
      title: "Pending Requests", 
      value: pendingJobs,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-100 to-orange-200",
      borderColor: "border-orange-300"
    },
    {
      title: "Total Quotes",
      value: totalQuoteCount,
      icon: FileText,
      color: "text-blue-600", 
      bgColor: "bg-gradient-to-br from-blue-100 to-blue-200",
      borderColor: "border-blue-300"
    },
    {
      title: "Accepted Quotes",
      value: acceptedQuotes,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-100 to-purple-200",
      borderColor: "border-purple-300"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-xl hover:border-yellow-400 hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl border-2 ${stat.borderColor} shadow-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}