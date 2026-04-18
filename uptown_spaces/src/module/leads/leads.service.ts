import type { Request } from "express";
import { Leads } from "./leads.schema.js";
import { Types } from "mongoose";
import type { ZodError } from "zod";
import { LEAD_STATUSES } from "./leads.constants.js";
import {
  appendNoteBodySchema,
  createLeadBodySchema,
  listLeadsQuerySchema,
} from "./leads.validation.js";
import type { ListLeadsQuery } from "./leads.validation.js";
import { firstQueryString } from "../../utility/query.util.js";

interface ILead {
  name: string;
  phoneNumber: string;
  email: string;
  budget: number;
  location: string;
  propertyType: string;
  leadSource: string;
  addedBy: Types.ObjectId;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isLeadStatus = (value: string): value is (typeof LEAD_STATUSES)[number] =>
  (LEAD_STATUSES as readonly string[]).includes(value);

const zodToHttpError = (error: ZodError) => ({
  statusCode: 400 as const,
  message: error.issues.map((i) => i.message).join("; "),
});

const parseLeadIdParam = (raw: unknown): string => {
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: "Invalid lead id" };
  }
  return id;
};

const insertLead = async ({
  name,
  phoneNumber,
  email,
  budget,
  location,
  propertyType,
  leadSource,
  addedBy,
}: ILead) => {
  const leadExist = await Leads.findOne({
    isDeleted: false,
    $or: [{ email: email.toLowerCase() }, { phoneNumber }],
  });
  if (leadExist) {
    throw { statusCode: 400, message: "Lead already exists" };
  }
  const lead = await Leads.create({
    name,
    phoneNumber,
    email: email.toLowerCase(),
    budget,
    location,
    propertyType,
    leadSource,
    addedBy,
  });
  return lead;
};

const listLeads = async (query: ListLeadsQuery) => {
  const filter: Record<string, unknown> = { isDeleted: false };

  const search = query.search?.trim();
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safe, $options: "i" } },
      { phoneNumber: { $regex: safe, $options: "i" } },
    ];
  }

  if (query.leadSource?.trim()) {
    filter.leadSource = query.leadSource.trim();
  }

  if (query.status) {
    filter.status = query.status;
  }

  const sortField = query.sortBy === "budget" ? "budget" : "createdAt";
  const sortDir = query.sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortField]: sortDir };

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Leads.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Leads.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};

