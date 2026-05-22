// components/admin/FileRow.tsx
import { useAdminApproveRejectFile } from '@/hooks/useAdminFiles';
import { Check, Eye, File, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FileRow({ file }: { file: any }) {
  const router = useRouter();
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ✅ Hooks مع المسارات الصحيحة
  const approveMutation = useAdminApproveRejectFile(file.id_file, 'approve');
  const rejectMutation = useAdminApproveRejectFile(file.id_file, 'reject');

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
      {/* File Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <File className="w-8 h-8 text-[#ae1ce9] shrink-0" />
          <span className="text-sm font-medium group-hover:text-[#ae1ce9] transition-colors">
            {file.title}
          </span>
        </div>
      </td>

      {/* Submitter */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold uppercase shrink-0">
            {file.users?.fullname?.charAt(0) || '?'}
          </div>
          <span className="text-sm">{file.users?.fullname || 'Unknown'}</span>
        </div>
      </td>

      {/* Subject */}
      <td className="px-6 py-4">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${file.subjectStyle || 'bg-blue-50 text-blue-600 border-blue-200'}`}
        >
          {file.subjects?.course || 'No Course'}
        </span>
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-500">{file.created_at}</span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* View */}
          <button
            onClick={() => router.push(`/admin/files/${file.id_file}`)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-[#ae1ce9] transition-all"
            title="View file"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* ✅ Approve - mutate بدون معاملات */}
          <button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
            title="Approve file"
          >
            {approveMutation.isPending ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>

          {/* ✅ Reject - يفتح Dialog */}
          <button
            onClick={() => setIsRejectOpen(true)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
            title="Reject file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>

      {/* ✅ Reject Dialog */}
      {isRejectOpen && (
        <td className="fixed inset-0 z-50" style={{ display: 'contents' }}>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsRejectOpen(false);
              setRejectReason('');
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl animate-in fade-in zoom-in duration-200"
            >
              <h2 className="text-lg font-semibold mb-1">Reject File</h2>
              <p className="text-sm text-slate-500 mb-4">
                Provide a reason for rejecting:{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {file.title}
                </strong>
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Duplicate content, wrong category..."
                className="w-full h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent p-3 outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
              />

              {/* Character Counter */}
              <p className="text-xs text-right text-slate-400 mt-1">
                {rejectReason.length} characters
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsRejectOpen(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium"
                >
                  Cancel
                </button>

                {/* ✅ Reject - mutate مع reason */}
                <button
                  onClick={() => {
                    if (!rejectReason.trim()) return;
                    rejectMutation.mutate(rejectReason, {
                      onSuccess: () => {
                        setIsRejectOpen(false);
                        setRejectReason('');
                      },
                    });
                  }}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 text-sm font-medium"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </td>
      )}
    </tr>
  );
}
