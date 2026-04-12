import { useMemo, useRef, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ExternalLink, ImagePlus, Link as LinkIcon, Save, Sparkles, User2, Loader2, Cpu } from "lucide-react"
import { useConnections } from "../hooks/useConnections"
import { useGigFeed, useMyGigs } from "../hooks/useGigs"
import { useProfile, useUpdateProfile, useUploadProfilePhoto } from "../hooks/useProfile"
import { useParseResumeAI } from "../hooks/useAI"
import SkillInput from "../components/ui/SkillInput"
import Skeleton from "../components/ui/Skeleton"

const profileSchema = z.object({
  bio: z.string().max(500, "Bio cannot exceed 500 characters"),
  skills: z.array(z.string()).default([]),
  githubUrl: z.string().optional().or(z.literal("")),
})

function StatCard({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.04] bg-[#050505] p-6 transition-colors hover:border-[#12b3a8]/30 hover:bg-[#0a0a0a]">
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#12b3a8]/10 blur-xl" />
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/30">{label}</p>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-[#12b3a8]">{value}</p>
    </div>
  )
}

export default function ProfilePage() {
  const photoInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  const profileQuery = useProfile()
  const connectionsQuery = useConnections()
  const myGigsQuery = useMyGigs()
  const gigFeedQuery = useGigFeed()

  const updateProfile = useUpdateProfile()
  const uploadPhoto = useUploadProfilePhoto()
  const parseResumeAI = useParseResumeAI()

  const profile = profileQuery.data

  const stats = useMemo(() => ({
    connections: connectionsQuery.data?.length || 0,
    posted: myGigsQuery.data?.posted?.length || 0,
    applied: myGigsQuery.data?.applied?.length || 0,
    availableGigs: gigFeedQuery.data?.length || 0,
  }), [connectionsQuery.data, myGigsQuery.data, gigFeedQuery.data])

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      bio: profile?.bio || "",
      skills: profile?.skills || [],
      githubUrl: profile?.githubUrl || profile?.github || "",
    },
  })

  useEffect(() => {
    if (profile) reset({ bio: profile.bio || "", skills: profile.skills || [], githubUrl: profile.githubUrl || profile.github || "" })
  }, [profile, reset])

  const bioValue = watch("bio") || ""

  const onSubmit = async (values) => await updateProfile.mutateAsync(values)
  const onPhotoChange = async (e) => { if (e.target.files?.[0]) await uploadPhoto.mutateAsync(e.target.files[0]) }
  
  const onResumeChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") return alert("Please upload a PDF resume")
    try { await parseResumeAI.mutateAsync(file) } 
    catch (error) { console.error(error) } 
    finally { if (resumeInputRef.current) resumeInputRef.current.value = "" }
  }

  if (profileQuery.isLoading) return (
    <section className="px-8 pt-8 max-w-[1600px] mx-auto min-h-screen bg-[#000000]"><Skeleton className="h-[500px] rounded-[32px] bg-[#050505] border border-white/[0.04]" /></section>
  )

  return (
    <section className="page-shell px-4 pb-24 pt-8 md:px-8 max-w-[1600px] mx-auto relative min-h-screen bg-[#000000] text-white selection:bg-[#12b3a8]/30 selection:text-[#12b3a8]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 text-[#12b3a8] text-[10px] font-mono tracking-[0.2em] uppercase mb-4">
          <User2 size={14} />
          <span>[ SYS.PROFILE.CORE ]</span>
        </div>
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-[1.1] tracking-tighter text-white">
          CONFIGURE <span className="text-white/30">IDENTITY.</span>
        </h1>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Left Sidebar Profile View */}
        <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.04] bg-[#050505] p-8">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#12b3a8]/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute -inset-2 rounded-[32px] bg-[#12b3a8]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'D'}&background=111&color=fff`}
                  alt="Avatar"
                  className="relative h-28 w-28 rounded-[24px] object-cover ring-2 ring-[#000000] shadow-2xl"
                />
                <button onClick={() => photoInputRef.current?.click()} className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0a0a0a] text-white hover:border-[#12b3a8] hover:text-[#12b3a8] transition-colors shadow-lg">
                  <ImagePlus size={16} />
                </button>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              </div>

              <h2 className="mt-8 text-2xl font-bold tracking-tight text-white uppercase">{profile?.name}</h2>
              <p className="mt-1 font-mono text-[10px] tracking-widest text-white/30">{profile?.email}</p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {(profile?.skills || []).slice(0, 4).map((skill) => (
                  <span key={skill} className="rounded-md border border-[#12b3a8]/20 bg-[#12b3a8]/5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#12b3a8]">
                    {skill}
                  </span>
                ))}
              </div>

              {profile?.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="mt-8 flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-[#0a0a0a] font-mono text-[10px] font-bold uppercase tracking-widest text-white/60 hover:border-[#12b3a8]/50 hover:bg-[#12b3a8]/10 hover:text-white transition-all">
                  <ExternalLink size={14} /> GitHub Profile
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Links" value={stats.connections} />
            <StatCard label="Posted" value={stats.posted} />
            <StatCard label="Applied" value={stats.applied} />
            <StatCard label="Open" value={stats.availableGigs} />
          </div>
        </motion.aside>

        {/* Right Content Profile Editor */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.04] bg-[#050505] p-8 md:p-10">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white uppercase">Parameters.</h2>
                <p className="mt-2 font-mono text-[11px] text-white/40">Update your stack and bio to calibrate the matchmaking engine.</p>
              </div>

              <div className="shrink-0 relative group">
                <button onClick={() => resumeInputRef.current?.click()} disabled={parseResumeAI.isPending} className="relative flex h-12 items-center gap-3 rounded-xl border border-[#12b3a8]/30 bg-[#0a0a0a] px-6 transition-all hover:border-[#12b3a8] hover:bg-[#12b3a8]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50">
                  {parseResumeAI.isPending ? <Loader2 size={14} className="animate-spin text-[#12b3a8]" /> : <Cpu size={14} className="text-[#12b3a8]" />}
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#12b3a8]">
                    {parseResumeAI.isPending ? "Extracting..." : "Parse Resume PDF"}
                  </span>
                </button>
                <input ref={resumeInputRef} type="file" accept="application/pdf" className="hidden" onChange={onResumeChange} />
              </div>
            </div>

            {parseResumeAI.isError && (
              <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
                {parseResumeAI.error?.response?.data?.message || "Failed to parse resume."}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40">Professional Bio</label>
                  <span className="font-mono text-[10px] text-[#12b3a8]">{bioValue.length}/500</span>
                </div>
                <textarea {...register("bio")} rows={5} className="w-full resize-none rounded-xl border border-white/10 bg-[#0a0a0a] px-5 py-4 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#12b3a8]/50 focus:bg-[#12b3a8]/5 focus:outline-none transition-colors" />
                {errors.bio && <p className="mt-2 font-mono text-[10px] text-red-400">{errors.bio.message}</p>}
              </div>

              <div>
                <label className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-white/40">Tech Stack</label>
                <Controller name="skills" control={control} render={({ field }) => (
                  <SkillInput value={field.value} onChange={field.onChange} placeholder="Type framework/language and press Enter" />
                )} />
              </div>

              <div>
                <label className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-white/40">GitHub URL</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20"><LinkIcon size={14} /></span>
                  <input {...register("githubUrl")} className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-4 pl-12 pr-5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#12b3a8]/50 focus:bg-[#12b3a8]/5 focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-white/[0.04]">
                <button type="submit" disabled={updateProfile.isPending} className="group relative flex h-12 items-center justify-center overflow-hidden rounded-xl border border-[#12b3a8]/40 bg-[#0a0a0a] px-8 transition-all hover:border-[#12b3a8] hover:bg-[#12b3a8]/10 hover:shadow-[0_0_20px_rgba(18,179,168,0.2)] disabled:opacity-50">
                  <span className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-[#12b3a8]">
                    <Save size={14} />
                    {updateProfile.isPending ? "Writing..." : "Commit Changes"}
                  </span>
                </button>
              </div>
            </form>

          </div>
        </motion.div>
      </div>
    </section>
  )
}