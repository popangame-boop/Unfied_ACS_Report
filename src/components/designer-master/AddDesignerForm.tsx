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
import { designerMasterSchema, DesignerMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface AddDesignerFormProps {
  onSuccess: () => void;
}

const AddDesignerForm: React.FC<AddDesignerFormProps> = ({ onSuccess }) => {
  const form = useForm<DesignerMaster>({
    resolver: zodResolver(designerMasterSchema),
    defaultValues: {
      DesignerID: "",
      DesignerName: "",
      Role: "",
      Status: "",
    },
  });

  const onSubmit = async (values: DesignerMaster) => {
    const { data, error } = await supabase.from("designer_master").insert([
      {
        DesignerID: values.DesignerID,
        DesignerName: values.DesignerName,
        Role: values.Role || null,
        Status: values.Status || null,
      },
    ]);

    if (error) {
      showError(`Failed to add designer: ${error.message}`);
    } else {
      showSuccess("Designer added successfully!");
      onSuccess();
      form.reset();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Designer</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new designer.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="DesignerID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designer ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DesignerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designer Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Add Designer</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddDesignerForm;