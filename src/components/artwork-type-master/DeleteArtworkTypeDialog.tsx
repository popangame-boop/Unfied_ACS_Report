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

interface DeleteArtworkTypeDialogProps {
  typeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteArtworkTypeDialog: React.FC<DeleteArtworkTypeDialogProps> = ({
  typeName,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const handleDelete = async () => {
    const { error } = await supabase.from("artwork_type_master").delete().eq("TypeName", typeName);

    if (error) {
      showError(`Failed to delete artwork type: ${error.message}`);
    } else {
      showSuccess("Artwork type deleted successfully!");
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the artwork type "
            <span className="font-bold">{typeName}</span>" from the database.
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

export default DeleteArtworkTypeDialog;