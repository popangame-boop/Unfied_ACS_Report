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

interface DeleteProjectTypeDialogProps {
  projectTypeId: string; // Using UUID for deletion
  typeName: string; // For display purposes
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteProjectTypeDialog: React.FC<DeleteProjectTypeDialogProps> = ({
  projectTypeId,
  typeName,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const handleDelete = async () => {
    const { error } = await supabase.from("project_type_master").delete().eq("id", projectTypeId);

    if (error) {
      showError(`Failed to delete project type: ${error.message}`);
    } else {
      showSuccess("Project type deleted successfully!");
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project type "
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

export default DeleteProjectTypeDialog;