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
import { jobMasterSchema, JobMaster, DesignerMaster } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

interface AddJobFormProps {
  onSuccess: () => void;
}

const fetchDesigners = async (): Promise<DesignerMaster[]> => {
  const { data, error } = await supabase.from("designer_master").select("DesignerName");
  if (error) throw new Error(error.message);
  return data.map(d => ({ DesignerName: d.DesignerName, DesignerID: d.DesignerName })); // Map to DesignerMaster type
};

const fetchDepartmentList = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("system_lookup").select("DepartmentList").single();
  if (error) {
    // If DepartmentList doesn't exist or is null, return an empty array
    if (error.code === 'PGRST116' || error.message.includes('null value in column "DepartmentList"')) {
      return [];
    }
    throw new Error(error.message);
  }
  return data?.DepartmentList || [];
};

const AddJobForm: React.FC<AddJobFormProps> = ({ onSuccess }) => {
  const form = useForm<JobMaster>({
    resolver: zodResolver(jobMasterSchema),
    defaultValues: {
      JobID: "",
      Category: "",
      JobTitle: "",
      RequesterDepartment: "",
      StartDate: new Date(),
      EndDate: undefined,
      PIC_Requester: "",
      Notes: "",
      ProjectType: "",
      PIC_Project: "",
      LeadGrade: "",
    },
  });

  const selectedCategory = form.watch("Category");

  const { data: designers, isLoading: isLoadingDesigners } = useQuery<DesignerMaster[], Error>({
    queryKey: ["designers"],
    queryFn: fetchDesigners,
  });

  const { data: departmentList, isLoading: isLoadingDepartmentList } = useQuery<string[], Error>({
    queryKey: ["departmentList"],
    queryFn: fetchDepartmentList,
  });

  useEffect(() => {
    // Reset conditional fields when category changes
    form.setValue("ProjectType", "");
    form.setValue("PIC_Project", "");
    form.setValue("LeadGrade", "");
    if (selectedCategory !== "Lead") {
      form.setValue("RequesterDepartment", "");
    }
    if (selectedCategory === "Lead") {
      form.setValue("RequesterDepartment", null); // Ensure it's null for Lead
    }
  }, [selectedCategory, form]);

  const onSubmit = async (values: JobMaster) => {
    const payload = {
      JobID: values.JobID,
      Category: values.Category,
      JobTitle: values.JobTitle,
      StartDate: values.StartDate.toISOString(),
      EndDate: values.EndDate ? values.EndDate.toISOString() : null,
      Notes: values.Notes || null,
      
      // Conditional fields
      RequesterDepartment: values.Category === "Lead" ? null : values.RequesterDepartment || null,
      PIC_Requester: values.Category === "Project" ? null : values.PIC_Requester || null,
      ProjectType: values.Category === "Project" ? values.ProjectType || null : null,
      PIC_Project: values.Category === "Project" ? values.PIC_Project || null : null,
      LeadGrade: values.Category === "Lead" ? values.LeadGrade || null : null,
    };

    const { error } = await supabase.from("job_master").insert([payload]);

    if (error) {
      showError(`Failed to add job: ${error.message}`);
    } else {
      showSuccess("Job added successfully!");
      onSuccess();
      form.reset();
    }
  };

  const projectTypes = ["Event", "Travel", "Wellness", "Other"];
  const leadGrades = ["A", "B", "C", "D"];

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Job</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new job to the master list.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="JobID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                        {isLoadingDesigners ? (
                          <SelectItem value="" disabled>Loading designers...</SelectItem>
                        ) : (
                          designers?.map((designer) => (
                            <SelectItem key={designer.DesignerID} value={designer.DesignerName}>
                              {designer.DesignerName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </>
          )}

          {selectedCategory === "Lead" && (
            <>
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
            </>
          )}

          {selectedCategory === "Internal" && (
            <FormField
              control={form.control}
              name="RequesterDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requester Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCategory !== "Project" && selectedCategory !== "Lead" && selectedCategory !== "Internal" && (
            <>
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
            </>
          )}

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
            <Button type="submit">Add Job</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddJobForm;