import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, TerminalSquare } from "lucide-react"
import { useLogin } from "../hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const terminalLines = [
  "establishing wss:// connection...",
  "locating active github signatures...",
  "mounting discovery engine...",
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()

  const from = location.state?.from?.pathname || "/app/feed"

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const errorMessage = login.error?.response?.data?.message || login.error?.message || ""

  const onSubmit = async (values) => {
    try {
      await login.mutateAsync(values)
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  return (
    <div className="min-h-screen bg-base text-base font-sans selection:bg-[var(--primary-2)]/30 selection:text-[var(--primary-2)]">
      <div className="grid min-h-screen xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Side: Obsidian Visuals */}
        <section className="relative hidden overflow-hidden border-r border-base bg-base xl:block">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-0 w-full h-[500px] bg-[var(--primary-2)]/10 blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

          <div className="relative z-10 flex h-full flex-col justify-between px-12 py-12">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10 group-hover:bg-[var(--primary-2)]/20 transition-colors">
                  <TerminalSquare size={16} className="text-[var(--primary-2)]" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--primary-2)]">DevSync</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-0.5">AUTH_NODE_01</p>
                </div>
              </Link>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "circ.out" }} className="mt-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary-2)]">
                  <ShieldCheck size={12} /> Secure Auth
                </div>
                <h1 className="mt-8 text-[clamp(2.5rem,4vw,4rem)] font-black leading-[0.9] tracking-tighter text-white">
                  ACCESS THE <br /> <span className="text-[var(--primary-2)]">NETWORK.</span>
                </h1>
                <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-white/40">
                  Authenticate your node. Resume real-time sockets, evaluate stack matches, and continue execution.
                </p>

                <div className="mt-12 space-y-3">
                  {terminalLines.map((line, index) => (
                    <motion.div key={line} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[var(--primary-2)]">➜</span>
                      <p className="font-mono text-xs text-white/40">{line}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Right Side: Dark Glass Form */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
          {/* Mobile Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-64 bg-[var(--primary-2)]/5 blur-[100px] xl:hidden pointer-events-none" />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-[440px] rounded-[24px] border border-base bg-panel p-8 backdrop-blur-2xl shadow-2xl">
            <div className="mb-10 xl:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <TerminalSquare size={20} className="text-[var(--primary-2)]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white">DevSync</span>
              </Link>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Boot Session.</h2>
              <p className="mt-2 text-sm font-mono text-white/40">Enter your credentials below to initialize.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div>
                <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Email Address</label>
                <input type="email" placeholder="developer@node.com" {...register("email")} className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors" />
                {errors.email && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40">Password</label>
                  <span className="font-mono text-[10px] text-[var(--primary-2)]">Required</span>
                </div>
                <input type="password" placeholder="••••••••" {...register("password")} className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors" />
                {errors.password && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.password.message}</p>}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
                  {errorMessage}
                </div>
              )}

              {/* DARK BUTTON REDESIGN */}
              <button type="submit" disabled={login.isPending} className="group relative flex w-full h-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--primary-2)]/40 bg-panel-2 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50">
                <span className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)]">
                  {login.isPending ? "Executing..." : "Authenticate"}
                  {!login.isPending && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                </span>
              </button>
            </form>

            <div className="mt-8 border-t border-white/[0.04] pt-6 text-center">
              <p className="font-mono text-xs text-white/30">
                Unregistered Node? <Link to="/register" className="font-bold text-[var(--primary-2)] hover:text-white transition-colors">Deploy Profile</Link>
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}