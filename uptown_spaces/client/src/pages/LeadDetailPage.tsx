import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  appendNote,
  deleteLead,
  fetchLead,
  updateLeadStatus,
} from "../api/leads";
import { LEAD_STATUSES, STATUS_LABELS } from "../constants/leads";
import type { Lead, LeadStatus } from "../types/leads";
import { getApiErrorMessage } from "../lib/http";

const noteSchema = z.object({
  note: z.string().trim().min(1, "Enter a note").max(5000),
});

type NoteForm = z.infer<typeof noteSchema>;

function statusChipColor(status: LeadStatus): "default" | "primary" | "secondary" | "success" | "warning" | "info" {
  switch (status) {
    case "CLOSED":
      return "success";
    case "CONTACTED":
      return "info";
    case "SITE_VISITED":
      return "warning";
    default:
      return "primary";
  }
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium text-slate-900 sm:text-left">{value}</span>
    </div>
  );
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteForm>({ resolver: zodResolver(noteSchema) });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchLead(id);
        if (!cancelled) setLead(data);
      } catch (e) {
        if (!cancelled) setLoadError(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onStatusChange = async (next: LeadStatus) => {
    if (!id || !lead || next === lead.status) return;
    setActionError(null);
    setStatusSaving(true);
    try {
      const updated = await updateLeadStatus(id, next);
      setLead(updated);
    } catch (e) {
      setActionError(getApiErrorMessage(e));
    } finally {
      setStatusSaving(false);
    }
  };

  const onAddNote = async (values: NoteForm) => {
    if (!id) return;
    setActionError(null);
    try {
      const updated = await appendNote(id, values.note);
      setLead(updated);
      reset({ note: "" });
    } catch (e) {
      setActionError(getApiErrorMessage(e));
    }
  };

  const onDelete = async () => {
    if (!id || !lead) return;
    if (!window.confirm(`Delete lead “${lead.name}”? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await deleteLead(id);
      navigate("/leads", { replace: true });
    } catch (e) {
      setActionError(getApiErrorMessage(e));
    }
  };

  if (!id) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Invalid lead.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <CircularProgress size={36} thickness={4} />
        <p className="text-sm text-slate-500">Loading lead…</p>
      </div>
    );
  }

  if (loadError || !lead) {
    return (
      <div className="flex max-w-lg flex-col gap-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError ?? "Lead not found."}
        </div>
        <Button component={Link} to="/leads" variant="outlined" size="large">
          Back to leads
        </Button>
      </div>
    );
  }

  const comments = lead.comments ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Box
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        sx={{ borderLeft: "4px solid", borderLeftColor: "primary.main" }}
      >
        <div className="bg-gradient-to-br from-blue-50/90 via-white to-slate-50/80 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant="h4" component="h1" className="!font-bold !tracking-tight !text-slate-900">
                  {lead.name}
                </Typography>
                <Chip
                  label={STATUS_LABELS[lead.status]}
                  color={statusChipColor(lead.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </div>
              <Typography variant="body2" color="text.secondary">
                Created {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "—"}
                {lead.updatedAt ? ` · Updated ${new Date(lead.updatedAt).toLocaleString()}` : ""}
              </Typography>
            </div>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Button component={Link} to="/leads" variant="outlined" color="inherit">
                All leads
              </Button>
              <Button variant="outlined" color="error" onClick={onDelete}>
                Delete
              </Button>
            </Stack>
          </div>
        </div>
      </Box>

      {actionError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {actionError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Details */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <Typography variant="subtitle1" className="!mb-4 !font-semibold !text-slate-900">
            Lead details
          </Typography>
          <div className="rounded-lg bg-slate-50/80 px-4 py-1">
            <DetailRow label="Phone" value={lead.phoneNumber} />
            <DetailRow label="Email" value={lead.email} />
            <DetailRow label="Budget" value={`₹${lead.budget.toLocaleString()}`} />
            <DetailRow label="Location" value={lead.location} />
            <DetailRow label="Property type" value={lead.propertyType} />
            <DetailRow label="Source" value={lead.leadSource} />
          </div>

          <Divider className="!my-5" />

          <FormControl fullWidth size="small" disabled={statusSaving}>
            <InputLabel id="lead-status-label">Pipeline status</InputLabel>
            <Select
              labelId="lead-status-label"
              id="lead-status"
              label="Pipeline status"
              value={lead.status}
              onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
            >
              {LEAD_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {statusSaving && (
            <Typography variant="caption" color="text.secondary" className="!mt-1 !block">
              Saving…
            </Typography>
          )}
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <Typography variant="subtitle1" className="!mb-4 !font-semibold !text-slate-900">
            Notes
          </Typography>

          <form className="mb-6" onSubmit={handleSubmit(onAddNote)}>
            <TextField
              {...register("note")}
              fullWidth
              multiline
              minRows={3}
              placeholder="Call summary, follow-up, site visit feedback…"
              label="Add a note"
              error={Boolean(errors.note)}
              helperText={errors.note?.message}
              slotProps={{ htmlInput: { maxLength: 5000 } }}
            />
            <Button type="submit" variant="contained" className="!mt-3" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add note"}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" className="!mb-3 !block uppercase tracking-wide">
            History ({comments.length})
          </Typography>

          {comments.length === 0 ? (
            <Box
              className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center"
              sx={{ borderRadius: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                No notes yet. Add one above to build a timeline.
              </Typography>
            </Box>
          ) : (
            <ul className="space-y-3">
              {[...comments].reverse().map((c, i) => (
                <li
                  key={`${comments.length - i}-${c.slice(0, 16)}`}
                  className="relative rounded-lg border border-slate-100 bg-slate-50/90 pl-4 pr-3 py-3 text-sm text-slate-800 shadow-sm before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-lg before:bg-blue-500 before:content-['']"
                >
                  <span className="whitespace-pre-wrap">{c}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
