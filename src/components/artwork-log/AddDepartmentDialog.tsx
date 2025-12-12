"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const addDepartmentSchema = z.object({
  newDepartment: z.string().min(1, { message: "Department name is required." }),
});

interface AddDepartmentDialogProps {
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({ onSuccess, onOpenChange }) => {
  const form = useForm<z.infer<typeof addDepartmentSchema>>({
    resolver: zodResolver(addDepartmentSchema),
    defaultValues: {
      newDepartment: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof addDepartmentSchema>) => {
    // Fetch current DepartmentList
    const { data: currentLookup, error: fetchError } = await supabase
      .from("system_lookup")
      .select("DepartmentList")
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for initial state
      showError(`Failed to fetch department list: ${fetchError.message}`);
      return;
    }

    const currentDepartments = currentLookup?.DepartmentList || [];
    const newDepartment = values.newDepartment.trim();

    if (currentDepartments.includes(newDepartment)) {
      form.setError("newDepartment", { message: "Department already exists." });
      return;
    }

    const updatedDepartments = [...currentDepartments, newDepartment];

    // Update or insert the DepartmentList
    const { error: updateError } = await supabase
      .from("system_lookup")
      .upsert(
        { DepartmentList: updatedDepartments },
        { onConflict: "created_at" } // Assuming created_at is a unique column or primary key for a single row
      );

    if (updateError) {
      showError(`Failed to add department: ${updateError.message}`);
    } else {
      showSuccess(`Department "${newDepartment}" added successfully!`);
      onSuccess();
      onOpenChange(false); // Close the dialog
      form.reset();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogDescription>
          Enter the name of the new department to add to the list.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="newDepartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Add Department</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddDepartmentDialog;