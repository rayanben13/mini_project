// app/page.tsx (أو app/(public)/page.tsx)
"use client";

import SearchBar from "@/components/SearchBar";
import { ArrowRight, BookOpen, FileText, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">

      {/* ===== Background Decoration ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* ===== Hero Section ===== */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-16 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Join 10,000+ students already studying smarter
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">
          Grow smarter{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            together
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Find top-rated study notes from students taking the same courses as you.
        </p>

        <div className="w-full max-w-2xl mx-auto mb-6 group">
          <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1 group-focus-within:shadow-2xl rounded-2xl">
            <SearchBar isGuest={true} />
          </div>
        </div>

        {/* Search Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-sm text-slate-400">Try:</span>
          {["Algorithms", "Thermodynamics", "Linear Algebra", "Marketing"].map((term) => (
            <button
              key={term}
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => {
                // يمكنك إضافة منطق للبحث هنا
                const input = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (input) {
                  input.value = term;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.focus();
                }
              }}
            >
              {term}
            </button>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
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

      {/* ===== Stats Section ===== */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              value: "50K+",
              label: "Study Files",
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-500/10",
            },
            {
              icon: Users,
              value: "10K+",
              label: "Active Students",
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-500/10",
            },
            {
              icon: BookOpen,
              value: "500+",
              label: "Subjects Covered",
              color: "text-emerald-500",
              bg: "bg-emerald-50 dark:bg-emerald-500/10",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}