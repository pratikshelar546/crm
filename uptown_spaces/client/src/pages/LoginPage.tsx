import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/http";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const registered = Boolean((location.state as { registered?: boolean } | null)?.registered);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (e) {
      setFormError(getApiErrorMessage(e));
    }
  };

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Use your account to manage real-estate leads.</p>
        {registered && (
          <div
            className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            Account created. Sign in with your email and password.
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {formError && (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </div>
          )}
          <label className="block text-left">
            <span className="text-sm font-medium text-slate-800">Email</span>
            <input type="email" autoComplete="email" className={inputClass} {...register("email")} />
            {errors.email && <span className="mt-0.5 block text-xs text-red-600">{errors.email.message}</span>}
          </label>
          <label className="block text-left">
            <span className="text-sm font-medium text-slate-800">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              {...register("password")}
            />
            {errors.password && (
              <span className="mt-0.5 block text-xs text-red-600">{errors.password.message}</span>
            )}
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-700 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/signup" className="font-medium text-blue-700 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
