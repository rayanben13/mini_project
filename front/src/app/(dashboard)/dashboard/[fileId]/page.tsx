'use client';
import FilePreviewModal from '@/components/FilePreviewModal';
import FilePreviewModalSkeleton from '@/components/FilePreviewModalSkeleton';
import { useFileDetails } from '@/hooks/useFilesInformations';
import { FileX, ArrowLeft, Home } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function FilePage() {
  const params = useParams();
  const fileId = Number(params.fileId);
  const { data: fileDetails, isLoading, error } = useFileDetails(fileId);

  // Check if there is an error in useQuery, or if the store returned a failed status response
  const hasError =
    !!error ||
    (fileDetails && (fileDetails.success === false || fileDetails.error));
  const errorMsg =
    (error as any)?.response?.data?.error ||
    fileDetails?.message ||
    fileDetails?.error ||
    'File not found or access denied.';

  if (isLoading) {
    return <FilePreviewModalSkeleton />;
  }

  if (hasError) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center px-4 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 py-12 animate-in fade-in duration-300">
        {/* Soft Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#0975e6]/10 dark:bg-[#0975e6]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/5 dark:bg-red-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] text-center flex flex-col items-center gap-6">
          {/* Glowing Glass Icon Wrapper */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
            <div className="absolute inset-0 bg-red-500/10 rounded-3xl blur-md" />
            <FileX className="w-12 h-12 text-red-500 dark:text-red-400 relative z-10 animate-bounce" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              File Unavailable
            </h1>
          </div>

          {/* Explanation Text */}
          <div className="space-y-4 max-w-md">
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Sorry, this file is unavailable. It may have been deleted by the
              owner, rejected due to review guidelines, or does not exist.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4 justify-center">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0975e6] hover:bg-[#0865c8] text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all duration-200 active:scale-95 cursor-pointer w-full sm:w-auto border border-slate-200/50 dark:border-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <FilePreviewModal file={fileDetails} />
    </div>
  );
}
