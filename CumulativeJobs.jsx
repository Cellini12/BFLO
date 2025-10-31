import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Wrench,
  Send,
  Target
} from "lucide-react";

const DISPATCH_THRESHOLD = 300;

export default function CumulativeJobs({ jobs, onDispatchRequest }) {
  const cumulativeJobs = jobs.filter(job => job.request_type === 'cumulative' && job.status === 'pending');
  const totalCost = cumulativeJobs.reduce((sum, job) => sum + (job.estimated_labor_cost || 0), 0);
  const progress = Math.min((totalCost / DISPATCH_THRESHOLD) * 100, 100);
  const canRequestDispatch = totalCost >= DISPATCH_THRESHOLD;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="w-6 h-6 text-foreground" />
          Bundled Tasks
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Small jobs bundled together for efficient technician visits.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Dispatch Readiness</span>
            </div>
            <span className="text-sm text-muted-foreground">{cumulativeJobs.length} tasks</span>
          </div>
          
          <Progress value={progress} className="h-3 mb-2" />
          
          <p className="text-xs text-muted-foreground text-center">
            {canRequestDispatch ? (
              <span className="text-green-600 font-medium">✓ Ready for efficient dispatch!</span>
            ) : (
              "Adding more tasks for optimal efficiency..."
            )}
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
          {cumulativeJobs.length > 0 ? (
            cumulativeJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{job.title}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">${job.estimated_labor_cost?.toFixed(0) || 'N/A'}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No small tasks added yet.</p>
          )}
        </div>

        <Button
          className="w-full"
          disabled={!canRequestDispatch}
          onClick={() => onDispatchRequest(cumulativeJobs)}
          size="lg"
        >
          <Send className="w-5 h-5 mr-2" />
          Request Technician Dispatch
        </Button>
        {!canRequestDispatch && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Bundle more tasks for an efficient technician visit.
          </p>
        )}
      </CardContent>
    </Card>
  );
}