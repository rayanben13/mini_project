"use client";
import FilePreviewModal from "@/components/FilePreviewModal";
import FilePreviewModalSkeleton from "@/components/FilePreviewModalSkeleton";
import { useFileDetails } from "@/hooks/useFilesInformations";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function FilePage() {
  const params = useParams();
  const fileId = Number(params.fileId);
  const { data: fileDetails, isLoading, error } = useFileDetails(fileId);

  if (isLoading) {
    return <FilePreviewModalSkeleton />;
  }

  if (error) {
    const msg =
      (error as any)?.response?.data?.error ||
      "File not found or access denied.";
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-center bg-background px-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
          {msg}
        </p>
        <p className="text-sm text-muted-foreground">
          The file may have been removed or is pending review.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FilePreviewModal file={fileDetails} />
    </div>
  );
}
