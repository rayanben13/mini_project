'use client';

import allActurStore from '@/Store/allActurStore';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import FileActions from './fileAction';

import { useProfileDropdownData } from '@/hooks/useUserInformation';
import useAiStore from '@/Store/ai/aiStore';
import { Download, Loader2, Share2, Check, X, Trash2 } from 'lucide-react';
import ReportDialog from './reportingDialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApproveRejectFile } from '@/hooks/useAdminFiles';

export default function FilePreviewModal({ file }: { file: any }) {
  const router = useRouter();
  const { getShareLink, getDownloadFiles } = allActurStore();
  const { data: userInfo } = useProfileDropdownData();
  const { activateLibraryDocument, activationLoading } = useAiStore();
  const isAdmin = userInfo?.profileData?.role === 'admin';
  const isGuest = !userInfo || userInfo?.profileData?.role === 'guest';

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const approveMutation = useAdminApproveRejectFile(file?.id_file, 'approve');
  const rejectMutation = useAdminApproveRejectFile(file?.id_file, 'reject');

  const handleApprove = () => {
    approveMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('File approved successfully');
        router.back();
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to approve file');
      },
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate(rejectReason, {
      onSuccess: () => {
        toast.success('File rejected');
        setIsRejectOpen(false);
        router.back();
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || 'Failed to reject file');
      },
    });
  };

  if (!file)
    return (
      <p className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </p>
    );

  const subject = file?.subjects;

  const handleShare = async () => {
    // Admins can view pending files — build the share URL locally
    if (isAdmin) {
      const shareUrl = `${window.location.origin}/files/${file.id_file}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      return;
    }
    const res = await getShareLink(file.id_file);
    if (res.success) {
      const shareUrl = res.data.link || res.data;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } else {
      toast.error(res.message || 'Failed to get share link');
    }
  };

  const handleDownload = () => {
    // Admins can view pending files — use file_path directly, bypassing
    // the backend download endpoint which requires status=accepted
    if (isAdmin && file?.file_path) {
      const url = file.file_path.includes('/upload/')
        ? file.file_path.replace('/upload/', '/upload/fl_attachment/')
        : file.file_path;
      window.open(url, '_blank');
      return;
    }
    getDownloadFiles(file.id_file);
  };

  return (
    <main className="flex flex-1 flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* ================= MAIN ================= */}
      <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white break-words leading-tight">
              {file.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
              <span>📅 {file.approved_at || 'Not approved yet'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>📄 {file.type}</span>
              {file.status !== 'accepted' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                      file.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {file.status}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center w-11 h-11 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition duration-200 active:scale-95 cursor-pointer"
              title="Download file"
            >
              <Download className="size-5" />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center w-11 h-11 border border-border rounded-xl hover:bg-muted transition duration-200 active:scale-95 cursor-pointer"
              title="Share file"
            >
              <Share2 className="size-5" />
            </button>

            {!isAdmin && (
              <ReportDialog
                file={file}
                userInfo_role={userInfo?.profileData?.role}
                onlyIcon={true}
              />
            )}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="h-[600px] rounded-2xl overflow-hidden border border-border bg-muted">
          <iframe
            src={`https://docs.google.com/gview?url=${file.file_path}&embedded=true`}
            className="w-full h-full"
          />
        </div>

        {/* Interaction */}
        <FileActions
          userRole={userInfo?.profileData?.role || ''}
          fileId={file.id_file}
          initialLikes={file.like || 0}
          initialDislikes={file.dislike || 0}
          initialStatusLike={file.statusLike}
        />
      </div>

      {/* ================= SIDEBAR ================= */}
      <aside className="w-full lg:w-[380px] p-4 lg:p-6 border-l border-border bg-card flex flex-col gap-6">
        {userInfo?.profileData?.role === 'user' && (
          <button
            onClick={() => activateLibraryDocument(file.id_file, file.title)}
            disabled={activationLoading}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {activationLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Activating AI...</span>
              </>
            ) : (
              <>
                <span className="text-xl">✨</span> Use AI with this document
              </>
            )}
          </button>
        )}

        {isAdmin && file?.status === 'pending' && (
          <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {/* Approve */}
              <button
                onClick={handleApprove}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Approve
                  </>
                )}
              </button>

              {/* Reject */}
              <button
                onClick={() => setIsRejectOpen(true)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="w-full h-12 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-700 font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>
        )}

        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
          {/* Header */}
          <h3 className="text-xs font-extrabold tracking-[0.25em] uppercase text-slate-400 mb-8">
            Document Info
          </h3>

          <div className="space-y-6">
            {/* Submitter */}
            <>
              <div>
                <p className="text-sm text-slate-400 mb-3">Submitted by</p>
                <Link
                  href={
                    !userInfo
                      ? `/login?from=modal&file_id=${file.id_file}`
                      : `/dashboard/user/${file.users?.id_user}`
                  }
                  onClick={(e) => {
                    if (file.users?.role === 'admin') {
                      e.preventDefault();
                      toast.error("You can't see this profile");
                    }
                  }}
                  className="flex items-center gap-3 group w-fit"
                >
                  {/* Avatar */}
                  <div className="relative size-11 rounded-full overflow-hidden bg-fuchsia-100 border border-fuchsia-200 flex items-center justify-center">
                    {file.users?.img_user ? (
                      <Image
                        src={file.users?.img_user}
                        alt={file.users?.fullname || 'User'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm font-bold text-fuchsia-600 uppercase">
                        {file.users?.fullname?.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-fuchsia-600 transition-colors">
                      {file.users?.fullname || 'Unknown user'}
                    </p>

                    <p className="text-xs text-slate-400">
                      @{file.users?.username || 'unknown'}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800" />
            </>

            {/* Subject */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Subject</p>

              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {subject?.course}
              </span>
            </div>

            {/* Info Fields */}
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-400">Major</p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {subject?.major}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">University</p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {subject?.university}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Academic Year</p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {subject?.academic_year}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Type</p>

                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {file?.type}
                </p>
              </div>

              {isAdmin && (
                <>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>

                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {file?.status}
                    </p>
                  </div>
                  {file.approved_at && (
                    <div>
                      <p className="text-sm text-slate-400">Approved At</p>

                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {file.approved_at}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-400">Creation Year</p>

                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {file.creation_year}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Rejection Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Reject File
                </h3>
                <p className="text-sm text-slate-500">
                  Provide a reason for rejection
                </p>
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inappropriate content, duplicate file, poor quality..."
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm transition-all"
            />

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsRejectOpen(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-150 cursor-pointer flex items-center justify-center"
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
