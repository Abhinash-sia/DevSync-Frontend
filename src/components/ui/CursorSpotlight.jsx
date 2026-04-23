import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  const springX = useSpring(mousePosition.x, { stiffness: 100, damping: 25, mass: 0.1 });
  const springY = useSpring(mousePosition.y, { stiffness: 100, damping: 25, mass: 0.1 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      springX.set(e.clientX - 250); // offset by half width (500/2)
      springY.set(e.clientY - 250);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [springX, springY]);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 mix-blend-screen"
      style={{ x: springX, y: springY }}
    >
      <div className="h-[500px] w-[500px] rounded-full bg-[var(--primary-2)] opacity-[0.06] blur-[100px]" />
    </motion.div>
  );
}
