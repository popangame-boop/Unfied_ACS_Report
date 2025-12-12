"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadSubmissionFormSchema, LeadSubmissionForm } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";

const LeadSubmission = () => {
  const form = useForm<LeadSubmissionForm>({
    resolver: zodResolver(leadSubmissionFormSchema),
    defaultValues: {
      ClientName: "",
      PIC_Requester: "",
      LeadGrade: undefined, // Use undefined for initial state of enum
      CustomBrief: "",
      LinkOnedrive: "",
      JobTitle: "",
    },
  });

  const onSubmit = async (values: LeadSubmissionForm) => {
    const newJobID = `LEAD-${Date.now()}`; // Generate a unique JobID
    const currentStartDate = new Date().toISOString();

    const { data, error } = await supabase.from("job_master").insert([
      {
        JobID: newJobID,
        Category: "Lead", // Auto-set category
        JobTitle: values.JobTitle,
        ClientName: values.ClientName,
        PIC_Requester: values.PIC_Requester,
        LeadGrade: values.LeadGrade,
        CustomBrief: values.CustomBrief || null,
        LinkOnedrive: values.LinkOnedrive || null,
        StartDate: currentStartDate,
        // Other fields from job_master schema are null for 'Lead' category
        RequesterDepartment: null,
        EndDate: null,
        Notes: null,
        ProjectType: null,
        PIC_Project: null,
      },
    ]);

    if (error) {
      showError(`Failed to submit lead: ${error.message}`);
    } else {
      showSuccess("Lead submitted successfully!");
      form.reset();
    }
  };

  const leadGrades = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg rounded-xl shadow-subtle">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Lead Submission</CardTitle>
          <CardDescription className="text-center">
            Submit new lead information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
              <Button type="submit" className="w-full bg-vibrant-purple hover:bg-vibrant-purple/90 text-white rounded-md shadow-sm">
                Submit Lead
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadSubmission;