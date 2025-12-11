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
import { designerMasterSchema, DesignerMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface EditDesignerFormProps {
  designer: DesignerMaster;
  onSuccess: () => void;
}

const EditDesignerForm: React.FC<EditDesignerFormProps> = ({ designer, onSuccess }) => {
  const form = useForm<DesignerMaster>({
    resolver: zodResolver(designerMasterSchema),
    defaultValues: designer,
  });

  useEffect(() => {
    form.reset(designer);
  }, [designer, form]);

  const onSubmit = async (values: DesignerMaster) => {
    const { data, error } = await supabase
      .from("designer_master")
      .update({
        DesignerName: values.DesignerName,
        Role: values.Role || null,
        Status: values.Status || null,
      })
      .eq("DesignerID", designer.DesignerID);

    if (error) {
      showError(`Failed to update designer: ${error.message}`);
    } else {
      showSuccess("Designer updated successfully!");
      onSuccess();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Designer</DialogTitle>
        <DialogDescription>
          Make changes to the designer details here. Click save when you're done.
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
                  <Input {...field} disabled />
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
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default EditDesignerForm;