import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Home, Star, ShieldCheck, Zap } from "lucide-react";

export default function WelcomeSection({ user, activeJobsCount, homeHealthScore }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0 shadow-2xl overflow-hidden relative">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-yellow-400/10 to-orange-500/10 rounded-full blur-2xl"></div>
      
      <CardContent className="p-8 lg:p-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
              {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Valued Customer'}!
            </h1>
            <p className="text-gray-300 text-lg mb-4">
              Welcome to your BFLO Contracting Property Health Portal.
            </p>
            
            <div className="flex items-center gap-4 flex-wrap">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 text-sm font-bold border-0 shadow-lg">
                {user?.customer_type === 'landlord' ? (
                  <>
                    <Building className="w-4 h-4 mr-2" />
                    Property Manager
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4 mr-2" />
                    Homeowner
                  </>
                )}
              </Badge>
              
              {user?.subscription_status === 'active' && user?.subscription_plan !== 'basic' && (
                <Badge className="bg-white/20 text-yellow-400 border border-yellow-400/50 px-4 py-2 text-sm font-bold backdrop-blur-sm">
                  <Star className="w-4 h-4 mr-2" />
                  {user.subscription_plan?.charAt(0).toUpperCase() + user.subscription_plan?.slice(1)} Member
                </Badge>
              )}

              {homeHealthScore && (
                <Badge className="border-green-400/50 bg-green-500/20 text-green-300 px-4 py-2 text-sm border backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Health Score: {homeHealthScore.overall_score}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <div className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-1">
              {activeJobsCount}
            </div>
            <p className="text-gray-300 text-lg">
              Active {activeJobsCount === 1 ? 'Job' : 'Jobs'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}