// app/page.tsx (أو app/(public)/page.tsx)
"use client";

import SearchBar from "@/components/SearchBar";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-x-hidden">
      {/* ===== Background Decoration ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
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
