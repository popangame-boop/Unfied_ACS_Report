"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { PencilIcon, Trash2Icon, SearchIcon } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { supabase } from "@/integrations/supabase/client";
import type { ArtworkLog } from "@/lib/schemas";
import AddArtworkLogForm from "@/components/artwork-log/AddArtworkLogForm";
import EditArtworkLogForm from "@/components/artwork-log/EditArtworkLogForm";
import DeleteArtworkLogDialog from "@/components/artwork-log/DeleteArtworkLogDialog";
import { showLoading, dismissToast } from "@/utils/toast";

const fetchArtworkLogs = async (): Promise<ArtworkLog[]> => {
  const { data, error } = await supabase.from("artwork_log").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data.map((log) => ({
    ...log,
    StartDate: new Date(log.StartDate),
    EndDate: log.EndDate ? new Date(log.EndDate) : null,
  }));
};

const fetchJobIds = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("job_master").select("JobID");
  if (error) {
    throw new Error(error.message);
  }
  return data.map((item) => item.JobID);
};

const fetchCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("job_master").select("Category");
  if (error) {
    throw new Error(error.message);
  }
  return Array.from(new Set(data.map((item) => item.Category)));
};

const fetchArtworkTypes = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("artwork_type_master").select("TypeName");
  if (error) {
    throw new Error(error.message);
  }
  return data.map((item) => item.TypeName);
};

const fetchDesigners = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("designer_master").select("DesignerName");
  if (error) {
    throw new Error(error.message);
  }
  return data.map((item) => item.DesignerName);
};

const fetchDepartmentList = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("system_lookup")
    .select("DepartmentList")
    .single(); // Assuming there's only one row for system lookups
  if (error) {
    throw new Error(error.message);
  }
  return data?.DepartmentList || [];
};

