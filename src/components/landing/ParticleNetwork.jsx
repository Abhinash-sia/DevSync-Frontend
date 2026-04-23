import { useEffect, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

export default function ParticleNetwork({ isDark }) {
  const [init, setInit] = useState(false);
  
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 z-[1] pointer-events-none mix-blend-screen"
      options={{
        background: { color: { value: "transparent" } },
        // Lowered from 60 to 30 for performance optimization on massive nodes limit
        fpsLimit: 30,
        particles: {
          color: { value: isDark ? "#12b3a8" : "#847cf2" },
          links: { color: isDark ? "#12b3a8" : "#847cf2", distance: 160, enable: true, opacity: isDark ? 0.2 : 0.15, width: 1 },
          move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 0.6, straight: false },
          // Density value reduced from 70 to 30 to radically improve frame times
          number: { density: { enable: true, area: 1000 }, value: 30 },
          opacity: { value: isDark ? 0.4 : 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } },
        },
        // Hard disabling retina detection saves an immediate 4x geometry processing multiplier on hi-DPI screens
        detectRetina: false,
      }}
    />
  );
}
