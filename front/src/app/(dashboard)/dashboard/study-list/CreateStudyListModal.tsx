"use client";

import { useSuggestions } from "@/hooks/useSuggestions";
import { Loader2, X, Edit3, Globe, PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CreateStudyListModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading
}: {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onSubmit: (data: any) => void;
    readonly isLoading: boolean
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [clearSuggestions]);

    if (!isOpen) return null;

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 w-full max-w-[390px] rounded-[2rem] shadow-2xl p-6 space-y-5 border border-slate-100 dark:border-slate-900 relative">
                
                {/* Close Button top-right */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* ===== Centered Header ===== */}
                <div className="flex flex-col items-center justify-center text-center space-y-3.5 pt-2">
                    {/* Pencil icon with soft blue background matching mockup */}
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0975e6] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Edit3 className="w-6 h-6" strokeWidth={2.2} />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            Create Study List
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Organize resources for your exams
                        </p>
                    </div>
                </div>

                {/* ===== Inputs Form Section ===== */}
                <div className="space-y-5">
                    
                    {/* List Name Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            List Name
                        </label>
                        <input
                            placeholder="e.g., Biology Finals - Year 2"
                            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0975e6] placeholder-slate-400 text-sm transition-all"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    {/* Subject Field */}
                    <div className="space-y-2" ref={wrapperRef}>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Subject
                        </label>
                        <input
                            placeholder="e.g., Biology, Chemistry, etc."
                            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0975e6] placeholder-slate-400 text-sm transition-all"
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

                        {/* ===== Dropdown ===== */}
                        {openDropdown && (
                            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-lg max-h-52 overflow-auto">
                                {isSuggestionsLoading && (
                                    <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </div>
                                )}

                                {!isSuggestionsLoading && suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="px-4 py-2.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm text-slate-700 dark:text-slate-200"
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

                    {/* Description Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Description
                        </label>
                        <textarea
                            placeholder="What's the goal of this study list?"
                            className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-4 py-3 min-h-[110px] resize-none outline-none focus:ring-2 focus:ring-[#0975e6] placeholder-slate-400 text-sm transition-all"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* ===== Visibility Wrapper Card matching mockup exactly ===== */}
                <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 flex items-center justify-between border border-slate-100/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Public Visibility
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                                Allow other students to see this list
                            </p>
                        </div>
                    </div>

                    {/* Custom Blue sliding toggle switch matching mockup exactly */}
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                        className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${
                            form.isPublic ? "bg-[#0975e6]" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-200 shadow-sm ${
                            form.isPublic ? "translate-x-5" : "translate-x-0"
                        }`} />
                    </button>
                </div>

                {/* ===== Action Footer Buttons matching mockup exactly ===== */}
                <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                        onClick={onClose}
                        className="w-[48%] py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSubmit(form)}
                        disabled={isLoading || !form.name || !form.subject}
                        className={`w-[48%] py-3.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                            isLoading || !form.name || !form.subject
                                ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed"
                                : "bg-[#0975e6] hover:bg-[#0866c9] hover:shadow"
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <span>Create List</span>
                                <PlusCircle className="w-4.5 h-4.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}