const calculateTimeSpent = (startDate: Date, endDate: Date | null): string => {
  if (!endDate) return "N/A";
  const minutes = differenceInMinutes(endDate, startDate);
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = differenceInHours(endDate, startDate);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min`;
  }
};

const ArtworkLog = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArtworkLog, setSelectedArtworkLog] = useState<ArtworkLog | null>(null);
  const [artworkLogToDeleteId, setArtworkLogToDeleteId] = useState<number | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [artworkTypeFilter, setArtworkTypeFilter] = useState<string>("");
  const [designerFilter, setDesignerFilter] = useState<string>("");
  const [jobIdFilter, setJobIdFilter] = useState<string>("");

  const {
    data: artworkLogs,
    isLoading: isLoadingArtworkLogs,
    isError: isErrorArtworkLogs,
    error: artworkLogsError,
    refetch: refetchArtworkLogs,
  } = useQuery<ArtworkLog[], Error>({
    queryKey: ["artwork_log"],
    queryFn: fetchArtworkLogs,
  });

  const { data: jobIds, isLoading: isLoadingJobIds } = useQuery<string[], Error>({
    queryKey: ["job_ids"],
    queryFn: fetchJobIds,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<string[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: artworkTypes, isLoading: isLoadingArtworkTypes } = useQuery<string[], Error>({
    queryKey: ["artwork_types"],
    queryFn: fetchArtworkTypes,
  });

  const { data: designers, isLoading: isLoadingDesigners } = useQuery<string[], Error>({
    queryKey: ["designers"],
    queryFn: fetchDesigners,
  });

  const { data: departmentList, isLoading: isLoadingDepartmentList } = useQuery<string[], Error>({
    queryKey: ["departmentList"],
    queryFn: fetchDepartmentList,
  });

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetchArtworkLogs();
  };

  const handleEditClick = (log: ArtworkLog) => {
    setSelectedArtworkLog(log);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedArtworkLog(null);
    refetchArtworkLogs();
  };

  const handleDeleteClick = (artworkId: number) => {
    setArtworkLogToDeleteId(artworkId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setArtworkLogToDeleteId(null);
    refetchArtworkLogs();
  };

  const filteredArtworkLogs = useMemo(() => {
    if (!artworkLogs) return [];

    return artworkLogs.filter((log) => {
      const matchesCategory = categoryFilter
        ? log.Category?.toLowerCase().includes(categoryFilter.toLowerCase())
        : true;
      const matchesArtworkType = artworkTypeFilter
        ? log.ArtworkType?.toLowerCase().includes(artworkTypeFilter.toLowerCase())
        : true;
      const matchesDesigner = designerFilter
        ? log.Designer?.toLowerCase().includes(designerFilter.toLowerCase())
        : true;
      const matchesJobId = jobIdFilter
        ? log.JobID?.toLowerCase().includes(jobIdFilter.toLowerCase())
        : true;

      return matchesCategory && matchesArtworkType && matchesDesigner && matchesJobId;
    });
  }, [artworkLogs, categoryFilter, artworkTypeFilter, designerFilter, jobIdFilter]);

  if (isLoadingArtworkLogs || isLoadingJobIds || isLoadingCategories || isLoadingArtworkTypes || isLoadingDesigners || isLoadingDepartmentList) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading artwork logs...</p>
      </div>
    );
  }

  if (isErrorArtworkLogs) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Error loading artwork logs: {artworkLogsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Artwork Log</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">Add Artwork Log</Button>
          </DialogTrigger>
          <AddArtworkLogForm
            onSuccess={handleAddSuccess}
            jobIds={jobIds || []}
            categories={categories || []}
            artworkTypes={artworkTypes || []}
            designers={designers || []}
            departmentList={departmentList || []}
          />
        </Dialog>
      </div>

      <Card className="rounded-xl shadow-subtle mb-6">
        <CardHeader>
          <CardTitle>Filter Artworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by Job ID"
                value={jobIdFilter}
                onChange={(e) => setJobIdFilter(e.target.value)}
                className="pl-9 rounded-md focus-visible:ring-vibrant-purple"
              />
            </div>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 rounded-md focus-visible:ring-vibrant-purple"
              />
            </div>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by Artwork Type"
                value={artworkTypeFilter}
                onChange={(e) => setArtworkTypeFilter(e.target.value)}
                className="pl-9 rounded-md focus-visible:ring-vibrant-purple"
              />
            </div>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by Designer"
                value={designerFilter}
                onChange={(e) => setDesignerFilter(e.target.value)}
                className="pl-9 rounded-md focus-visible:ring-vibrant-purple"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-subtle">
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artwork ID</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Artwork Type</TableHead>
                  <TableHead>Artwork Title</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Revision Count</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Dept Requester</TableHead> {/* New column header */}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtworkLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-24 text-center">
                      No artwork logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArtworkLogs.map((log) => (
                    <TableRow key={log.ArtworkID}>
                      <TableCell className="font-medium">{log.ArtworkID}</TableCell>
                      <TableCell>{log.JobID}</TableCell>
                      <TableCell>{log.Category}</TableCell>
                      <TableCell>{log.ArtworkType}</TableCell>
                      <TableCell>{log.ArtworkTitle}</TableCell>
                      <TableCell>{log.Designer}</TableCell>
                      <TableCell>
                        {log.StartDate ? format(log.StartDate, "PPP") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {log.EndDate ? format(log.EndDate, "PPP") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {log.StartDate && log.EndDate
                          ? calculateTimeSpent(log.StartDate, log.EndDate)
                          : "N/A"}
                      </TableCell>
                      <TableCell>{log.RevisionCount}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.Notes}
                      </TableCell>
                      <TableCell>{log.DeptRequester || "N/A"}</TableCell> {/* Display DeptRequester */}
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(log)}
                            className="rounded-md"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => log.ArtworkID && handleDeleteClick(log.ArtworkID)}
                            className="rounded-md"
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
        </CardContent>
      </Card>

      {selectedArtworkLog && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditArtworkLogForm
            artworkLog={selectedArtworkLog}
            onSuccess={handleEditSuccess}
            jobIds={jobIds || []}
            categories={categories || []}
            artworkTypes={artworkTypes || []}
            designers={designers || []}
            departmentList={departmentList || []}
          />
        </Dialog>
      )}

      {artworkLogToDeleteId && (
        <DeleteArtworkLogDialog
          artworkId={artworkLogToDeleteId}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default ArtworkLog;