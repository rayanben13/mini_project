"use client";

import SliderSkeleton from "@/components/sliderSkeleton";
import TopFilesSlider from "@/components/topFiles";
import { Button } from "@/components/ui/button";
import { showMyFiles } from "@/hooks/useFilesInformations";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MAX_PAGES = 5;

export default function FilesSection() {
    const [myFiles, setMyFiles] = useState<any[]>([]);
    const [filesPage, setFilesPage] = useState(1);
    const router = useRouter();

    const {
        data: filesData,
        isLoading: isFilesLoading,
        isFetching: isFetchingFiles,
    } = showMyFiles(filesPage, 10);

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

    // ✅ حالات العرض
    const isEmpty = myFiles.length === 0;
    const isInitialLoading = isFilesLoading && isEmpty;

    // 🔥 Render logic
    if (isInitialLoading) {
        return <SliderSkeleton />;
    }

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                </div>

                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    No files uploaded yet
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                    Start sharing your study materials!
                </p>

                <Button className="mt-6 bg-[#0975e6] hover:bg-[#0975e6]/90">
                    Upload Your First File
                </Button>
            </div>
        );
    }

    return (
        <TopFilesSlider
            key="my-files"
            data={myFiles}
            title="My Uploaded Files"
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
    );
}