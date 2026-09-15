'use client';

import { motion } from 'framer-motion';

interface Orb {
  size: number;
  top: string;
  left: string;
  duration: number;
  delay?: number;
  hue: 'red' | 'cyan';
}

// Hugs corners/edges and stays clear of the centered content column so it
// never sits on top of headlines or form fields.
const DEFAULT_ORBS: Orb[] = [
  { size: 320, top: '-8%', left: '-6%', duration: 14, hue: 'red' },
  { size: 260, top: '55%', left: '-10%', duration: 17, hue: 'cyan', delay: 1.4 },
  { size: 300, top: '-4%', left: '78%', duration: 16, hue: 'cyan', delay: 0.6 },
  { size: 240, top: '68%', left: '85%', duration: 13, hue: 'red', delay: 2 },
];

/**
 * Decorative, theme-aware ambient glow — a lightweight CSS/Framer Motion
 * stand-in for a 3D particle field (no react-three-fiber in this project
 * yet). Purely visual: absolutely positioned, non-interactive, heavily
 * blurred so it reads as soft atmosphere rather than solid shapes, and
 * invisible in light mode so it never competes with page content.
 *
 * Mount as the first child of a `relative overflow-hidden` wrapper.
 */
export function AmbientOrbs({ orbs = DEFAULT_ORBS }: { orbs?: Orb[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block overflow-hidden" aria-hidden>
      {orbs.map((orb, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full blur-[90px]"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background:
              orb.hue === 'red'
                ? 'radial-gradient(circle, rgba(255,60,90,0.35), rgba(190,15,45,0.12) 55%, transparent 75%)'
                : 'radial-gradient(circle, rgba(80,220,255,0.28), rgba(20,120,150,0.1) 55%, transparent 75%)',
          }}
          animate={{ y: [0, -24, 0], x: [0, 14, 0] }}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: orb.delay ?? 0 }}
        />
      ))}
    </div>
  );
}
