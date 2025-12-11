"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { artworkTypeMasterSchema, ArtworkTypeMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface EditArtworkTypeFormProps {
  artworkType: ArtworkTypeMaster;
  onSuccess: () => void;
}

const EditArtworkTypeForm: React.FC<EditArtworkTypeFormProps> = ({ artworkType, onSuccess }) => {
  const form = useForm<ArtworkTypeMaster>({
    resolver: zodResolver(artworkTypeMasterSchema),
    defaultValues: artworkType,
  });

  useEffect(() => {
    form.reset(artworkType);
  }, [artworkType, form]);

  const onSubmit = async (values: ArtworkTypeMaster) => {
    const { data, error } = await supabase
      .from("artwork_type_master")
      .update({
        TypeName: values.TypeName,
      })
      .eq("TypeName", artworkType.TypeName); // Assuming TypeName is the primary key or unique identifier

    if (error) {
      showError(`Failed to update artwork type: ${error.message}`);
    } else {
      showSuccess("Artwork type updated successfully!");
      onSuccess();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Artwork Type</DialogTitle>
        <DialogDescription>
          Make changes to the artwork type details here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="TypeName"
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

export default EditArtworkTypeForm;