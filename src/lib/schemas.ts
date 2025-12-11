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