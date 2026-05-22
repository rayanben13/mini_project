// app/page.tsx (أو app/(public)/page.tsx)
"use client";

import SearchBar from "@/components/SearchBar";
import { ArrowRight, BookOpen, GraduationCap, FileText, Lightbulb, Trophy } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingItemProps {
  icon: React.ReactNode;
  factorX: number;
  factorY: number;
  rotate: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  bg: string;
  shadow: string;
  springX: any;
  springY: any;
}

function FloatingItem({
  icon,
  factorX,
  factorY,
  rotate,
  top,
  left,
  right,
  bottom,
  size,
  bg,
  shadow,
  springX,
  springY
}: FloatingItemProps) {
  const x = useTransform(springX, (val: number) => val * factorX);
  const y = useTransform(springY, (val: number) => val * factorY);

  return (
    <motion.div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        x,
        y,
        rotate,
      }}
      animate={{
        y: [0, -15, 0],
        rotate: [rotate - 3, rotate + 3, rotate - 3],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn(
        "flex rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl border border-white/60 dark:border-slate-800/40 p-3 md:p-5 items-center justify-center transition-all duration-300 hover:scale-110",
        size,
        bg,
        shadow
      )}
    >
      <div className="absolute inset-0 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none" />
      <div className="relative filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]">
        {icon}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Motion values for tracking mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for lag effect
  const springX = useSpring(mouseX, { stiffness: 45, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 22 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const floatingItems = [
    {
      icon: <GraduationCap className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
      factorX: 60,
      factorY: 60,
      rotate: 15,
      top: "18%",
      left: "8%",
      size: "w-24 h-24",
      bg: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
      shadow: "shadow-[0_20px_50px_rgba(59,130,246,0.12)]"
    },
    {
      icon: <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />,
      factorX: -45,
      factorY: 70,
      rotate: -15,
      top: "22%",
      right: "12%",
      size: "w-20 h-20",
      bg: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5",
      shadow: "shadow-[0_20px_50px_rgba(99,102,241,0.12)]"
    },
    {
      icon: <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />,
      factorX: 75,
      factorY: -45,
      rotate: 8,
      bottom: "25%",
      left: "12%",
      size: "w-20 h-20",
      bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5",
      shadow: "shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
    },
    {
      icon: <Lightbulb className="w-10 h-10 text-amber-600 dark:text-amber-400" />,
      factorX: -60,
      factorY: -60,
      rotate: -10,
      bottom: "28%",
      right: "10%",
      size: "w-20 h-20",
      bg: "bg-gradient-to-br from-amber-500/10 to-amber-600/5",
      shadow: "shadow-[0_20px_50px_rgba(245,158,11,0.12)]"
    },
    {
      icon: <Trophy className="w-12 h-12 text-purple-600 dark:text-purple-400" />,
      factorX: 35,
      factorY: -80,
      rotate: 20,
      top: "52%",
      left: "4%",
      size: "w-22 h-22",
      bg: "bg-gradient-to-br from-purple-500/10 to-purple-600/5",
      shadow: "shadow-[0_20px_50px_rgba(168,85,247,0.12)]"
    }
  ];

  return (
    <main className="relative min-h-screen flex flex-col overflow-x-hidden bg-transparent">
      {/* ===== Background Decoration ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#fcfdff] dark:bg-slate-950">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.25] dark:opacity-[0.08] transition-opacity duration-500" 
          style={{ backgroundImage: "url('/landing_bg_3d.png')" }} 
        />
        {/* Soft overlay to blend it cleanly */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#fcfdff]/40 via-transparent to-[#fcfdff]/30 dark:from-slate-950/40 dark:to-slate-950/30" />
        
        {/* Interactive Floating University Objects */}
        {floatingItems.map((item, idx) => (
          <FloatingItem
            key={idx}
            {...item}
            springX={springX}
            springY={springY}
          />
        ))}
      </div>

      {/* ===== Hero Section ===== */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-2 pb-20 text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 tracking-tight text-slate-900 dark:text-white leading-tight">
          Grow smarter{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            together
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Find top-rated study notes from students taking the same courses as
          you.
        </p>

        <div className="w-full max-w-2xl mx-auto mb-9 group">
          <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1 group-focus-within:shadow-2xl rounded-2xl">
            <SearchBar isGuest={true} externalQuery={searchTerm} />
          </div>
        </div>

        {/* Search Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-sm text-slate-400">Try:</span>
          {[
            "Algorithmique",
            "Electronique",
            "Algebre 1",
            "Systeme d'exploitation",
          ].map((term) => (
            <button
              key={term}
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => setSearchTerm(term)}
            >
              {term}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col mt-3 sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-3.5 bg-[#0975e6] hover:bg-[#0975e6]/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-0.5"
          >
            Sign In
          </Link>
        </div>
      </section>
    </main>
  );
}
