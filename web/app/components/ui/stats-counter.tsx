"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Music4 } from "lucide-react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const duration = 2000;
    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      // Use easeOut cubic easing for a smoother finish
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); 
      
      const current = Math.floor(easeProgress * (end - start) + start);
      setDisplay(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, isInView]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export function StatsCounter() {
  const [stats, setStats] = useState({ lyricsForged: 1042, activeCreators: 1005 });

  useEffect(() => {
    // Increment visitor count if first time
    const visitKey = "songarc_visited";
    const isFirstVisit = !localStorage.getItem(visitKey);
    
    if (isFirstVisit) {
      localStorage.setItem(visitKey, "true");
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "visitor" })
      }).then(res => res.json()).then(data => setStats(data)).catch(() => {});
    } else {
      fetch("/api/stats")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});
    }
  }, []);

  return (
    <div className="mt-20 pt-10 border-t border-white/5 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-zinc-300">Join the Symphony</h3>
        <p className="text-sm text-zinc-500">Thousands of songs have been written here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.01] border border-white/5 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
            <Music4 className="w-6 h-6 text-cyan-400" />
          </div>
          <h4 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-400 mb-1">
            <AnimatedNumber value={stats.lyricsForged} />
          </h4>
          <p className="text-zinc-500 text-sm tracking-widest uppercase font-semibold">Lyrics Forged</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.01] border border-white/5 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-full bg-fuchsia-500/10 flex items-center justify-center mb-4 border border-fuchsia-500/20">
            <Users className="w-6 h-6 text-fuchsia-400" />
          </div>
          <h4 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-fuchsia-400 mb-1">
            <AnimatedNumber value={stats.activeCreators} />
          </h4>
          <p className="text-zinc-500 text-sm tracking-widest uppercase font-semibold">Active Creators</p>
        </motion.div>
      </div>

      <footer className="mt-20 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} SongArc. Developed by Fortelux.</p>
      </footer>
    </div>
  );
}
