"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { supabase } from "@/integrations/supabase/client";
import type { DesignerMaster } from "@/lib/schemas";
import AddDesignerForm from "@/components/designer-master/AddDesignerForm";
import EditDesignerForm from "@/components/designer-master/EditDesignerForm";
import DeleteDesignerDialog from "@/components/designer-master/DeleteDesignerDialog";
import { showLoading, dismissToast } from "@/utils/toast";

const fetchDesigners = async (): Promise<DesignerMaster[]> => {
  const { data, error } = await supabase.from("designer_master").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const DesignerMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<DesignerMaster | null>(null);
  const [designerToDeleteId, setDesignerToDeleteId] = useState<string | null>(null);

  const {
    data: designers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DesignerMaster[], Error>({
    queryKey: ["designer_master"],
    queryFn: fetchDesigners,
  });

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleEditClick = (designer: DesignerMaster) => {
    setSelectedDesigner(designer);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedDesigner(null);
    refetch();
  };

  const handleDeleteClick = (designerId: string) => {
    setDesignerToDeleteId(designerId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setDesignerToDeleteId(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading designers...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Error loading designers: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Designer Master</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">Add Designer</Button>
          </DialogTrigger>
          <AddDesignerForm onSuccess={handleAddSuccess} />
        </Dialog>
      </div>

      <Card className="rounded-xl shadow-subtle">
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Designer ID</TableHead>
                  <TableHead>Designer Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No designers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  designers?.map((designer) => (
                    <TableRow key={designer.DesignerID}>
                      <TableCell className="font-medium">{designer.DesignerID}</TableCell>
                      <TableCell>{designer.DesignerName}</TableCell>
                      <TableCell>{designer.Role || "N/A"}</TableCell>
                      <TableCell>{designer.Status || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(designer)}
                            className="rounded-md"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(designer.DesignerID)}
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

      {selectedDesigner && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditDesignerForm designer={selectedDesigner} onSuccess={handleEditSuccess} />
        </Dialog>
      )}

      {designerToDeleteId && (
        <DeleteDesignerDialog
          designerId={designerToDeleteId}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default DesignerMaster;