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
import { useQueryClient } from "@tanstack/react-query";

interface DeleteDepartmentDialogProps {
  departmentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingDepartments: string[];
}

const DeleteDepartmentDialog: React.FC<DeleteDepartmentDialogProps> = ({
  departmentName,
  open,
  onOpenChange,
  onSuccess,
  existingDepartments,
}) => {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const { data: currentLookup, error: fetchError } = await supabase
      .from("system_lookup")
      .select("DepartmentList")
      .single();

    if (fetchError) {
      showError(`Failed to fetch system lookup: ${fetchError.message}`);
      return;
    }

    const updatedDepartmentList = (currentLookup?.DepartmentList || []).filter(
      (dep) => dep !== departmentName
    );

    const { error } = await supabase
      .from("system_lookup")
      .update({ DepartmentList: updatedDepartmentList })
      .eq("created_at", currentLookup.created_at); // Assuming created_at is a unique identifier for the single row

    if (error) {
      showError(`Failed to delete department: ${error.message}`);
    } else {
      showSuccess("Department deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["departmentList"] });
      onSuccess();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the department "
            <span className="font-bold">{departmentName}</span>" from the database.
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

export default DeleteDepartmentDialog;