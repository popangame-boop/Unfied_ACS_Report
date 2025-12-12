"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { jobMasterSchema, JobMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface EditJobFormProps {
  job: JobMaster;
  onSuccess: () => void;
}

const fetchDesigners = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("designer_master").select("DesignerName");
  if (error) {
    throw new Error(error.message);
  }
  return data.map((item) => item.DesignerName);
};

const EditJobForm: React.FC<EditJobFormProps> = ({ job, onSuccess }) => {
  const form = useForm<JobMaster>({
    resolver: zodResolver(jobMasterSchema),
    defaultValues: {
      ...job,
      StartDate: job.StartDate ? new Date(job.StartDate) : new Date(),
      EndDate: job.EndDate ? new Date(job.EndDate) : undefined,
      // Ensure new fields have default values for editing
      ProjectType: job.ProjectType || "",
      PIC_Project: job.PIC_Project || "",
      LeadGrade: job.LeadGrade || "",
      ClientName: job.ClientName || "",
      CustomBrief: job.CustomBrief || "",
      LinkOnedrive: job.LinkOnedrive || "",
    },
  });

  useEffect(() => {
    form.reset({
      ...job,
      StartDate: job.StartDate ? new Date(job.StartDate) : new Date(),
      EndDate: job.EndDate ? new Date(job.EndDate) : undefined,
      ProjectType: job.ProjectType || "",
      PIC_Project: job.PIC_Project || "",
      LeadGrade: job.LeadGrade || "",
      ClientName: job.ClientName || "",
      CustomBrief: job.CustomBrief || "",
      LinkOnedrive: job.LinkOnedrive || "",
    });
  }, [job, form]);

  const selectedCategory = form.watch("Category");

  const { data: designers, isLoading: isLoadingDesigners } = useQuery<string[], Error>({
    queryKey: ["designers"],
    queryFn: fetchDesigners,
  });

  const onSubmit = async (values: JobMaster) => {
    const { data, error } = await supabase
      .from("job_master")
      .update({
        Category: values.Category,
        JobTitle: values.JobTitle,
        RequesterDepartment: values.Category === "Lead" || values.Category === "Internal" ? null : values.RequesterDepartment || null,
        StartDate: values.StartDate.toISOString(),
        EndDate: values.EndDate ? values.EndDate.toISOString() : null,
        PIC_Requester: values.Category === "Project" || values.Category === "Internal" ? null : values.PIC_Requester || null,
        Notes: values.Notes || null,
        ProjectType: values.Category === "Project" ? values.ProjectType || null : null,
        PIC_Project: values.Category === "Project" ? values.PIC_Project || null : null,
        LeadGrade: values.Category === "Lead" ? values.LeadGrade || null : null,
        ClientName: values.Category === "Lead" ? values.ClientName || null : null,
        CustomBrief: values.Category === "Lead" ? values.CustomBrief || null : null,
        LinkOnedrive: values.Category === "Lead" ? values.LinkOnedrive || null : null,
      })
      .eq("JobID", job.JobID);

    if (error) {
      showError(`Failed to update job: ${error.message}`);
    } else {
      showSuccess("Job updated successfully!");
      onSuccess();
    }
  };

  const projectTypes = ["Event", "Travel", "Wellness", "Other"];
  const leadGrades = ["A", "B", "C", "D"];

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Job</DialogTitle>
        <DialogDescription>
          Make changes to the job details here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {selectedCategory !== "Internal" && (
            <FormField
              control={form.control}
              name="JobID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCategory !== "Internal" && (
            <FormField
              control={form.control}
              name="JobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCategory === "Project" && (
            <>
              <FormField
                control={form.control}
                name="ProjectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Project Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectTypes.map((type) => (
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
                name="PIC_Project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIC Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a PIC Project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {designers?.map((designer) => (
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
            </>
          )}

          {selectedCategory === "Lead" && (
            <>
              <FormField
                control={form.control}
                name="PIC_Requester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIC Requester</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="LeadGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Lead Grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leadGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
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
                name="ClientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="CustomBrief"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Brief</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="LinkOnedrive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OneDrive Link</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {selectedCategory === "Project" && (
            <FormField
              control={form.control}
              name="RequesterDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requester Department</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCategory !== "Internal" && (
            <>
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
            </>
          )}

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
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default EditJobForm;