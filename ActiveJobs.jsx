
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  ArrowRight,
  Wrench,
  Zap,
  Droplets,
  Home,
  Paintbrush2,
  Construction,
  Info
} from "lucide-react";
import { format } from "date-fns";

const serviceIcons = {
  plumbing: Droplets,
  electrical: Zap,
  hvac: Home,
  general_maintenance: Wrench,
  painting: Paintbrush2,
  other: Construction,
};

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-green-100 text-green-800"
};

export default function ActiveJobs({ jobs, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Active Jobs</CardTitle>
        <Link to={createPageUrl("Jobs")}>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No active jobs at the moment.</p>
            <Link to={createPageUrl("Jobs?action=new")}>
              <Button>
                Create Service Request
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.slice(0, 3).map((job) => {
              const ServiceIcon = serviceIcons[job.service_type] || Construction;
              
              return (
                 <Link to={createPageUrl(`Jobs?id=${job.id}`)} key={job.id} className="block">
                    <div className="p-4 border rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <ServiceIcon className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                              <MapPin className="w-4 h-4" />
                              {job.property_address}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${statusColors[job.status]}`} variant="secondary">
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {job.scheduled_date && (
                        <div className="text-sm text-muted-foreground mt-2 pl-12">
                          Scheduled for {format(new Date(job.scheduled_date), "EEEE, MMM d 'at' h:mm a")}
                        </div>
                      )}
                    </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
