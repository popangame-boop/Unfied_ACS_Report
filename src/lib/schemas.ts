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
  ProjectType: z.string().optional().nullable(), // New field
  PIC_Project: z.string().optional().nullable(), // New field
  LeadGrade: z.string().optional().nullable(),   // New field
}).superRefine((data, ctx) => {
  if (data.Category === "Project") {
    if (!data.ProjectType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project Type is required for 'Project' category.",
        path: ["ProjectType"],
      });
    }
    if (!data.PIC_Project) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIC Project is required for 'Project' category.",
        path: ["PIC_Project"],
      });
    }
    if (!data.RequesterDepartment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Requester Department is required for 'Project' category.",
        path: ["RequesterDepartment"],
      });
    }
  } else if (data.Category === "Lead") {
    if (data.RequesterDepartment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Requester Department should not be set for 'Lead' category.",
        path: ["RequesterDepartment"],
      });
    }
    if (!data.LeadGrade) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lead Grade is required for 'Lead' category.",
        path: ["LeadGrade"],
      });
    }
    if (!data.PIC_Requester) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIC Requester is required for 'Lead' category.",
        path: ["PIC_Requester"],
      });
    }
  } else if (data.Category === "Internal") {
    if (!data.RequesterDepartment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Requester Department is required for 'Internal' category.",
        path: ["RequesterDepartment"],
      });
    }
  }
});

export type JobMaster = z.infer<typeof jobMasterSchema>;

export const artworkLogSchema = z.object({
  ArtworkID: z.number().optional(), // Auto-incremented, optional for insert
  JobID: z.string().min(1, { message: "Job ID is required." }),
  Category: z.string().min(1, { message: "Category is required." }),
  ArtworkType: z.string().min(1, { message: "Artwork Type is required." }),
  ArtworkTitle: z.string().min(1, { message: "Artwork Title is required." }),
  Designer: z.string().min(1, { message: "Designer is required." }),
  StartDate: z.date({ required_error: "Start Date is required." }),
  EndDate: z.date().optional().nullable(),
  TimeSpent: z.string().optional().nullable(), // Calculated, not stored directly
  RevisionCount: z.number().int().min(0).default(0).optional().nullable(),
  Notes: z.string().optional().nullable(),
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