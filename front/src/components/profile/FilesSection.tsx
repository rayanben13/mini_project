"use client";

import { useMyFiles } from "@/hooks/useFilesInformations";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UploadFileBtn from "./uploadFileBtn";
import { FileCard } from "@/components/topFiles";

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
                let activeClass = "bg-[#ae1ce9] text-white border-[#ae1ce9] shadow-md shadow-[#ae1ce9]/20";
                
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
                        {s.id === 'all' && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#ae1ce9]'}`} />}
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
                    <FileCard
                        key={file.id_file}
                        file={file}
                        showStatus={true}
                        allowDelete={true}
                        onDelete={(id) => setMyFiles((prev) => prev.filter((f) => f.id_file !== id))}
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
                                <Loader2 className="w-4 h-4 animate-spin text-[#ae1ce9]" />
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