import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import MobileNav from "./MobileNav"
import { useConnectionsRealtime } from "../../hooks/useConnections"
import GigApplicationToast from "../gigs/GigApplicationToast"

export default function AppShell() {
  // Keeps your realtime hook perfectly intact
  useConnectionsRealtime?.()

  return (
    <div className="relative min-h-screen bg-[#070909] text-white selection:bg-[#12b3a8]/30 selection:text-[#8ee7df] overflow-hidden">
      
      {/* Ambient Cyber Glow Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-[#12b3a8] blur-[140px] opacity-20 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Main Layout Wrapper */}
      <div className="relative z-10 mx-auto flex max-w-[1600px] shadow-2xl shadow-black/50">
        <Sidebar />

        <div className="min-h-screen flex-1 flex flex-col border-l border-white/[0.04] bg-white/[0.01] backdrop-blur-3xl">
          <Navbar />

          <main className="flex-1 pb-24 xl:pb-0 relative">
            <Outlet />
          </main>
        </div>
      </div>

      <MobileNav />

      {/* Global gig-application notification toasts */}
      <GigApplicationToast />
    </div>
  )
}