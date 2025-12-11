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