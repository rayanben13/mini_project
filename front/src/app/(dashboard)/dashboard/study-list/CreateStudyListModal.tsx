"use client";

import { useSuggestions } from "@/hooks/useSuggestions";
import { Edit3, Globe, Loader2, PlusCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CreateStudyListModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: any) => void;
  readonly isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    description: "",
    isPublic: true,
  });

  const [openDropdown, setOpenDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isSuggestionsLoading,
    fetchSuggestions,
    clearSuggestions,
  } = useSuggestions();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
        clearSuggestions();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clearSuggestions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-950 w-full max-w-[350px] rounded-[1.75rem] shadow-2xl p-5 space-y-4 border border-slate-100 dark:border-slate-900 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0975e6] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" strokeWidth={2.2} />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Study List
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Organize resources for your exams
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              List Name
            </label>

            <input
              placeholder="e.g., Biology Finals - Year 2"
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#0975e6] placeholder-slate-400 text-sm transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5" ref={wrapperRef}>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subject
            </label>

            <input
              placeholder="e.g., Biology, Chemistry, etc."
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#0975e6] placeholder-slate-400 text-sm transition-all"
              value={form.subject}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, subject: value });

                if (value.trim().length >= 2) {
                  fetchSuggestions("subject", value);
                  setOpenDropdown(true);
                } else {
                  clearSuggestions();
                  setOpenDropdown(false);
                }
              }}
            />

            {openDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-lg max-h-44 overflow-auto">
                {isSuggestionsLoading && (
                  <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                )}

                {!isSuggestionsLoading &&
                  suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm text-slate-700 dark:text-slate-200"
                      onClick={() => {
                        setForm({ ...form, subject: s });
                        clearSuggestions();
                        setOpenDropdown(false);
                      }}
                    >
                      {s}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description
            </label>

            <textarea
              placeholder="What's the goal of this study list?"
              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-3.5 py-2.5 min-h-[85px] resize-none outline-none focus:ring-2 focus:ring-[#0975e6] placeholder-slate-400 text-sm transition-all"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-3 flex items-center justify-between border border-slate-100/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Public Visibility
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Allow others to see this list
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 shrink-0 ${
              form.isPublic ? "bg-[#0975e6]" : "bg-slate-200 dark:bg-slate-700"
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] left-1 transition-transform duration-200 shadow-sm ${
                form.isPublic ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={onClose}
            className="w-[48%] py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(form)}
            disabled={isLoading || !form.name || !form.subject}
            className={`w-[48%] py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
              isLoading || !form.name || !form.subject
                ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed"
                : "bg-[#0975e6] hover:bg-[#0866c9]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>Create</span>
                <PlusCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
