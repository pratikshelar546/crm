import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLead } from "../api/leads";
import { LEAD_SOURCES, PROPERTY_TYPES } from "../constants/leads";
import { getApiErrorMessage } from "../lib/http";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  phoneNumber: z
    .string()
    .trim()
    .min(5, "Phone must be at least 5 digits")
    .max(10, "Phone must be at most 10 digits")
    .regex(/^[0-9+\-\s()]+$/, "Use digits only"),
  email: z.string().trim().email("Invalid email"),
  budget: z.coerce.number().positive("Budget must be greater than 0"),
  location: z.string().trim().min(1, "Location is required").max(500),
  propertyType: z.string().min(1, "Select or enter property type"),
  leadSource: z.string().min(1, "Select or enter lead source"),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: Partial<FormValues> = {
  name: "",
  phoneNumber: "",
  email: "",
  budget: undefined,
  location: "",
  propertyType: "2 BHK",
  leadSource: "Facebook",
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewLeadModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, budget: undefined } as unknown as FormValues);
      setFormError(null);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      const phoneDigits = values.phoneNumber.replace(/\D/g, "").slice(-10);
      if (phoneDigits.length < 5) {
        setFormError("Enter a valid phone number (5–10 digits).");
        return;
      }
      const lead = await createLead({
        ...values,
        phoneNumber: phoneDigits,
      });
      onClose();
      navigate(`/leads/${lead._id}`);
    } catch (e) {
      setFormError(getApiErrorMessage(e));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 p-4 pt-[max(1rem,env(safe-area-inset-top))]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="my-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 pb-3 pt-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-slate-900">
              New lead
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">Add a prospect — fields match your API validation.</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-xl leading-none text-slate-600 hover:bg-slate-50"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="px-4 pb-4 pt-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError && (
            <div
              className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</span>
              <input type="text" autoComplete="name" className={inputClass} {...register("name")} />
              {errors.name && <span className="mt-0.5 block text-xs text-red-600">{errors.name.message}</span>}
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                className={inputClass}
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && (
                <span className="mt-0.5 block text-xs text-red-600">{errors.phoneNumber.message}</span>
              )}
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
              <input type="email" autoComplete="email" className={inputClass} {...register("email")} />
              {errors.email && (
                <span className="mt-0.5 block text-xs text-red-600">{errors.email.message}</span>
              )}
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget (₹)</span>
              <input type="number" min={1} step={1} className={inputClass} {...register("budget")} />
              {errors.budget && (
                <span className="mt-0.5 block text-xs text-red-600">{errors.budget.message}</span>
              )}
            </label>
            <label className="block text-left sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</span>
              <input type="text" className={inputClass} {...register("location")} />
              {errors.location && (
                <span className="mt-0.5 block text-xs text-red-600">{errors.location.message}</span>
              )}
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Property type</span>
              <select className={inputClass} {...register("propertyType")}>
                {PROPERTY_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.propertyType && (
                <span className="mt-0.5 block text-xs text-red-600">{errors.propertyType.message}</span>
              )}
            </label>
            <label className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lead source</span>
              <select className={inputClass} {...register("leadSource")}>
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.leadSource && (
                <span className="mt-0.5 block text-xs text-red-600">{errors.leadSource.message}</span>
              )}
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
