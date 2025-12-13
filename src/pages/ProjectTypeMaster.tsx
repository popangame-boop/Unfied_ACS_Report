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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectTypeMaster } from "@/lib/schemas";
import AddProjectTypeForm from "@/components/project-type-master/AddProjectTypeForm";
import EditProjectTypeForm from "@/components/project-type-master/EditProjectTypeForm";
import DeleteProjectTypeDialog from "@/components/project-type-master/DeleteProjectTypeDialog";
import { showLoading, dismissToast } from "@/utils/toast";

const fetchProjectTypes = async (): Promise<ProjectTypeMaster[]> => {
  const { data, error } = await supabase.from("project_type_master").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data.map(item => ({
    id: item.id,
    type_name: item.type_name,
    created_at: item.created_at,
  }));
};

const ProjectTypeMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectTypeMaster | null>(null);
  const [projectTypeToDelete, setProjectTypeToDelete] = useState<{ id: string; type_name: string } | null>(null);

  const {
    data: projectTypes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ProjectTypeMaster[], Error>({
    queryKey: ["project_type_master"],
    queryFn: fetchProjectTypes,
  });

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleEditClick = (projectType: ProjectTypeMaster) => {
    setSelectedProjectType(projectType);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedProjectType(null);
    refetch();
  };

  const handleDeleteClick = (id: string, type_name: string) => {
    setProjectTypeToDelete({ id, type_name });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setProjectTypeToDelete(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading project types...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Error loading project types: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Type Master</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">Add Project Type</Button>
          </DialogTrigger>
          <AddProjectTypeForm onSuccess={handleAddSuccess} />
        </Dialog>
      </div>

      <Card className="rounded-xl shadow-subtle">
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTypes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No project types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectTypes?.map((projectType) => (
                    <TableRow key={projectType.id}>
                      <TableCell className="font-medium">{projectType.type_name}</TableCell>
                      <TableCell>
                        {projectType.created_at ? format(new Date(projectType.created_at), "PPP p") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(projectType)}
                            className="rounded-md"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => projectType.id && handleDeleteClick(projectType.id, projectType.type_name)}
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

      {selectedProjectType && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditProjectTypeForm projectType={selectedProjectType} onSuccess={handleEditSuccess} />
        </Dialog>
      )}

      {projectTypeToDelete && (
        <DeleteProjectTypeDialog
          projectTypeId={projectTypeToDelete.id}
          typeName={projectTypeToDelete.type_name}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default ProjectTypeMaster;