export type DashboardMetrics = {
  totalLeads: number;
  conversionRate: number;
  leadsBySource: { source: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const base = { isDeleted: false };

  const [totalLeads, closedCount, bySourceRaw, byStatusRaw] = await Promise.all([
    Leads.countDocuments(base),
    Leads.countDocuments({ ...base, status: "CLOSED" }),
    Leads.aggregate<{ _id: string | null; count: number }>([
      { $match: base },
      { $group: { _id: "$leadSource", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Leads.aggregate<{ _id: string | null; count: number }>([
      { $match: base },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const conversionRate =
    totalLeads === 0 ? 0 : Math.round((closedCount / totalLeads) * 10000) / 100;

  return {
    totalLeads,
    conversionRate,
    leadsBySource: bySourceRaw.map((row) => ({
      source: row._id ?? "Unknown",
      count: row.count,
    })),
    statusDistribution: byStatusRaw.map((row) => ({
      status: row._id ?? "Unknown",
      count: row.count,
    })),
  };
};

const getById = async (id: string) => {
  const lead = await Leads.findOne({
    _id: new Types.ObjectId(id),
    isDeleted: false,
  });
  return lead;
};

export type UpdateLeadInput = {
  status?: string;
  comments?: string | string[];
  comment?: string;
};

const updateById = async (id: string, { status, comments, comment }: UpdateLeadInput) => {
  if (status !== undefined && !isLeadStatus(status)) {
    throw { statusCode: 400, message: `status must be one of: ${LEAD_STATUSES.join(", ")}` };
  }

  const commentsPayload =
    comments !== undefined ? comments : comment !== undefined ? comment : undefined;

  const $set: Record<string, unknown> = {};
  if (status !== undefined) $set.status = status;
  if (commentsPayload !== undefined) {
    $set.comments = Array.isArray(commentsPayload) ? commentsPayload : [commentsPayload];
  }

  if (Object.keys($set).length === 0) {
    throw {
      statusCode: 400,
      message: "Provide at least one of: status, comments, or comment",
    };
  }

  const lead = await Leads.findOneAndUpdate(
    { _id: new Types.ObjectId(id), isDeleted: false },
    { $set },
    { new: true, runValidators: true },
  );

  if (!lead) {
    throw { statusCode: 404, message: "Lead not found" };
  }

  return lead;
};

const appendNoteById = async (id: string, note: string) => {
  const lead = await Leads.findOneAndUpdate(
    { _id: new Types.ObjectId(id), isDeleted: false },
    { $push: { comments: note } },
    { new: true, runValidators: true },
  );

  if (!lead) {
    throw { statusCode: 404, message: "Lead not found" };
  }

  return lead;
};

const softDeleteById = async (id: string) => {
  const lead = await Leads.findOneAndUpdate(
    { _id: new Types.ObjectId(id), isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true },
  );

  if (!lead) {
    throw { statusCode: 404, message: "Lead not found" };
  }

  return lead;
};

/** Route-facing: validate body + user, then persist. */
export const createLead = async (body: unknown, userId: string | undefined) => {
  if (!userId) {
    throw { statusCode: 401, message: "Unauthorized user" };
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw { statusCode: 400, message: "Invalid user id in token" };
  }

  const parsed = createLeadBodySchema.safeParse(body);
  if (!parsed.success) {
    throw zodToHttpError(parsed.error);
  }

  return insertLead({
    ...parsed.data,
    addedBy: new Types.ObjectId(userId),
  });
};

/** Route-facing: validate query, then list. */
export const listLeadsFromQuery = async (query: Request["query"]) => {
  const parsed = listLeadsQuerySchema.safeParse({
    search: firstQueryString(query.search),
    leadSource: firstQueryString(query.leadSource),
    status: firstQueryString(query.status),
    sortBy: firstQueryString(query.sortBy),
    sortOrder: firstQueryString(query.sortOrder),
    page: firstQueryString(query.page),
    limit: firstQueryString(query.limit),
  });

  if (!parsed.success) {
    throw zodToHttpError(parsed.error);
  }

  return listLeads(parsed.data);
};

/** Route-facing: resolve id, load lead or 404. */
export const getLeadDetail = async (rawId: unknown) => {
  const id = parseLeadIdParam(rawId);
  const lead = await getById(id);
  if (!lead) {
    throw { statusCode: 404, message: "Lead not found" };
  }
  return lead;
};

/** Route-facing: resolve id + build update payload from body. */
export const updateLeadFromBody = (rawId: unknown, body: unknown) => {
  const id = parseLeadIdParam(rawId);
  const { status, comments, comment } = body as Record<string, unknown>;
  const payload: UpdateLeadInput = {};
  if (typeof status === "string") payload.status = status;
  if (comments !== undefined) payload.comments = comments as string | string[];
  if (typeof comment === "string") payload.comment = comment;

  return updateById(id, payload);
};

/** Route-facing: validate append body, then push note. */
export const appendNoteFromBody = (rawId: unknown, body: unknown) => {
  const id = parseLeadIdParam(rawId);
  const parsed = appendNoteBodySchema.safeParse(body);
  if (!parsed.success) {
    throw zodToHttpError(parsed.error);
  }
  return appendNoteById(id, parsed.data.note);
};

/** Route-facing: soft delete by route param. */
export const softDeleteLeadByParam = (rawId: unknown) => {
  const id = parseLeadIdParam(rawId);
  return softDeleteById(id);
};
