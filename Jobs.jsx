import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@/components/hooks/useUser";
import { Job } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { 
  Plus, 
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import JobsList from "../components/jobs/JobsList";
import JobForm from "../components/jobs/JobForm";
import JobDetails from "../components/jobs/JobDetails";
import PhotoUpload from "../components/jobs/PhotoUpload";

export default function Jobs() {
  const { user, isLoading: isUserLoading } = useUser();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const userJobs = await Job.filter({ customer_id: currentUser.id }, "-created_date", 100);
      setJobs(userJobs);

      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('id') || urlParams.get('job_id');
      if (jobId && userJobs.some(j => j.id === jobId)) {
        setSelectedJobId(jobId);
      } else if (userJobs.length > 0) {
        setSelectedJobId(userJobs[0].id);
      }
      
      if (urlParams.get('action') === 'new') {
        setView('form');
      }

    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user);
    }
  }, [user, loadData]);

  const handleCreateJob = async (jobData) => {
    try {
      const newJob = await Job.create({
        ...jobData,
        customer_id: user.id
      });
      await loadData(user);
      setSelectedJobId(newJob.id);
      setView('list');
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };
  
  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    const url = new URL(window.location);
    url.searchParams.set('id', jobId);
    window.history.pushState({}, '', url);
  };

  const handleUploadPhotos = async (jobId, files) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return {
          url: file_url,
          caption: file.name,
          uploaded_date: new Date().toISOString()
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const existingPhotos = job.photos || [];
      await Job.update(jobId, {
        photos: [...existingPhotos, ...uploadedPhotos]
      });

      await loadData(user);
      setView('list');
    } catch (error) {
      console.error("Error uploading photos:", error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchLower) ||
                         (job.property_address && job.property_address.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  if (isLoading || isUserLoading) {
    return (
      <div className="p-6 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'form') {
    return (
      <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <JobForm 
            onSubmit={handleCreateJob}
            onCancel={() => setView('list')}
            user={user}
          />
        </div>
      </div>
    );
  }

  if (view === 'photo_upload' && selectedJob) {
    return (
      <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <PhotoUpload 
            job={selectedJob}
            onUpload={(files) => handleUploadPhotos(selectedJob.id, files)}
            onCancel={() => setView('list')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
            <p className="text-gray-600">Manage your home service requests and track progress.</p>
          </div>
          <Button 
            onClick={() => setView('form')}
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </Button>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by title or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-gray-300 focus:border-yellow-400">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          <div className="lg:col-span-1 h-full overflow-y-auto pr-2">
            <JobsList 
              jobs={filteredJobs}
              onSelectJob={handleJobSelect}
              selectedJobId={selectedJobId}
            />
          </div>
          
          <div className="lg:col-span-2 h-full overflow-y-auto">
            <JobDetails 
              job={selectedJob}
              onUploadPhotos={() => setView('photo_upload')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}