"use client"

import FilePreviewModal from "@/components/FilePreviewModal";
import { useFileDetails } from "@/hooks/useFilesInformations";
import { AlertCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

function FileDetails() {
    const param = useParams()
    const id = Number(param.id)
    const { data: fileDetails, isLoading, error } = useFileDetails(id);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !fileDetails?.id_file) {
        const msg = (error as any)?.response?.data?.error || "File not found or access denied.";
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-center bg-background px-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{msg}</p>
                <p className="text-sm text-muted-foreground">The file may have been removed or is pending review.</p>
            </div>
        );
    }

    return (
        <div>
            <FilePreviewModal file={fileDetails} />
        </div>
    );
}

export default FileDetails