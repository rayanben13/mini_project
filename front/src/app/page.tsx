import { Search } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-50 flex flex-col items-center justify-center overflow-hidden">

      <div className="relative z-10 w-full max-w-5xl px-6 text-center pt-24">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">
          Grow smarter together
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Find top-rated study notes from students taking the same courses as you.
        </p>

        <div className="max-w-3xl mx-auto group">
          <div className="relative transition-transform duration-300 transform group-focus-within:-translate-y-1 group-focus-within:shadow-2xl rounded-full">
            <input
              type="text"
              placeholder="Search for courses, quizzes, or documents"
              className="w-full h-16 pl-8 pr-16 rounded-full text-slate-800 text-lg border border-slate-200 focus:ring-4 focus:ring-[#0975e6]/20 focus:border-[#0975e6] outline-none transition-all shadow-xl bg-white placeholder-slate-400"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0975e6] transition-colors cursor-pointer">
              <Search className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
