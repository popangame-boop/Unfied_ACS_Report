"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

interface DeleteArtworkLogDialogProps {
  artworkId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteArtworkLogDialog: React.FC<DeleteArtworkLogDialogProps> = ({
  artworkId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const handleDelete = async () => {
    const { error } = await supabase.from("artwork_log").delete().eq("ArtworkID", artworkId);

    if (error) {
      showError(`Failed to delete artwork log: ${error.message}`);
    } else {
      showSuccess("Artwork log deleted successfully!");
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the artwork log with ID{" "}
            <span className="font-bold">{artworkId}</span> from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteArtworkLogDialog;