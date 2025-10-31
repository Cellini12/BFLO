import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  FileText,
  MessageSquare,
  Info,
  Construction
} from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  quoted: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-200 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
};

const JobDetailItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-4">
    <Icon className="w-5 h-5 text-muted-foreground mt-1" />
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-md font-medium text-foreground">{children}</p>
    </div>
  </div>
);

export default function JobDetails({ job, onUploadPhotos }) {
  if (!job) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
          <Info className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Select a Job</h3>
          <p className="text-muted-foreground">Choose a job from the list to see its details.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
              <Construction className="w-4 h-4" /> 
              {job.service_type.replace('_', ' ')}
            </p>
          </div>
          <Badge className={`${statusColors[job.status]}`} variant="secondary">
            {job.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        <JobDetailItem icon={MapPin} label="Property Address">
          {job.property_address}
        </JobDetailItem>

        <JobDetailItem icon={Clock} label="Date Created">
          {format(new Date(job.created_date), "MMM d, yyyy 'at' h:mm a")}
        </JobDetailItem>
        
        {job.scheduled_date && (
          <JobDetailItem icon={Calendar} label="Scheduled Date">
            {format(new Date(job.scheduled_date), "EEEE, MMM d, yyyy 'at' h:mm a")}
          </JobDetailItem>
        )}

        {job.description && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-md text-foreground bg-muted/50 p-3 rounded-md">
              {job.description}
            </p>
          </div>
        )}

        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Photos</p>
            <div className="grid grid-cols-3 gap-2">
                {(job.photos || []).slice(0, 5).map((photo, index) => (
                    <img key={index} src={photo.url} alt={`Job photo ${index+1}`} className="aspect-square w-full rounded-md object-cover" />
                ))}
                {(!job.photos || job.photos.length === 0) && <p className="text-sm text-muted-foreground col-span-3">No photos uploaded yet.</p>}
                 {job.photos && job.photos.length > 5 && (
                    <div className="aspect-square w-full rounded-md bg-muted flex items-center justify-center text-foreground font-bold">
                        +{job.photos.length - 5}
                    </div>
                )}
            </div>
        </div>

      </CardContent>

      <div className="p-6 border-t mt-auto">
          <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onUploadPhotos}>
                  <Camera className="w-4 h-4 mr-2" />
                  Add/View Photos
              </Button>
              <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Technician
              </Button>
          </div>
      </div>
    </Card>
  );
}