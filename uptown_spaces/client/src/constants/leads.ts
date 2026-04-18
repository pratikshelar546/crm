import type { LeadStatus } from "../types/leads";

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "SITE_VISITED", "CLOSED"];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISITED: "Site Visit",
  CLOSED: "Closed",
};

export const LEAD_SOURCES = [
  "Facebook",
  "Google",
  "Referral",
  "Walk-in",
  "Instagram",
  "Other",
] as const;

export const PROPERTY_TYPES = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "Plot",
  "Villa",
  "Commercial",
  "Other",
] as const;
