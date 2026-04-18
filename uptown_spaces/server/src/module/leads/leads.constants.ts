export const LEAD_STATUSES = ["NEW", "CONTACTED", "SITE_VISITED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
