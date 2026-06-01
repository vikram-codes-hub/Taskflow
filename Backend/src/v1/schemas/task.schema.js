import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  assignedTo: z.number().int().positive("assignedTo must be a valid user ID"),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  assignedTo: z.number().int().positive().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"], {
    required_error: "Status is required",
  }),
});