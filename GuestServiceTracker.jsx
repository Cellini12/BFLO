import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Job } from "@/api/entities";
import { Technician } from "@/api/entities";
import { ProgressUpdate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Star,
  User as UserIcon,
  Navigation,
  Shield,
  Crown
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function GuestServiceTracker() {
  const [job, setJob] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('job_id');

      if (!jobId) {
        setError("No job ID provided. Please check the link you received.");
        setIsLoading(false);
        return;
      }

      try {
        const jobData = await Job.get(jobId);
        setJob(jobData);

        const [jobUpdates, techData] = await Promise.all([
          ProgressUpdate.filter({ job_id: jobId }, "-created_date"),
          jobData.technician_id ? Technician.get(jobData.technician_id) : Promise.resolve(null),
        ]);
        
        setUpdates(jobUpdates);
        setTechnician(techData);

      } catch (err) {
        console.error("Error loading service data:", err);
        setError("Could not find your service details. Please verify the job ID and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-lg w-full text-center bg-white shadow-lg">
            <CardHeader>
                <CardTitle className="text-red-600">Access Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                <Link to={createPageUrl("Home")}>
                    <Button variant="outline" className="mt-4">Go to Homepage</Button>
                </Link>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!job) {
      return null;
  }

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Service Tracker</h1>
                <p className="text-gray-600">Real-time status for your service request.</p>
            </div>
        </div>

        {/* Main Job Status Card */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold text-gray-900">{job.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{job.property_address}</p>
                    </div>
                    <Badge className={`${statusColors[job.status]} border text-lg px-4 py-2`}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {job.scheduled_date && (
                    <div className="text-center mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-semibold text-blue-800">Scheduled For:</p>
                        <p className="text-lg text-blue-700">{format(new Date(job.scheduled_date), "eeee, MMMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
            {/* Technician Details */}
            {technician ? (
                 <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle>Your Technician</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <img src={technician.photo_url} alt={technician.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-200" />
                        <h3 className="text-lg font-semibold">{technician.name}</h3>
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{technician.rating} average rating</span>
                        </div>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button variant="outline"><Phone className="w-4 h-4 mr-2" /> Call</Button>
                            <Button variant="outline"><MessageCircle className="w-4 h-4 mr-2" /> Message</Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                 <Card className="bg-white/60 backdrop-blur border-0 shadow-xl flex items-center justify-center">
                     <CardContent className="p-8 text-center">
                        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                        <p className="text-gray-500">A technician will be assigned shortly.</p>
                     </CardContent>
                 </Card>
            )}

            {/* Upgrade to Premium Card */}
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 shadow-2xl flex flex-col items-center justify-center p-8 text-center">
                <Crown className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Unlock the Full Experience</h3>
                <p className="text-indigo-100 mb-6">Become a member to get access to AI troubleshooting, maintenance reminders, exclusive discounts, and more.</p>
                <Link to={createPageUrl("Subscription")}>
                    <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 shadow-lg">
                        View Subscription Plans
                    </Button>
                </Link>
            </Card>
        </div>

        {/* Progress Timeline */}
        <Card className="bg-white/60 backdrop-blur border-0 shadow-xl">
            <CardHeader>
                <CardTitle>Progress Updates</CardTitle>
            </CardHeader>
            <CardContent>
                {updates.length === 0 ? (
                     <p className="text-center text-gray-500 py-4">No updates yet. We'll post updates here as your service progresses.</p>
                ) : (
                    <div className="space-y-6">
                        {updates.map(update => (
                            <div key={update.id} className="flex gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-blue-600"/>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{update.title}</p>
                                    <p className="text-sm text-gray-600">{update.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{format(new Date(update.created_date), "MMM d, h:mm a")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}