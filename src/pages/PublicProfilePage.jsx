import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ExternalLink, MapPin, User, MessageSquare, Check, ArrowLeft, Loader2, Send, Clock } from "lucide-react"
import { usePublicProfile } from "../hooks/useProfile"
import { useMatchStatus } from "../hooks/useMatchStatus"
import { useSwipe } from "../hooks/useFeed"
import { useQueryClient } from "@tanstack/react-query"
import Skeleton from "../components/ui/Skeleton"

export default function PublicProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = usePublicProfile(userId)
  const { data: matchData, isLoading: matchLoading } = useMatchStatus(userId)
  const swipeMutation = useSwipe()
  const queryClient = useQueryClient()

  const handleConnect = async () => {
    await swipeMutation.mutateAsync({ targetUserId: userId, action: "interested" })
    queryClient.invalidateQueries({ queryKey: ["matchStatus", userId] })
  }

  if (isLoading) {
    return (
      <section className="page-shell px-4 pb-24 pt-8 md:px-8 max-w-[900px] mx-auto min-h-screen bg-base">
        <Skeleton className="h-[500px] rounded-[32px] bg-panel border border-base" />
      </section>
    )
  }

  if (isError || !user) {
    return (
      <section className="page-shell flex h-[80vh] items-center justify-center bg-base">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Node Not Found</h2>
          <button onClick={() => navigate(-1)} className="font-mono text-sm tracking-widest uppercase text-[var(--primary-2)] hover:text-white transition-colors">
            Return to Feed
          </button>
        </div>
      </section>
    )
  }

  const renderActionButton = () => {
    if (matchLoading) return <Loader2 size={16} className="animate-spin text-[var(--primary-2)]" />;
    if (!matchData) return null;

    const { status, roomId } = matchData;

    switch (status) {
      case "matched":
        return (
          <Link to={`/app/chat/${roomId}`} className="flex h-12 items-center gap-2 rounded-xl border border-[var(--primary-2)] bg-[var(--primary-2)]/10 px-8 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)] transition-all hover:bg-[var(--primary-2)]/20 hover:shadow-[0_0_20px_rgba(18,179,168,0.3)]">
            <MessageSquare size={16} /> Send Message
          </Link>
        )
      case "pending_them":
        return (
          <button disabled className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 font-mono text-xs font-bold uppercase tracking-widest text-white/50 cursor-not-allowed">
            <Check size={16} /> Request Sent
          </button>
        )
      case "pending_me":
        return (
          <button onClick={handleConnect} disabled={swipeMutation.isPending} className="flex h-12 items-center gap-2 rounded-xl border border-[var(--primary-2)] bg-[var(--primary-2)]/10 px-8 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)] transition-all hover:bg-[var(--primary-2)]/20 hover:shadow-[0_0_20px_rgba(18,179,168,0.3)] disabled:opacity-50">
            {swipeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
            Accept Connection
          </button>
        )
      case "none":
      default:
        return (
          <button onClick={handleConnect} disabled={swipeMutation.isPending} className="flex h-12 items-center gap-2 rounded-xl border border-[var(--primary-2)] bg-[var(--primary-2)]/10 px-8 font-mono text-xs font-bold uppercase tracking-widest text-[var(--primary-2)] transition-all hover:bg-[var(--primary-2)]/20 hover:shadow-[0_0_20px_rgba(18,179,168,0.3)] disabled:opacity-50">
            {swipeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Connect
          </button>
        )
    }
  }

  return (
    <section className="page-shell px-4 pb-24 pt-8 md:px-8 max-w-[900px] mx-auto relative min-h-screen bg-base text-base selection:bg-[var(--primary-2)]/30 selection:text-[var(--primary-2)]">
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
        <ArrowLeft size={14} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="relative overflow-hidden rounded-[32px] border border-base bg-panel p-8 md:p-12">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[var(--primary-2)]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <img
              src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}&background=111&color=fff`}
              alt={user.name}
              className="relative h-32 w-32 rounded-[32px] object-cover ring-4 ring-[#111111] shadow-2xl"
            />

            <h1 className="mt-8 text-4xl font-black tracking-tight text-white uppercase">{user.name}</h1>
            
            <div className="mt-4 flex flex-wrap justify-center gap-4 font-mono text-[11px] uppercase tracking-widest text-dim">
              {user.location && (
                <div className="flex items-center gap-1.5"><MapPin size={12} /> {user.location}</div>
              )}
              {user.createdAt ? (
                <div className="flex items-center gap-1.5">
                  <Clock size={12} /> 
                  Joined: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex justify-center w-full">
              {renderActionButton()}
            </div>

            <div className="mt-12 w-full max-w-2xl text-left">
              <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-2">About Node</h3>
              <p className="font-mono text-sm leading-relaxed text-soft whitespace-pre-wrap">
                {user.bio || "No description provided."}
              </p>
            </div>

            {user.skills?.length > 0 && (
              <div className="mt-8 w-full max-w-2xl text-left">
                <h3 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30 border-b border-white/5 pb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => (
                    <span key={skill} className="rounded-md border border-[var(--primary-2)]/20 bg-[var(--primary-2)]/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--primary-2)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.githubUrl && (
              <div className="mt-12 w-full max-w-2xl">
                <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border border-base bg-panel-2 py-4 font-mono text-xs font-bold uppercase tracking-widest text-soft hover:border-[var(--primary-2)] hover:text-[#fff] transition-all">
                  <ExternalLink size={14} /> Open GitHub Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
