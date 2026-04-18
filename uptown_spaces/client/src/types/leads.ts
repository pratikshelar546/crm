export type LeadStatus = "NEW" | "CONTACTED" | "SITE_VISITED" | "CLOSED";

export type Lead = {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  budget: number;
  location: string;
  propertyType: string;
  leadSource: string;
  status: LeadStatus;
  comments?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ListLeadsResult = {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DashboardMetrics = {
  totalLeads: number;
  conversionRate: number;
  leadsBySource: { source: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
};
