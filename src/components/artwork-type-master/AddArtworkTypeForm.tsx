"use client";

import React from "react";
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

interface AddArtworkTypeFormProps {
  onSuccess: () => void;
}

const AddArtworkTypeForm: React.FC<AddArtworkTypeFormProps> = ({ onSuccess }) => {
  const form = useForm<ArtworkTypeMaster>({
    resolver: zodResolver(artworkTypeMasterSchema),
    defaultValues: {
      TypeName: "",
    },
  });

  const onSubmit = async (values: ArtworkTypeMaster) => {
    const { data, error } = await supabase.from("artwork_type_master").insert([
      {
        TypeName: values.TypeName,
      },
    ]);

    if (error) {
      showError(`Failed to add artwork type: ${error.message}`);
    } else {
      showSuccess("Artwork type added successfully!");
      onSuccess();
      form.reset();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Artwork Type</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new artwork type.
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
          <DialogFooter>
            <Button type="submit">Add Artwork Type</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddArtworkTypeForm;