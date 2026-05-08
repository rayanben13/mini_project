"use client";

import allActurStore from "@/Store/allActurStore";
import { ArrowRight, Book, FileText, Loader2, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";

type SearchBarProps = {
    mobile?: boolean;
    onClose?: () => void;
    isGuest?: boolean;
    externalQuery?: string;
};

export default function SearchBar({
    mobile = false,
    onClose,
    isGuest = false,
    externalQuery = ""
}: SearchBarProps) {
    const getSearchFiles = allActurStore((state) => state.getSearchFiles);
    const getSearchSubject = allActurStore((state) => state.getSearchSubject);

    const [searchQuery, setSearchQuery] = useState(externalQuery);
    const [searchResults, setSearchResults] = useState<{
        files: any[];
        subjects: any[];
    }>({ files: [], subjects: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchQuery(externalQuery);
        if (externalQuery.trim().length >= 2) {
            setShowResults(true);
        }
    }, [externalQuery]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target as Node)
            ) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const query = searchQuery.trim();
            if (query.length >= 2) {
                setIsSearching(true);
                setShowResults(true);

                try {
                    const [filesRes, subjectsRes] = await Promise.all([
                        getSearchFiles({ title: query }),
                        getSearchSubject({ course: query }),
                    ]);

                    const files = filesRes.success
                        ? (Array.isArray(filesRes.data?.data) ? filesRes.data.data : (Array.isArray(filesRes.data) ? filesRes.data : []))
                        : [];

                    const subjects = subjectsRes.success
                        ? (Array.isArray(subjectsRes.data?.data) ? subjectsRes.data.data : (Array.isArray(subjectsRes.data) ? subjectsRes.data : []))
                        : [];

                    setSearchResults({ files, subjects });
                } catch (error) {
                    console.error("Search error:", error);
                    setSearchResults({ files: [], subjects: [] });
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ files: [], subjects: [] });
                setShowResults(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, getSearchFiles, getSearchSubject]);

    const hasResults =
        searchResults.files.length > 0 ||
        searchResults.subjects.length > 0;

    return (
        <div ref={searchContainerRef} className="relative w-full">

            {/* ===== Input ===== */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
                    placeholder={isGuest
                        ? "Search study materials, courses..."
                        : "Search files or subjects..."
                    }
                    className={`
                        pl-12
                        bg-white dark:bg-slate-800
                        border-slate-200 dark:border-slate-700
                        focus-visible:ring-2 focus-visible:ring-blue-500/30
                        ${isGuest
                            ? "h-14 text-base rounded-2xl shadow-md"
                            : "rounded-xl"
                        }
                    `}
                />
                {isSearching ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                ) : searchQuery ? (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setShowResults(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                ) : null}
            </div>

            {/* ===== Results Dropdown ===== */}
            {showResults && (
                <div className={`
                    ${mobile ? "mt-2" : "absolute top-[calc(100%+4px)] left-0"}
                    w-full
                    bg-white dark:bg-gray-800
                    border border-slate-200 dark:border-slate-700
                    rounded-2xl shadow-lg z-[60]
                    max-h-[80vh] overflow-y-auto
                `}>

                    {/* Loading */}
                    {isSearching && (
                        <div className="p-6 flex items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Searching...</span>
                        </div>
                    )}

                    {/* No Results */}
                    {!isSearching && !hasResults && (
                        <div className="p-8 text-center">
                            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-500">
                                No results found
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Try different keywords
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {!isSearching && hasResults && (
                        <div className="p-2 space-y-2">

                            {/* ===== Subjects ===== */}
                            {searchResults.subjects.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Subjects ({searchResults.subjects.length})
                                    </h3>
                                    <div className="space-y-0.5">
                                        {searchResults.subjects.map((sub: any) => (
                                            <Link
                                                key={sub.id_subject}
                                                href={isGuest ? `/subject/${sub.id_subject}` : `/dashboard/subject/${sub.id_subject}`}
                                                onClick={() => {
                                                    setShowResults(false);
                                                    onClose?.();
                                                }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                                    <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold truncate">
                                                        {sub.course}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 truncate">
                                                        {sub.major}
                                                        {sub.academic_year ? ` • ${sub.academic_year}` : ""}
                                                        {sub.specialization ? ` • ${sub.specialization}` : ""}
                                                    </p>
                                                </div>

                                                {sub._count?.files > 0 && (
                                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full shrink-0">
                                                        {sub._count.files} files
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isGuest && hasResults && (
                                <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                                    <Link
                                        href="/signup"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0975e6]/10 hover:bg-[#0975e6]/20 text-[#0975e6] font-semibold rounded-xl text-sm transition-colors"
                                    >
                                        Sign up to access all materials
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}

                            {/* Divider */}
                            {searchResults.subjects.length > 0 &&
                                searchResults.files.length > 0 && (
                                    <div className="border-t border-slate-100 dark:border-slate-700 mx-2" />
                                )}

                            {/* ===== Files ===== */}
                            {searchResults.files.length > 0 && (
                                <div>
                                    <h3 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Files ({searchResults.files.length})
                                    </h3>
                                    <div className="space-y-0.5">
                                        {searchResults.files.map((file: any) => (
                                            <Link
                                                key={file.id_file}
                                                href={isGuest ? `/file/${file.id_file}` : `/dashboard/${file.id_file}`}
                                                onClick={() => {
                                                    setShowResults(false);
                                                    onClose?.();
                                                }}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="size-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold truncate">
                                                        {file.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 truncate">
                                                        {file.type_file}
                                                        {file.course ? ` • ${file.course}` : ""}
                                                        {file.major ? ` • ${file.major}` : ""}
                                                    </p>
                                                </div>

                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                                                    {file.type_file}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}