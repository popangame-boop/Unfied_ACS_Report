"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { JobMaster } from "@/lib/schemas"; // Diperbaiki: menggunakan import type
import AddJobForm from "@/components/job-master/AddJobForm";
import EditJobForm from "@/components/job-master/EditJobForm";
import DeleteJobDialog from "@/components/job-master/DeleteJobDialog";
import { showLoading, dismissToast } from "@/utils/toast";

const fetchJobs = async (): Promise<JobMaster[]> => {
  const { data, error } = await supabase.from("job_master").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data.map((job) => ({
    ...job,
    StartDate: new Date(job.StartDate),
    EndDate: job.EndDate ? new Date(job.EndDate) : null,
  }));
};

const JobMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobMaster | null>(null);
  const [jobToDeleteId, setJobToDeleteId] = useState<string | null>(null);

  const {
    data: jobs,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<JobMaster[], Error>({
    queryKey: ["job_master"],
    queryFn: fetchJobs,
  });

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleEditClick = (job: JobMaster) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedJob(null);
    refetch();
  };

  const handleDeleteClick = (jobId: string) => {
    setJobToDeleteId(jobId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setJobToDeleteId(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center text-red-500">
        <p>Error loading jobs: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Master</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Job</Button>
          </DialogTrigger>
          <AddJobForm onSuccess={handleAddSuccess} />
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Requester Department</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>PIC Requester</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No jobs found.
                </TableCell>
              </TableRow>
            ) : (
              jobs?.map((job) => (
                <TableRow key={job.JobID}>
                  <TableCell className="font-medium">{job.JobID}</TableCell>
                  <TableCell>{job.Category}</TableCell>
                  <TableCell>{job.JobTitle}</TableCell>
                  <TableCell>{job.RequesterDepartment}</TableCell>
                  <TableCell>
                    {job.StartDate ? format(job.StartDate, "PPP") : "N/A"}
                  </TableCell>
                  <TableCell>
                    {job.EndDate ? format(job.EndDate, "PPP") : "N/A"}
                  </TableCell>
                  <TableCell>{job.PIC_Requester}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {job.Notes}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(job)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(job.JobID)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedJob && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditJobForm job={selectedJob} onSuccess={handleEditSuccess} />
        </Dialog>
      )}

      {jobToDeleteId && (
        <DeleteJobDialog
          jobId={jobToDeleteId}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default JobMaster;