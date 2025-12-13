"use client";

import React, { useEffect } from "react";
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
import { projectTypeMasterSchema, ProjectTypeMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface EditProjectTypeFormProps {
  projectType: ProjectTypeMaster;
  onSuccess: () => void;
}

const EditProjectTypeForm: React.FC<EditProjectTypeFormProps> = ({ projectType, onSuccess }) => {
  const form = useForm<ProjectTypeMaster>({
    resolver: zodResolver(projectTypeMasterSchema),
    defaultValues: projectType,
  });

  useEffect(() => {
    form.reset(projectType);
  }, [projectType, form]);

  const onSubmit = async (values: ProjectTypeMaster) => {
    const { data, error } = await supabase
      .from("project_type_master")
      .update({
        type_name: values.type_name,
      })
      .eq("id", projectType.id); // Use 'id' for updating

    if (error) {
      showError(`Failed to update project type: ${error.message}`);
    } else {
      showSuccess("Project type updated successfully!");
      onSuccess();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Project Type</DialogTitle>
        <DialogDescription>
          Make changes to the project type details here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="type_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="created_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Created At</FormLabel>
                <FormControl>
                  <Input {...field} disabled value={field.value ? new Date(field.value).toLocaleString() : "N/A"} />
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

export default EditProjectTypeForm;