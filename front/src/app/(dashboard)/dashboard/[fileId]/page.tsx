"use client"
import FilePreviewModal from "@/components/FilePreviewModal";
import { useFileDetails } from "@/hooks/useFilesInformations";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function FilePage() {
    const params = useParams();
    const fileId = params.fileId;
    const { data: fileDetails, isLoading } = useFileDetails(fileId);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div>
            {fileDetails && <FilePreviewModal file={fileDetails} />}
        </div>
    );
}

