"use client";

import { useMyFiles } from "@/hooks/useFilesInformations";
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UploadFileBtn from "./uploadFileBtn";
import { getPdfPreview } from "@/utils/cloudinary";

const MAX_PAGES = 5;

// ==========================================
// 🎨 Custom Grid Skeleton Loader
// ==========================================
const GridSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 p-5 space-y-4 animate-pulse">
                <div className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" />
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/4" />
                </div>
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
            </div>
        ))}
    </div>
);

// ==========================================
// 📄 Premium Profile File Card Component
// ==========================================
const ProfileFileCard = ({ file, onNavigate }: { file: any; onNavigate: () => void }) => {
    const previewUrl = getPdfPreview(file.file_path);

    // Dynamic semantic status badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <div className="absolute top-4 right-4 z-20 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Pending</span>
                    </div>
                );
            case "accepted":
                return (
                    <div className="absolute top-4 right-4 z-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <CheckCircle className="w-3 h-3" />
                        <span>Accepted</span>
                    </div>
                );
            case "rejected":
                return (
                    <div className="absolute top-4 right-4 z-20 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Rejected</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div onClick={onNavigate} className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden flex flex-col h-full cursor-pointer">
            {/* Card Preview Area */}
            <div className="h-40 bg-slate-50 dark:bg-slate-800/30 relative overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
                <Image
                    src={previewUrl}
                    alt={file.title}
                    fill
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/400x600/e2e8f0/64748b?text=No+Preview";
                    }}
                />

                {/* Aesthetic decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 group-hover:opacity-0 transition-opacity" />

                {/* Status indicator */}
                {getStatusBadge(file.status)}

                {/* Rejection Hover Tooltip Overlay (Stunning Glassmorphism) */}
                {file.status === "rejected" && (
                    <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center items-center p-5 text-center z-30 backdrop-blur-sm">
                        <AlertCircle className="w-6 h-6 text-rose-500 mb-2 animate-bounce" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">Rejection Reason</span>
                        <div className="max-h-20 overflow-y-auto mt-2 px-1 w-full custom-scrollbar">
                            <p className="text-xs text-slate-100 font-medium leading-relaxed">
                                {file.reason_rejected || "No reason specified by administrator."}
                            </p>
                        </div>
                        <span className="text-[8px] text-slate-400/80 mt-3 font-semibold uppercase tracking-wider">Hover out to view details</span>
                    </div>
                )}
            </div>

            {/* Card Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase text-[#0975e6] bg-[#0975e6]/10 px-2.5 py-1 rounded-lg">
                            {file.major || "General"}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                            {file.type ?? "PDF"}
                        </span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-[#0975e6] transition-colors leading-snug">
                        {file.title}
                    </h3>
                </div>

                {/* Divider & Footer stats */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 text-xs">
                    <span className="font-bold truncate max-w-[140px] text-slate-600 dark:text-slate-300">
                        {file.course || "No Course"}
                    </span>
                    {file.likes_count > 0 && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 shrink-0 bg-rose-500/5 px-2 py-0.5 rounded-md font-bold">
                            <span className="text-rose-500">❤️</span>
                            <span className="text-rose-600 dark:text-rose-400">{file.likes_count}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 📂 Main FilesSection Component
// ==========================================
export default function FilesSection() {
    const [myFiles, setMyFiles] = useState<any[]>([]);
    const [filesPage, setFilesPage] = useState(1);
    const [status, setStatus] = useState("all");
    const router = useRouter();

    const {
        data: filesData,
        isLoading: isFilesLoading,
        isFetching: isFetchingFiles,
        error
    } = useMyFiles(filesPage, 10, status);

    useEffect(() => {
        if (error) {
            console.error("FilesSection Error:", error);
        }
    }, [error]);

    // Reset list when filtering tab changes
    useEffect(() => {
        setMyFiles([]);
        setFilesPage(1);
    }, [status]);

    // Feed updates to accumulator
    useEffect(() => {
        if (!filesData?.data) return;

        setMyFiles((prev) => {
            const existingIds = new Set(prev.map((f) => f.id_file));
            const newFiles = filesData.data.filter(
                (file: any) => !existingIds.has(file.id_file)
            );
            return [...prev, ...newFiles];
        });
    }, [filesData]);

    const isEmpty = myFiles.length === 0;
    const isInitialLoading = isFilesLoading && isEmpty;

    const statuses = [
        { id: "all", label: "All Files" },
        { id: "pending", label: "Pending" },
        { id: "accepted", label: "Accepted" },
        { id: "rejected", label: "Rejected" },
    ];

    // Premium Color-coded status filter tabs
    const StatusFilters = (
        <div className="flex flex-wrap gap-2 px-2 lg:px-0">
            {statuses.map((s) => {
                const isActive = status === s.id;
                let activeClass = "bg-[#0975e6] text-white border-[#0975e6] shadow-md shadow-blue-500/20";
                
                if (isActive) {
                    if (s.id === 'pending') {
                        activeClass = "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20";
                    } else if (s.id === 'accepted') {
                        activeClass = "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20";
                    } else if (s.id === 'rejected') {
                        activeClass = "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20";
                    }
                }
                
                return (
                    <button
                        key={s.id}
                        onClick={() => setStatus(s.id)}
                        className={`
                            px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-2
                            ${isActive
                                ? activeClass
                                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-300"
                            }
                        `}
                    >
                        {s.id === 'pending' && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-amber-500 animate-pulse'}`} />}
                        {s.id === 'accepted' && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />}
                        {s.id === 'rejected' && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-rose-500'}`} />}
                        {s.id === 'all' && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#0975e6]'}`} />}
                        {s.label}
                    </button>
                );
            })}
        </div>
    );

    // Initial Loading State
    if (isInitialLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    {StatusFilters}
                </div>
                <GridSkeleton />
            </div>
        );
    }

    // Empty state
    if (isEmpty) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    {StatusFilters}
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800/80">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/60 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {status === 'all' ? "No files uploaded yet" : `No ${status} files found`}
                    </h3>

                    <p className="text-slate-400 text-sm mt-1 max-w-sm">
                        {status === 'all' ? "Start sharing your study materials with fellow students!" : `You don't have any files with the status: ${status}`}
                    </p>

                    {status === 'all' && <div className="mt-6"><UploadFileBtn /></div>}
                </div>
            </div>
        );
    }

    const hasMore =
        filesData?.meta?.current_page < filesData?.meta?.last_page &&
        filesPage < MAX_PAGES;

    return (
        <div className="space-y-8">
            {/* Header control */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-6">
                {StatusFilters}
                {status === 'all' && <UploadFileBtn />}
            </div>

            {/* Grid files cards layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myFiles.map((file) => (
                    <ProfileFileCard
                        key={file.id_file}
                        file={file}
                        onNavigate={() => router.push(`/dashboard/${file.id_file}`)}
                    />
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => setFilesPage((prev) => prev + 1)}
                        disabled={isFetchingFiles}
                        className="px-8 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        {isFetchingFiles ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#0975e6]" />
                                Loading More...
                            </>
                        ) : (
                            'Show More Files'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}