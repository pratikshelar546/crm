import { z } from "zod";
import { LEAD_STATUSES } from "./leads.constants.js";

const statusEnum = z.enum(LEAD_STATUSES);

export const createLeadBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  phoneNumber: z.string().trim().min(5, "Phone number is required").max(10),
  email: z.string().trim().email("Invalid email"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  location: z.string().trim().min(1, "Location is required").max(500),
  propertyType: z.string().trim().min(1, "Property type is required").max(100),
  leadSource: z.string().trim().min(1, "Lead source is required").max(100),
});

export type CreateLeadBody = z.infer<typeof createLeadBodySchema>;

export const listLeadsQuerySchema = z.object({
  search: z.string().optional(),
  leadSource: z.string().optional(),
  status: statusEnum.optional(),
  sortBy: z.enum(["date", "budget"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const appendNoteBodySchema = z.object({
  note: z.string().trim().min(1, "note is required").max(5000),
});
