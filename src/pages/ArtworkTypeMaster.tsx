"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { format } from "date-fns";

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
import type { ArtworkTypeMaster } from "@/lib/schemas";
import AddArtworkTypeForm from "@/components/artwork-type-master/AddArtworkTypeForm";
import EditArtworkTypeForm from "@/components/artwork-type-master/EditArtworkTypeForm";
import DeleteArtworkTypeDialog from "@/components/artwork-type-master/DeleteArtworkTypeDialog";
import { showLoading, dismissToast } from "@/utils/toast";

const fetchArtworkTypes = async (): Promise<ArtworkTypeMaster[]> => {
  const { data, error } = await supabase.from("artwork_type_master").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data.map(item => ({
    TypeName: item.TypeName,
    created_at: item.created_at,
  }));
};

const ArtworkTypeMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArtworkType, setSelectedArtworkType] = useState<ArtworkTypeMaster | null>(null);
  const [artworkTypeToDeleteName, setArtworkTypeToDeleteName] = useState<string | null>(null);

  const {
    data: artworkTypes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ArtworkTypeMaster[], Error>({
    queryKey: ["artwork_type_master"],
    queryFn: fetchArtworkTypes,
  });

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    refetch();
  };

  const handleEditClick = (artworkType: ArtworkTypeMaster) => {
    setSelectedArtworkType(artworkType);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedArtworkType(null);
    refetch();
  };

  const handleDeleteClick = (typeName: string) => {
    setArtworkTypeToDeleteName(typeName);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setArtworkTypeToDeleteName(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading artwork types...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        <p>Error loading artwork types: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Artwork Type Master</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">Add Artwork Type</Button>
          </DialogTrigger>
          <AddArtworkTypeForm onSuccess={handleAddSuccess} />
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
                {artworkTypes?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No artwork types found.
                    </TableCell>
                  </TableRow>
                ) : (
                  artworkTypes?.map((artworkType) => (
                    <TableRow key={artworkType.TypeName}>
                      <TableCell className="font-medium">{artworkType.TypeName}</TableCell>
                      <TableCell>
                        {artworkType.created_at ? format(new Date(artworkType.created_at), "PPP p") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(artworkType)}
                            className="rounded-md"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(artworkType.TypeName)}
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

      {selectedArtworkType && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <EditArtworkTypeForm artworkType={selectedArtworkType} onSuccess={handleEditSuccess} />
        </Dialog>
      )}

      {artworkTypeToDeleteName && (
        <DeleteArtworkTypeDialog
          typeName={artworkTypeToDeleteName}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default ArtworkTypeMaster;