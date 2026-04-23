import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Cpu, TerminalSquare } from "lucide-react"
import { useRegister } from "../hooks/useAuth"
import SkillInput from "../components/ui/SkillInput"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  skills: z.array(z.string()).default([]),
  github: z.string().optional().or(z.literal("")),
})

const points = [
  "Vectorize your tech stack identity.",
  "Bypass recruiters and swipe on pure code.",
  "Establish instant WebSocket tunnels.",
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useRegister()

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", skills: [], github: "" },
  })

  const errorMessage = registerUser.error?.response?.data?.message || registerUser.error?.message || ""

  const onSubmit = async (values) => {
    try {
      await registerUser.mutateAsync(values)
      navigate("/app/feed")
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  return (
    <div className="min-h-screen bg-base text-base font-sans selection:bg-[var(--primary-2)]/30 selection:text-[var(--primary-2)]">
      <div className="grid min-h-screen xl:grid-cols-[0.9fr_1.1fr]">
        
        {/* Left Side: Branding */}
        <section className="relative hidden overflow-hidden border-r border-base bg-base xl:block">
          <div className="absolute top-1/2 left-0 w-full h-[600px] -translate-y-1/2 bg-[var(--primary-2)]/5 blur-[150px] pointer-events-none" />
          
          <div className="relative z-10 flex h-full flex-col justify-between px-12 py-12">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/10 group-hover:bg-[var(--primary-2)]/20 transition-colors">
                  <TerminalSquare size={16} className="text-[var(--primary-2)]" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--primary-2)]">DevSync</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/30 mt-0.5">NEW_NODE_INIT</p>
                </div>
              </Link>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--primary-2)]">
                  <Cpu size={12} /> System Onboarding
                </div>
                <h1 className="mt-8 text-[clamp(2.5rem,4vw,4rem)] font-black leading-[0.9] tracking-tighter text-white">
                  INITIALIZE <br /> <span className="text-white/30">YOUR IDENTITY.</span>
                </h1>
                <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-white/40">
                  Build an identity evaluated entirely on execution. Input your stack, mount your GitHub, and enter the active pool.
                </p>

                <div className="mt-12 space-y-4">
                  {points.map((point, index) => (
                    <motion.div key={point} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }} className="flex items-start gap-4 rounded-xl border border-base bg-panel-2 p-4">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary-2)] shadow-[0_0_8px_rgba(18,179,168,0.8)]" />
                      <p className="font-mono text-xs leading-relaxed text-white/50">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Right Side: Registration Form */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-[500px] rounded-[24px] border border-base bg-panel p-8 backdrop-blur-2xl shadow-2xl">
            <div className="mb-10 xl:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <TerminalSquare size={20} className="text-[var(--primary-2)]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-white">DevSync</span>
              </Link>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Deploy Node.</h2>
              <p className="mt-2 text-sm font-mono text-white/40">Configure your access parameters.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Alias / Name</label>
                <input {...register("name")} placeholder="System Administrator" className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors" />
                {errors.name && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.name.message}</p>}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Email</label>
                  <input type="email" {...register("email")} placeholder="dev@node.com" className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors" />
                  {errors.email && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Password</label>
                  <input type="password" {...register("password")} placeholder="••••••••" className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors" />
                  {errors.password && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.password.message}</p>}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Tech Stack</label>
                <Controller name="skills" control={control} render={({ field }) => (
                  <SkillInput value={field.value} onChange={field.onChange} placeholder="React, Node, etc..." />
                )} />
              </div>

              <div>
                <label className="block mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">GitHub URL</label>
                <input {...register("github")} placeholder="github.com/username" className="w-full rounded-xl border border-base bg-panel-2 px-4 py-3.5 text-sm text-base placeholder:text-dim focus:border-[var(--primary-2)]/50 focus:bg-[var(--primary-2)]/5 focus:outline-none transition-colors" />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
                  {errorMessage}
                </div>
              )}

              {/* DARK BUTTON REDESIGN */}
              <button type="submit" disabled={registerUser.isPending} className="group relative mt-2 flex w-full h-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--primary-2)]/40 bg-panel-2 transition-all hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50">
                <span className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)]">
                  {registerUser.isPending ? "Executing..." : "Create Account"}
                  {!registerUser.isPending && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
                </span>
              </button>
            </form>
            
            <div className="mt-6 border-t border-white/[0.04] pt-5 text-center">
              <p className="font-mono text-xs text-white/30">
                Already registered? <Link to="/login" className="font-bold text-[var(--primary-2)] hover:text-white transition-colors">Initiate Login</Link>
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}