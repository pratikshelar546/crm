import { http, unwrapData } from "../lib/http";
import type { DashboardMetrics, Lead, ListLeadsResult } from "../types/leads";
import type { LeadStatus } from "../types/leads";

export type ListLeadsParams = {
  search?: string;
  leadSource?: string;
  status?: LeadStatus;
  sortBy?: "date" | "budget";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const { data } = await http.get<{ data: DashboardMetrics }>("/leads/dashboard");
  return unwrapData(data);
}

export async function fetchLeads(params: ListLeadsParams): Promise<ListLeadsResult> {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );
  const { data } = await http.get<{ data: ListLeadsResult }>("/leads", { params: clean });
  return unwrapData(data);
}

export async function fetchLead(id: string): Promise<Lead> {
  const { data } = await http.get<{ data: Lead }>(`/leads/${id}`);
  return unwrapData(data);
}

export type CreateLeadBody = {
  name: string;
  phoneNumber: string;
  email: string;
  budget: number;
  location: string;
  propertyType: string;
  leadSource: string;
};

export async function createLead(body: CreateLeadBody): Promise<Lead> {
  const { data } = await http.post<{ data: Lead }>("/leads/create", body);
  return unwrapData(data);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const { data } = await http.put<{ data: Lead }>(`/leads/${id}`, { status });
  return unwrapData(data);
}

export async function appendNote(id: string, note: string): Promise<Lead> {
  const { data } = await http.post<{ data: Lead }>(`/leads/${id}/notes`, { note });
  return unwrapData(data);
}

export async function deleteLead(id: string): Promise<void> {
  await http.delete(`/leads/${id}`);
}
