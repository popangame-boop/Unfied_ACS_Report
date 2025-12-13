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
import { projectTypeMasterSchema, ProjectTypeMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface AddProjectTypeFormProps {
  onSuccess: () => void;
}

const AddProjectTypeForm: React.FC<AddProjectTypeFormProps> = ({ onSuccess }) => {
  const form = useForm<ProjectTypeMaster>({
    resolver: zodResolver(projectTypeMasterSchema),
    defaultValues: {
      type_name: "",
    },
  });

  const onSubmit = async (values: ProjectTypeMaster) => {
    const { data, error } = await supabase.from("project_type_master").insert([
      {
        type_name: values.type_name,
      },
    ]);

    if (error) {
      showError(`Failed to add project type: ${error.message}`);
    } else {
      showSuccess("Project type added successfully!");
      onSuccess();
      form.reset();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Project Type</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new project type.
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
          <DialogFooter>
            <Button type="submit">Add Project Type</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddProjectTypeForm;