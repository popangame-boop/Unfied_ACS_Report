"use client";

import React, { useEffect } from "react";
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

const editDepartmentSchema = z.object({
  departmentName: z.string().min(1, { message: "Department name is required." }),
});

type EditDepartmentFormValues = z.infer<typeof editDepartmentSchema>;

interface EditDepartmentFormProps {
  oldDepartmentName: string;
  onSuccess: () => void;
  existingDepartments: string[];
}

const EditDepartmentForm: React.FC<EditDepartmentFormProps> = ({
  oldDepartmentName,
  onSuccess,
  existingDepartments,
}) => {
  const queryClient = useQueryClient();
  const form = useForm<EditDepartmentFormValues>({
    resolver: zodResolver(editDepartmentSchema),
    defaultValues: {
      departmentName: oldDepartmentName,
    },
  });

  useEffect(() => {
    form.reset({ departmentName: oldDepartmentName });
  }, [oldDepartmentName, form]);

  const onSubmit = async (values: EditDepartmentFormValues) => {
    const newDepartmentName = values.departmentName.trim();

    if (newDepartmentName === oldDepartmentName) {
      showSuccess("No changes made.");
      onSuccess();
      return;
    }

    if (existingDepartments.includes(newDepartmentName)) {
      form.setError("departmentName", {
        type: "manual",
        message: "This department name already exists.",
      });
      return;
    }

    const { data: currentLookup, error: fetchError } = await supabase
      .from("system_lookup")
      .select("DepartmentList")
      .single();

    if (fetchError) {
      showError(`Failed to fetch system lookup: ${fetchError.message}`);
      return;
    }

    const updatedDepartmentList = (currentLookup?.DepartmentList || []).map((dep) =>
      dep === oldDepartmentName ? newDepartmentName : dep
    );

    const { error } = await supabase
      .from("system_lookup")
      .update({ DepartmentList: updatedDepartmentList })
      .eq("created_at", currentLookup.created_at); // Assuming created_at is a unique identifier for the single row

    if (error) {
      showError(`Failed to update department: ${error.message}`);
    } else {
      showSuccess("Department updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["departmentList"] });
      onSuccess();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Department</DialogTitle>
        <DialogDescription>
          Update the name of the department.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="departmentName"
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
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default EditDepartmentForm;