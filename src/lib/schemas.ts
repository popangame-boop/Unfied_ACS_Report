import * as z from "zod";

export const jobMasterSchema = z.object({
  JobID: z.string().min(1, { message: "Job ID is required." }),
  Category: z.string().min(1, { message: "Category is required." }),
  JobTitle: z.string().min(1, { message: "Job Title is required." }),
  RequesterDepartment: z.string().optional().nullable(),
  StartDate: z.date({ required_error: "Start Date is required." }),
  EndDate: z.date().optional().nullable(),
  PIC_Requester: z.string().optional().nullable(),
  Notes: z.string().optional().nullable(),
  // New conditional fields for Job Master
  ProjectType: z.string().optional().nullable(), // For 'Project' category
  PIC_Project: z.string().optional().nullable(), // For 'Project' category
  LeadGrade: z.string().optional().nullable(), // For 'Lead' category
  ClientName: z.string().optional().nullable(), // For 'Lead' category
  CustomBrief: z.string().optional().nullable(), // For 'Lead' category
  LinkOnedrive: z.string().optional().nullable(), // For 'Lead' category
}).superRefine((data, ctx) => {
  if (data.Category === "Project" && !data.ProjectType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Project Type is required for 'Project' category.",
      path: ["ProjectType"],
    });
  }
});

export type JobMaster = z.infer<typeof jobMasterSchema>;

export const artworkLogSchema = z.object({
  ArtworkID: z.number().optional(), // Auto-incremented, optional for insert
  JobID: z.string().optional().nullable(), // Made optional and nullable for 'Internal' category
  Category: z.string().min(1, { message: "Category is required." }),
  ArtworkType: z.string().min(1, { message: "Artwork Type is required." }),
  ArtworkTitle: z.string().min(1, { message: "Artwork Title is required." }),
  Designer: z.string().min(1, { message: "Designer is required." }),
  StartDate: z.date({ required_error: "Start Date is required." }),
  EndDate: z.date().optional().nullable(),
  TimeSpent: z.string().optional().nullable(), // Calculated, not stored directly
  RevisionCount: z.number().int().min(0).default(0).optional().nullable(),
  Notes: z.string().optional().nullable(),
  // New field for Internal tasks in ArtworkLog
  DeptRequester: z.string().optional().nullable(), // For 'Internal' category
});

export type ArtworkLog = z.infer<typeof artworkLogSchema>;

export const designerMasterSchema = z.object({
  DesignerID: z.string().min(1, { message: "Designer ID is required." }),
  DesignerName: z.string().min(1, { message: "Designer Name is required." }),
  Role: z.string().optional().nullable(),
  Status: z.string().optional().nullable(),
});

export type DesignerMaster = z.infer<typeof designerMasterSchema>;

export const artworkTypeMasterSchema = z.object({
  TypeName: z.string().min(1, { message: "Type Name is required." }),
  created_at: z.string().optional(), // Read-only, handled by Supabase
});

export type ArtworkTypeMaster = z.infer<typeof artworkTypeMasterSchema>;

export const leadSubmissionFormSchema = z.object({
  ClientName: z.string().min(1, { message: "Client Name is required." }),
  PIC_Requester: z.string().min(1, { message: "PIC Requester is required." }),
  LeadGrade: z.enum(["A", "B", "C", "D"], { required_error: "Lead Grade is required." }),
  CustomBrief: z.string().optional().nullable(),
  LinkOnedrive: z.string().optional().nullable(),
  JobTitle: z.string().min(1, { message: "Job Title is required." }),
});

export type LeadSubmissionForm = z.infer<typeof leadSubmissionFormSchema>;

export const projectTypeMasterSchema = z.object({
  id: z.string().uuid().optional(), // UUID, optional for insert
  type_name: z.string().min(1, { message: "Type Name is required." }).max(255, { message: "Type Name cannot exceed 255 characters." }),
  created_at: z.string().optional(), // Read-only, handled by Supabase
});

export type ProjectTypeMaster = z.infer<typeof projectTypeMasterSchema>;