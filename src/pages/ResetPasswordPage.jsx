import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, TerminalSquare, ShieldCheck, AlertTriangle } from "lucide-react"
import { useResetPassword } from "../hooks/useAuth"

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/(?=.*[a-zA-Z])(?=.*\d)/, "Must contain at least one letter and one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function ResetPasswordPage() {
  const { userId, token } = useParams()
  const navigate = useNavigate()
  const resetPassword = useResetPassword(userId, token)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const errorMessage =
    resetPassword.error?.response?.data?.message ||
    resetPassword.error?.message ||
    ""

  const isTokenError =
    errorMessage.toLowerCase().includes("invalid") ||
    errorMessage.toLowerCase().includes("expired")

  const onSubmit = async (values) => {
    try {
      await resetPassword.mutateAsync({ password: values.password })
      setSuccess(true)
      setTimeout(() => navigate("/login"), 3000)
    } catch {
      // error shown via errorMessage
    }
  }

  return (
    <div className="min-h-screen bg-base text-base font-sans selection:bg-[var(--primary-2)]/30 selection:text-[var(--primary-2)] flex items-center justify-center px-6 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[var(--primary-2)]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo */}
        <Link to="/" className="mb-8 inline-flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10 group-hover:bg-[var(--primary-2)]/20 transition-colors">
            <TerminalSquare size={15} className="text-[var(--primary-2)]" />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white/60 group-hover:text-white transition-colors">DevSync</span>
        </Link>

        <div className="rounded-[24px] border border-base bg-panel p-8 backdrop-blur-2xl shadow-2xl">

          {success ? (
            /* ── Success State ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10">
                <ShieldCheck size={28} className="text-[var(--primary-2)]" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Password Updated</h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/40">
                Your password has been reset successfully. Redirecting you to login...
              </p>
              <div className="mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="h-full bg-[var(--primary-2)]"
                />
              </div>
            </motion.div>
          ) : isTokenError ? (
            /* ── Invalid Token State ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <AlertTriangle size={28} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Link Expired</h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/40">
                This reset link is invalid or has expired. Reset links are valid for 15 minutes.
              </p>
              <Link
                to="/forgot-password"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[var(--primary-2)]/40 bg-panel-2 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)] hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 transition-all"
              >
                Request New Link <ArrowRight size={12} />
              </Link>
            </motion.div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary-2)] mb-3">[ NEW_PASSWORD ]</p>
                <h2 className="text-2xl font-bold tracking-tight text-white">Set New Password</h2>
                <p className="mt-2 font-mono text-xs text-white/40">
                  Choose a strong password for your DevSync account.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors"
                  />
                  {errors.password && (
                    <p className="mt-2 font-mono text-[10px] text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 font-mono text-[10px] text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {errorMessage && !isTokenError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetPassword.isPending}
                  className="group relative flex w-full h-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--primary-2)]/40 bg-panel-2 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)]">
                    {resetPassword.isPending ? "Updating..." : "Reset Password"}
                    {!resetPassword.isPending && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
