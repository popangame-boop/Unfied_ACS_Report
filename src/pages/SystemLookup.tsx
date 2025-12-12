"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, Trash2Icon, PlusCircle } from "lucide-react";

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
import { showError } from "@/utils/toast";
import AddDepartmentForm from "@/components/system-lookup/AddDepartmentForm";
import EditDepartmentForm from "@/components/system-lookup/EditDepartmentForm";
import DeleteDepartmentDialog from "@/components/system-lookup/DeleteDepartmentDialog";

const fetchDepartmentList = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("system_lookup").select("DepartmentList").single();
  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return [];
    }
    throw new Error(error.message);
  }
  return data?.DepartmentList || [];
};

const SystemLookup = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const {
    data: departmentList,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<string[], Error>({
    queryKey: ["departmentList"],
    queryFn: fetchDepartmentList,
  });

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleEditClick = (department: string) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedDepartment(null);
    refetch();
  };

  const handleDeleteClick = (department: string) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading system lookup data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Error loading system lookup data: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Lookup Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>
          <AddDepartmentForm onSuccess={handleAddSuccess} existingDepartments={departmentList || []} />
        </Dialog>
      </div>

      <Card className="rounded-xl shadow-subtle">
        <CardHeader>
          <CardTitle>Department List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentList?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No departments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  departmentList?.map((department, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{department}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(department)}
                            className="rounded-md"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(department)}
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

      {selectedDepartment && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditDepartmentForm
            oldDepartmentName={selectedDepartment}
            onSuccess={handleEditSuccess}
            existingDepartments={departmentList || []}
          />
        </Dialog>
      )}

      {departmentToDelete && (
        <DeleteDepartmentDialog
          departmentName={departmentToDelete}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteSuccess}
          existingDepartments={departmentList || []}
        />
      )}
    </div>
  );
};

export default SystemLookup;