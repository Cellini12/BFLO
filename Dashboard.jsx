
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useUser } from "@/components/hooks/useUser";
import { base44 } from "@/api/base44Client";
import {
  Plus,
  TrendingUp,
  Zap,
  Bot,
  AlertTriangle,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsCards from "../components/dashboard/StatsCards";
import ActiveJobs from "../components/dashboard/ActiveJobs";
import RecentQuotes from "../components/dashboard/RecentQuotes";
import ProgressTimeline from "../components/dashboard/ProgressTimeline";
import CumulativeJobs from "../components/dashboard/CumulativeJobs";
import HomeHealthScore from "../components/dashboard/HomeHealthScore";
import ServiceRecommendations from "../components/dashboard/ServiceRecommendations";

export default function Dashboard() {
  const { user, isLoading: isUserLoading } = useUser();
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [homeHealthScore, setHomeHealthScore] = useState(null);
  const [property, setProperty] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const loadData = useCallback(async (current_user) => {
    if (!current_user) return;
    setIsDataLoading(true);
    try {
      const userJobs = await base44.entities.Job.filter({ customer_id: current_user.id }, "-created_date", 100);
      const userQuotes = await base44.entities.Quote.filter({ customer_id: current_user.id }, "-created_date", 5);

      const userJobIds = userJobs.map(job => job.id);

      const allRecentUpdates = await base44.entities.ProgressUpdate.list("-created_date", 50);
      const recentUpdates = allRecentUpdates.filter(update => userJobIds.includes(update.job_id)).slice(0, 5);

      // Load property data
      let userProperty = null;
      try {
        const properties = await base44.entities.Property.filter({ owner_id: current_user.id }, "-created_date", 1);
        if (properties.length > 0) {
          userProperty = properties[0];
        }
      } catch (error) {
        console.error("Error loading property:", error);
      }

      let healthScore = null;
      const userPlan = current_user.subscription_plan;
      if (userPlan === 'pro' || userPlan === 'enterprise') {
        try {
          const healthScores = await base44.entities.HomeHealthScore.filter({ customer_id: current_user.id }, "-last_updated", 1);
          healthScore = healthScores[0] || null;
        } catch (error) {
          console.error("Error loading home health score:", error);
        }
      }

      setJobs(userJobs);
      setQuotes(userQuotes);
      setUpdates(recentUpdates);
      setHomeHealthScore(healthScore);
      setProperty(userProperty);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        window.location.href = createPageUrl("Home");
        return;
      }

      if (!user.customer_type) {
        window.location.href = createPageUrl("Profile");
        return;
      }

      loadData(user);
    }
  }, [user, isUserLoading, loadData]);

  const handleDispatchRequest = async (jobsToDispatch) => {
    const jobIds = jobsToDispatch.map(j => j.id);
    const updatePromises = jobIds.map(id => base44.entities.Job.update(id, { status: 'scheduled' }));

    try {
      await Promise.all(updatePromises);
      await loadData(user);
    } catch(error) {
      console.error("Error dispatching jobs:", error);
    }
  };

  const activeJobs = jobs.filter(job => job.request_type === 'standard' && ['scheduled', 'in_progress'].includes(job.status));
  const pendingQuotes = quotes.filter(quote => ['pending', 'sent'].includes(quote.status));

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        <WelcomeSection
          user={user}
          activeJobsCount={activeJobs.length}
          homeHealthScore={homeHealthScore}
        />

        {/* Property Setup Alert */}
        {!property && !isDataLoading && (
          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg">
            <Settings className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <div className="flex items-center justify-between">
                <div>
                  <strong className="block mb-1">Complete Your Property Profile</strong>
                  <p className="text-sm">Help us understand your property to get personalized maintenance recommendations and service suggestions.</p>
                </div>
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold ml-4">
                  <Link to={createPageUrl("PropertyOnboarding")}>
                    Set Up Now
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Property Onboarding Progress */}
        {property && !property.onboarding_completed && (
          <Alert className="bg-blue-50 border-blue-300">
            <AlertDescription className="text-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Property Profile: {property.onboarding_progress}% Complete</strong>
                  <p className="text-sm">Complete your property profile to unlock personalized recommendations.</p>
                </div>
                <Button asChild variant="outline" className="border-blue-400 text-blue-700">
                  <Link to={createPageUrl("PropertyOnboarding")}>
                    Continue Setup
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <StatsCards
          jobs={jobs}
          quotes={quotes}
          user={user}
        />

        {/* Bundled Tasks - Moved Up */}
        <CumulativeJobs jobs={jobs} onDispatchRequest={handleDispatchRequest} />

        {/* Service Recommendations */}
        {property && property.onboarding_completed && (
          <ServiceRecommendations property={property} />
        )}

        {(user?.subscription_plan === 'pro' || user?.subscription_plan === 'enterprise') && (
          <HomeHealthScore
            healthScore={homeHealthScore}
            user={user}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ActiveJobs jobs={activeJobs} isLoading={false} />
            <RecentQuotes quotes={pendingQuotes} isLoading={false} />
          </div>

          <div className="space-y-8">
            <ProgressTimeline updates={updates} jobs={jobs} isLoading={false} />

            {/* Enhanced Quick Actions */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("Jobs?action=new")} className="block">
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold shadow-lg" size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    New Service Request
                  </Button>
                </Link>
                <Link to={createPageUrl("AIQuote")} className="block">
                  <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 shadow-sm" size="lg">
                    <Bot className="w-5 h-5 mr-2" />
                    AI Quote Generator
                  </Button>
                </Link>
                <Link to={createPageUrl("EmergencyService")} className="block">
                  <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50 shadow-sm" size="lg">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Emergency Service
                  </Button>
                </Link>
                {(user?.subscription_plan === 'basic' || user?.subscription_plan === 'essential') && (
                  <Link to={createPageUrl("Subscription")} className="block">
                    <Button className="w-full bg-gray-800 hover:bg-gray-900 text-yellow-400 shadow-lg" size="lg">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
