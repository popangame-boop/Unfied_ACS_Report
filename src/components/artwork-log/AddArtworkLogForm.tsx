"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { artworkLogSchema, ArtworkLog } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import AddDepartmentForm from "@/components/system-lookup/AddDepartmentForm"; // New import

interface AddArtworkLogFormProps {
  onSuccess: () => void;
  jobIds: string[];
  categories: string[];
  artworkTypes: string[];
  designers: string[];
}

const fetchDepartmentList = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("system_lookup").select("DepartmentList").single();
  if (error) {
    if (error.code === 'PGRST116' || error.message.includes('null value in column "DepartmentList"')) {
      return [];
    }
    throw new Error(error.message);
  }
  return data?.DepartmentList || [];
};

const AddArtworkLogForm: React.FC<AddArtworkLogFormProps> = ({
  onSuccess,
  jobIds,
  categories,
  artworkTypes,
  designers,
}) => {
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);

  const form = useForm<ArtworkLog>({
    resolver: zodResolver(artworkLogSchema),
    defaultValues: {
      JobID: "",
      Category: "",
      ArtworkType: "",
      ArtworkTitle: "",
      Designer: "",
      StartDate: new Date(),
      EndDate: undefined,
      RevisionCount: 0,
      Notes: "",
      RequesterDepartment: "", // Initialize new field
    },
  });

  const selectedCategory = form.watch("Category");

  const { data: departmentList, isLoading: isLoadingDepartmentList, refetch: refetchDepartmentList } = useQuery<string[], Error>({
    queryKey: ["departmentList"],
    queryFn: fetchDepartmentList,
  });

  useEffect(() => {
    // Reset conditional fields when category changes
    if (selectedCategory === "Internal") {
      form.setValue("JobID", null);
    } else {
      form.setValue("RequesterDepartment", null);
    }
  }, [selectedCategory, form]);

  const onSubmit = async (values: ArtworkLog) => {
    const payload = {
      JobID: selectedCategory === "Internal" ? null : values.JobID,
      Category: values.Category,
      ArtworkType: values.ArtworkType,
      ArtworkTitle: values.ArtworkTitle,
      Designer: values.Designer,
      StartDate: values.StartDate.toISOString(),
      EndDate: values.EndDate ? values.EndDate.toISOString() : null,
      RevisionCount: values.RevisionCount || 0,
      Notes: values.Notes || null,
      RequesterDepartment: selectedCategory === "Internal" ? values.RequesterDepartment : null,
    };

    const { data, error } = await supabase.from("artwork_log").insert([payload]);

    if (error) {
      showError(`Failed to add artwork log: ${error.message}`);
    } else {
      showSuccess("Artwork log added successfully!");
      onSuccess();
      form.reset();
    }
  };

  const handleAddDepartmentSuccess = () => {
    setIsAddDepartmentModalOpen(false);
    refetchDepartmentList(); // Refetch departments after adding a new one
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Artwork Log</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new artwork log entry.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="Category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCategory !== "Internal" && (
            <FormField
              control={form.control}
              name="JobID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job ID</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Job ID" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobIds.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCategory === "Internal" && (
            <FormField
              control={form.control}
              name="RequesterDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requester Department</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingDepartmentList ? (
                          <SelectItem value="" disabled>Loading departments...</SelectItem>
                        ) : (
                          departmentList?.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Dialog open={isAddDepartmentModalOpen} onOpenChange={setIsAddDepartmentModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setIsAddDepartmentModalOpen(true)}>
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">Add Department</span>
                        </Button>
                      </DialogTrigger>
                      <AddDepartmentForm onSuccess={handleAddDepartmentSuccess} existingDepartments={departmentList || []} />
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="ArtworkType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artwork Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Artwork Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {artworkTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ArtworkTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artwork Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Designer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Designer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {designers.map((designer) => (
                      <SelectItem key={designer} value={designer}>
                        {designer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="StartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="EndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date (Optional)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="RevisionCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revision Count</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Add Artwork Log</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddArtworkLogForm;