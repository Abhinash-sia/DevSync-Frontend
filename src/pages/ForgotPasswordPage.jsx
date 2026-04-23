import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, TerminalSquare, MailCheck } from "lucide-react"
import { useForgotPassword } from "../hooks/useAuth"

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  const errorMessage =
    forgotPassword.error?.response?.data?.message ||
    forgotPassword.error?.message ||
    ""

  const onSubmit = async (values) => {
    try {
      await forgotPassword.mutateAsync(values)
      setSubmitted(true)
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

          {submitted ? (
            /* ── Success State ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10">
                <MailCheck size={28} className="text-[var(--primary-2)]" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Check your inbox</h2>
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/40">
                If that email is registered, a reset link has been sent. The link expires in{" "}
                <span className="text-[var(--primary-2)]">15 minutes</span>.
              </p>
              <p className="mt-2 font-mono text-[10px] text-white/25">
                Check your spam folder if you don't see it.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--primary-2)] hover:text-white transition-colors"
              >
                <ArrowLeft size={12} /> Back to Login
              </Link>
            </motion.div>
          ) : (
            /* ── Form State ── */
            <>
              <div className="mb-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary-2)] mb-3">[ PASSWORD_RESET ]</p>
                <h2 className="text-2xl font-bold tracking-tight text-white">Forgot Password?</h2>
                <p className="mt-2 font-mono text-xs text-white/40 leading-relaxed">
                  Enter your email and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="developer@node.com"
                    {...register("email")}
                    className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-2 font-mono text-[10px] text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotPassword.isPending}
                  className="group relative flex w-full h-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--primary-2)]/40 bg-panel-2 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)]">
                    {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
                    {!forgotPassword.isPending && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                  </span>
                </button>
              </form>

              <div className="mt-6 border-t border-white/[0.04] pt-5 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 font-mono text-[10px] text-white/30 hover:text-[var(--primary-2)] transition-colors"
                >
                  <ArrowLeft size={11} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
