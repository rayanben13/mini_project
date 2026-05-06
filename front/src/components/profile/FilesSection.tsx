"use client";

import SliderSkeleton from "@/components/sliderSkeleton";
import TopFilesSlider from "@/components/topFiles";
import { useMyFiles } from "@/hooks/useFilesInformations";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UploadFileBtn from "./uploadFileBtn";

const MAX_PAGES = 5;

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
        if (filesData) {
            console.log("FilesSection Data:", filesData);
        }
        if (error) {
            console.error("FilesSection Error:", error);
        }
    }, [filesData, error]);

    // Reset when status changes
    useEffect(() => {
        setMyFiles([]);
        setFilesPage(1);
    }, [status]);

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
        { id: "all", label: "All" },
        { id: "pending", label: "Pending" },
        { id: "accepted", label: "Accepted" },
        { id: "rejected", label: "Rejected" },
    ];

    const StatusFilters = (
        <div className="flex flex-wrap gap-2 px-2 lg:px-0 mb-6">
            {statuses.map((s) => (
                <button
                    key={s.id}
                    onClick={() => setStatus(s.id)}
                    className={`
                        px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                        ${status === s.id
                            ? "bg-[#0975e6] text-white border-[#0975e6] shadow-md shadow-blue-500/20"
                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }
                    `}
                >
                    {s.label}
                </button>
            ))}
        </div>
    );

    // 🔥 Render logic
    if (isInitialLoading) {
        return (
            <div className="space-y-6">
                {StatusFilters}
                <SliderSkeleton />
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="space-y-6">
                {StatusFilters}
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-slate-400" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {status === 'all' ? "No files uploaded yet" : `No ${status} files found`}
                    </h3>

                    <p className="text-slate-400 text-sm mt-1">
                        {status === 'all' ? "Start sharing your study materials!" : `You don't have any files with the status: ${status}`}
                    </p>

                    {status === 'all' && <div className="mt-6"><UploadFileBtn /></div>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {StatusFilters}
            <TopFilesSlider
                key={`my-files-${status}`}
                data={myFiles}
                title={`${status === 'all' ? 'My' : status.charAt(0).toUpperCase() + status.slice(1)} Uploaded Files`}
                icon={<Upload className="w-5 h-5 text-[#0975e6]" />}
                hasMore={
                    filesData?.meta?.current_page < filesData?.meta?.last_page &&
                    filesPage < MAX_PAGES
                }
                onLoadMore={() => setFilesPage((prev) => prev + 1)}
                isLoadingMore={isFetchingFiles}
                onFileClick={(fileId) => {
                    router.push(`/dashboard/${fileId}`);
                }}
                itemKey="id_file"
            />
        </div>
    );
}