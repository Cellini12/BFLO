import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench,
  Zap,
  Droplets,
  Home,
  Paintbrush2,
  Construction,
  Info
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const serviceIcons = {
  plumbing: Droplets,
  electrical: Zap,
  hvac: Home,
  general_maintenance: Wrench,
  painting: Paintbrush2,
  landscaping: Home,
  cleaning: Home,
  roofing: Home,
  other: Construction,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-200 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function JobsList({ jobs, onSelectJob, selectedJobId }) {
  const standardJobs = jobs.filter(job => job.request_type !== 'cumulative');
  
  if (standardJobs.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Info className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No service requests found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new request.</p>
        </div>
      );
  }

  return (
    <div className="space-y-3">
      {standardJobs.map((job) => {
        const ServiceIcon = serviceIcons[job.service_type] || Construction;
        const isSelected = selectedJobId === job.id;
        
        return (
          <div 
            key={job.id} 
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
              isSelected ? 'bg-muted border-primary' : 'bg-card border-transparent hover:border-border'
            }`}
            onClick={() => onSelectJob(job.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-md font-semibold text-foreground mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {job.property_address}
                </p>
              </div>
              <Badge className={`${statusColors[job.status]}`} variant="secondary">
                  {job.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
               <div className="flex items-center gap-1.5">
                  <ServiceIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{job.service_type.replace('_', ' ')}</span>
               </div>
               <span>&bull;</span>
               <span>{formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}