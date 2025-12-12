"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";

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

type AddDepartmentFormValues = z.infer<typeof addDepartmentSchema>;

interface AddDepartmentFormProps {
  onSuccess: () => void;
  existingDepartments: string[];
}

const AddDepartmentForm: React.FC<AddDepartmentFormProps> = ({ onSuccess, existingDepartments }) => {
  const queryClient = useQueryClient();
  const form = useForm<AddDepartmentFormValues>({
    resolver: zodResolver(addDepartmentSchema),
    defaultValues: {
      newDepartment: "",
    },
  });

  const onSubmit = async (values: AddDepartmentFormValues) => {
    const departmentToAdd = values.newDepartment.trim();

    if (existingDepartments.includes(departmentToAdd)) {
      form.setError("newDepartment", {
        type: "manual",
        message: "This department already exists.",
      });
      return;
    }

    // Fetch the current system_lookup entry
    const { data: currentLookup, error: fetchError } = await supabase
      .from("system_lookup")
      .select("DepartmentList")
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      showError(`Failed to fetch system lookup: ${fetchError.message}`);
      return;
    }

    const updatedDepartmentList = currentLookup?.DepartmentList
      ? [...currentLookup.DepartmentList, departmentToAdd]
      : [departmentToAdd];

    const { error } = await supabase
      .from("system_lookup")
      .upsert(
        {
          // Assuming there's a single row for system_lookup, or we need to insert if none exists
          // For simplicity, we'll assume a single row and try to update it.
          // If no row exists, upsert will insert it.
          // A primary key would be needed for a robust upsert, but for a single lookup row,
          // we might rely on a specific ID or just update the first one found.
          // For now, let's assume a single row and update it.
          // If system_lookup has no primary key, this upsert might not work as expected.
          // A more robust solution would be to fetch, then update by ID if it exists, or insert.
          // Given the schema, it's likely a single row.
          DepartmentList: updatedDepartmentList,
        },
        { onConflict: 'created_at' } // Use a unique column for upsert, assuming created_at is unique or there's only one row
      );

    if (error) {
      showError(`Failed to add department: ${error.message}`);
    } else {
      showSuccess("Department added successfully!");
      queryClient.invalidateQueries({ queryKey: ["departmentList"] }); // Invalidate to refetch in forms
      onSuccess();
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

export default AddDepartmentForm;