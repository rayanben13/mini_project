"use client";

import FilePreviewModal from "@/components/FilePreviewModal";
import FilePreviewModalSkeleton from "@/components/FilePreviewModalSkeleton";
import { Button } from "@/components/ui/button";
import { useFileDetails } from "@/hooks/useFilesInformations";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

function FileDetails() {
  const param = useParams();
  const router = useRouter();
  const id = Number(param.id);
  const { data: fileDetails, isLoading, error } = useFileDetails(id);

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
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mt-4 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <FilePreviewModal file={fileDetails} />
    </div>
  );
}

export default FileDetails;
