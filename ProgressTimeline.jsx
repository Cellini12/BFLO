
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  Clock,
  MessageSquare
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const updateIcons = {
  info: Info,
  progress: Clock,
  completed: CheckCircle,
  issue: AlertTriangle
};

const updateColors = {
  info: "text-blue-500 bg-blue-500/10",
  progress: "text-orange-500 bg-orange-500/10", 
  completed: "text-green-500 bg-green-500/10",
  issue: "text-red-500 bg-red-500/10"
};

export default function ProgressTimeline({ updates, jobs, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No recent job updates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {updates.slice(0, 5).map((update) => {
              const UpdateIcon = updateIcons[update.status] || Info;
              
              return (
                <div key={update.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${updateColors[update.status]}`}>
                      <UpdateIcon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {update.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {update.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          <span className="font-semibold">{getJobTitle(update.job_id)}</span> &bull; {formatDistanceToNow(new Date(update.created_date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
