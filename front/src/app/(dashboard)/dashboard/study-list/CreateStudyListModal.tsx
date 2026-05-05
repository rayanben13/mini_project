"use client";

import { useSuggestions } from "@/hooks/useSuggestions";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CreateStudyListModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading: boolean
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

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6 space-y-5 border dark:border-slate-800">

                {/* ===== Header ===== */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                        Create Study List
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ===== Inputs Shared Style ===== */}
                {/* تم تعديل المدخلات لتدعم الوضع الليلي */}
                <div className="space-y-4">
                    <input
                        placeholder="List name"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <div className="relative" ref={wrapperRef}>
                        <input
                            placeholder="Subject (e.g. Math, Physics...)"
                            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-lg max-h-52 overflow-auto">
                                {isSuggestionsLoading && (
                                    <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </div>
                                )}

                                {!isSuggestionsLoading && suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm text-gray-700 dark:text-slate-200"
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

                    <textarea
                        placeholder="Description"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                {/* ===== Public / Private ===== */}
                <div className="flex gap-6 text-sm dark:text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            className="accent-blue-600"
                            checked={form.isPublic}
                            onChange={() => setForm({ ...form, isPublic: true })}
                        />
                        Public
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            className="accent-blue-600"
                            checked={!form.isPublic}
                            onChange={() => setForm({ ...form, isPublic: false })}
                        />
                        Private
                    </label>
                </div>

                {/* ===== Actions ===== */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border dark:border-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSubmit(form)}
                        disabled={isLoading || !form.name || !form.subject}
                        className={`px-4 py-2 rounded-xl text-white transition flex items-center justify-center gap-2 ${isLoading || !form.name || !form.subject
                                ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}