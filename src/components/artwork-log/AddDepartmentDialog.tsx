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
import { useQueryClient } from "@tanstack/react-query";

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  newDepartmentName: z.string().min(1, { message: "Department name is required." }),
});

const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newDepartmentName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Fetch both 'id' and 'DepartmentList' to correctly identify and update the row
    const { data: currentLookup, error: fetchError } = await supabase
      .from("system_lookup")
      .select("id, DepartmentList") // Select 'id' here
      .single();

    if (fetchError) {
      showError(`Failed to fetch department list: ${fetchError.message}`);
      return;
    }

    const currentDepartmentList: string[] = currentLookup?.DepartmentList || [];

    if (currentDepartmentList.some(dept => dept.toLowerCase() === values.newDepartmentName.toLowerCase())) {
      showError("Department already exists.");
      return;
    }

    const updatedDepartmentList = [...currentDepartmentList, values.newDepartmentName];

    const { error: updateError } = await supabase
      .from("system_lookup")
      .update({ DepartmentList: updatedDepartmentList })
      .eq("id", currentLookup.id); // Use 'id' for the update condition

    if (updateError) {
      showError(`Failed to add department: ${updateError.message}`);
    } else {
      showSuccess("Department added successfully!");
      queryClient.invalidateQueries({ queryKey: ["departmentList"] }); // Invalidate to refetch the list
      onSuccess();
      form.reset();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogDescription>
          Enter the name of the new department you want to add.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="newDepartmentName"
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