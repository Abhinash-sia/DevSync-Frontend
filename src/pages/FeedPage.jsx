import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, Keyboard, Users } from "lucide-react";
import { useSwipe, useFeed } from "../hooks/useFeed";
import SwipeStack from "../components/swipe/SwipeStack";
import MatchAnimation from "../components/swipe/MatchAnimation";
import Skeleton from "../components/ui/Skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } },
};

function FeedSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md relative"
    >
      <div className="absolute -inset-1 rounded-[24px] bg-[#12b3a8]/10 blur-[40px] opacity-50" />
      <Skeleton className="h-[70svh] w-full rounded-[24px] border border-white/[0.04] bg-[#050505] relative z-10" />
    </motion.div>
  );
}

export default function FeedPage() {
  const feed = useFeed();
  const swipe = useSwipe();
  const [deck, setDeck] = useState([]);

  const incomingUsers = useMemo(() => {
    const data = feed.data || [];
    return Array.isArray(data) ? data.filter(Boolean) : [];
  }, [feed.data]);

  useEffect(() => {
    if (!incomingUsers.length) return;
    setDeck((prev) => {
      const seen = new Map(prev.map((item) => [item._id, item]));
      incomingUsers.forEach((item) => {
        if (item?._id) seen.set(item._id, item);
      });
      return Array.from(seen.values());
    });
  }, [incomingUsers]);

  // ✅ useCallback so keyboard effect always gets the latest handleAction
  const handleAction = useCallback(
    async (profile, action) => {
      if (!profile?._id) return;

      setDeck((prev) => {
        const next = prev.filter((item) => item._id !== profile._id);
        // ✅ Refetch inside setter so we read the real next length, not stale closure
        if (next.length <= 3 && !feed.isFetching) {
          feed.refetch();
        }
        return next;
      });

      try {
        await swipe.mutateAsync({ targetUserId: profile._id, action });
      } catch (error) {
        console.error("Swipe failed", error);
      }
    },
    [swipe, feed],
  );

  // ✅ handleAction in deps — no more stale closure on keyboard events
  useEffect(() => {
    const onKeyDown = async (event) => {
      const top = deck[0];
      if (!top) return;

      const key = event.key.toLowerCase();
      if (event.key === "ArrowRight" || key === "k") {
        await handleAction(top, "like");
      }
      if (event.key === "ArrowLeft" || key === "j") {
        await handleAction(top, "pass");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deck, handleAction]);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="relative min-h-screen bg-[#000000] px-4 pb-24 pt-8 md:px-8 max-w-7xl mx-auto text-white"
    >
      {/* Header Area */}
      <motion.div
        variants={fadeUp}
        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-[#12b3a8] text-[10px] font-mono tracking-[0.2em] uppercase mb-4">
            <Terminal size={14} />
            <span>[ SYS.DISCOVERY.NODE ]</span>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black leading-[1.1] tracking-tighter text-white">
            EVALUATE <br className="hidden md:block" />
            <span className="text-white/30">CANDIDATES.</span>
          </h1>
        </div>

        <div className="flex h-12 items-center gap-3 rounded-xl border border-white/[0.04] bg-[#050505] px-6">
          <div className="h-1.5 w-1.5 rounded-full bg-[#12b3a8] animate-pulse shadow-[0_0_8px_rgba(18,179,168,0.8)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/50">
            Scanning Network
          </span>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid gap-8 xl:grid-cols-[1fr_380px] xl:items-start">
        {/* Left Side: The Card Stack */}
        <motion.div
          variants={fadeUp}
          className="relative w-full max-w-[500px] mx-auto xl:mx-0"
        >
          {feed.isLoading ? (
            <FeedSkeleton />
          ) : deck.length > 0 ? (
            <AnimatePresence>
              <SwipeStack profiles={deck} onAction={handleAction} />
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-[24px] border border-white/[0.04] bg-[#050505] p-10 text-center shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#12b3a8]/5 to-transparent pointer-events-none" />
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.04] bg-[#0a0a0a] text-white/20 mb-6">
                <Users size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                End of Queue.
              </h2>
              <p className="mt-4 font-mono text-xs leading-relaxed text-white/40 max-w-xs mx-auto">
                No new signals detected in the current algorithm pass. Check
                back later to reset visibility.
              </p>
              <button
                onClick={() => feed.refetch()}
                className="mt-8 rounded-xl border border-[#12b3a8]/30 bg-[#0a0a0a] px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#12b3a8] transition-all hover:border-[#12b3a8] hover:bg-[#12b3a8]/10 hover:shadow-[inset_0_0_15px_rgba(18,179,168,0.2)]"
              >
                Execute Re-Scan
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Right Side: Keyboard Shortcuts & Insights */}
        <motion.aside
          variants={fadeUp}
          className="hidden xl:flex flex-col gap-6"
        >
          <div className="rounded-[24px] border border-white/[0.04] bg-[#050505] p-8">
            <div className="flex items-center gap-2 text-[#12b3a8] text-[10px] font-mono tracking-[0.2em] uppercase mb-8">
              <Keyboard size={14} />
              <span>[ CONTROL_MAPPING ]</span>
            </div>

            <div className="space-y-4">
              <div className="group/btn flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#0a0a0a] px-5 py-4 transition hover:border-[#12b3a8]/50">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/60">
                  Connect
                </span>
                <div className="flex gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-[#000000] text-[10px] font-mono text-white/30 group-hover/btn:border-[#12b3a8]/40 group-hover/btn:text-[#12b3a8] transition-colors">
                    K
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-[#000000] text-[10px] font-mono text-white/30 group-hover/btn:border-[#12b3a8]/40 group-hover/btn:text-[#12b3a8] transition-colors">
                    →
                  </span>
                </div>
              </div>
              <div className="group/btn flex items-center justify-between rounded-xl border border-white/[0.04] bg-[#0a0a0a] px-5 py-4 transition hover:border-red-500/30">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/60">
                  Reject
                </span>
                <div className="flex gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-[#000000] text-[10px] font-mono text-white/30 group-hover/btn:border-red-500/40 group-hover/btn:text-red-400 transition-colors">
                    J
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-white/10 bg-[#000000] text-[10px] font-mono text-white/30 group-hover/btn:border-red-500/40 group-hover/btn:text-red-400 transition-colors">
                    ←
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Hint Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-[#12b3a8]/20 bg-[#050505] p-8">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#12b3a8]/10 blur-[50px]" />
            <div className="flex items-center gap-2 text-[#12b3a8] text-[10px] font-mono tracking-[0.2em] uppercase mb-4 relative z-10">
              <Cpu size={14} />
              <span>[ AI_TELEMETRY ]</span>
            </div>
            <p className="font-mono text-xs leading-relaxed text-white/50 relative z-10">
              The engine prioritizes nodes with complementary architectures.{" "}
              <strong className="text-white">
                Connecting with missing dependencies yields a 34% higher project
                completion rate.
              </strong>
            </p>
          </div>
        </motion.aside>
      </div>

      <MatchAnimation />
    </motion.section>
  );
}

