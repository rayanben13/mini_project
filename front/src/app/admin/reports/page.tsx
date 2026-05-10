'use client';

import { useState, useEffect } from 'react';
import useReportedFilesStore from '@/Store/admin/reportedFilesStore';
import { ReportDetailsModal } from '@/components/admin/ReportDetailsModal';
import {
  Loader2,
  AlertTriangle,
  ShieldCheck,
  FileWarning,
  Eye,
  Trash2,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [section, setSection] = useState('all');
  const limit = 10;

  const {
    reportedFilesStatusData: statusData,
    reportedFiles,
    totalPages,
    currentPage,
    loading,
    fetchReportedFilesStatus,
    fetchFilesReported,
    deleteOrIgnoreReportedFile,
  } = useReportedFilesStore();

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    fetchReportedFilesStatus();
  }, [fetchReportedFilesStatus]);

  useEffect(() => {
    fetchFilesReported(page, limit, section);
  }, [page, limit, section, fetchFilesReported]);

  const handleViewDetails = (fileId: string) => {
    setSelectedFileId(fileId);
    setIsModalOpen(true);
  };

  const handleIgnore = async (fileId: number) => {
    setIsActionPending(true);
    const res = await deleteOrIgnoreReportedFile(fileId, 'ignore');
    setIsActionPending(false);
    if (res.success) {
      toast.success("File reports ignored successfully.");
    } else {
      toast.error(res.message || "Failed to ignore reports.");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteFileId || deleteReason.trim().length < 3) {
      toast.error("Reason must be at least 3 characters.");
      return;
    }
    setIsActionPending(true);
    const res = await deleteOrIgnoreReportedFile(deleteFileId, 'delete', deleteReason);
    setIsActionPending(false);
    if (res.success) {
      toast.success("File deleted successfully.");
      setDeleteFileId(null);
      setDeleteReason("");
    } else {
      toast.error(res.message || "Failed to delete file.");
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Reported Files
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review and manage files reported by users for violating platform
          policies.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Reports (or High Risk) */}
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full" />
          <div className="relative flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
              Action Needed
            </span>
          </div>
          <div className="relative">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              High Risk Files
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
              {statusData?.higheRisqueReportedFilesCount || 0}
            </h2>
          </div>
        </div>

        {/* Pending */}
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
          <div className="relative flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileWarning size={24} />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Pending
            </span>
          </div>
          <div className="relative">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              Pending Reviews
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
              {statusData?.totalPendingReportedFiles || 0}
            </h2>
          </div>
        </div>

        {/* Resolved */}
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />
          <div className="relative flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
              <ShieldCheck size={24} />
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400">
              Resolved
            </span>
          </div>
          <div className="relative">
            <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
              Resolved Reports
            </p>
            <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
              {statusData?.totalResolvedReportedFilesToday || 0}
            </h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => { setSection('all'); setPage(1); }}
          className={`pb-4 text-sm whitespace-nowrap ${section === 'all' ? 'font-bold text-primary border-b-2 border-primary' : 'font-semibold text-neutral hover:text-gray-800 transition-colors'}`}
        >
          All Reports
        </button>

        <button 
          onClick={() => { setSection('highRisk_Reports'); setPage(1); }}
          className={`pb-4 text-sm whitespace-nowrap ${section === 'highRisk_Reports' ? 'font-bold text-primary border-b-2 border-primary' : 'font-semibold text-neutral hover:text-gray-800 transition-colors'}`}
        >
          High Risk
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">
                  File Owner
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  </td>
                </tr>
              ) : reportedFiles?.map((item: any) => {
                const fileName = item.file?.title || `File #${item.id_file}`;
                const ownerName =
                  item.file?.users?.fullname ||
                  item.file?.users?.username ||
                  'Unknown';
                const initials = ownerName.substring(0, 2).toUpperCase();
                const reportsCount = item.reports_count || 0;
                const percent = Math.min((reportsCount / 10) * 100, 100);
                const progressColor =
                  reportsCount >= 5 ? 'bg-red-500' : 'bg-amber-500';
                const avatarBg = 'bg-blue-100 text-blue-600';

                return (
                  <tr
                    key={item.id_file}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <FileWarning className="w-5 h-5 text-gray-400" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleViewDetails(String(item.id_file));
                          }}
                          className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors underline-offset-4 decoration-primary hover:underline text-left"
                        >
                          {fileName}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${avatarBg}`}
                        >
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {ownerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleViewDetails(String(item.id_file));
                          }}
                          className="text-sm font-bold text-gray-900 hover:text-primary transition-colors underline-offset-4 decoration-primary hover:underline text-left w-[70px]"
                        >
                          {reportsCount} reports
                        </button>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className={`h-full ${progressColor} rounded-full`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setDeleteFileId(item.id_file)}
                          disabled={isActionPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold disabled:opacity-50"
                        >
                          <Trash2 className="w-[16px] h-[16px]" />
                          Delete
                        </button>
                        <button 
                          onClick={() => handleIgnore(item.id_file)}
                          disabled={isActionPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-xs font-bold disabled:opacity-50"
                        >
                          <EyeOff className="w-[16px] h-[16px]" />
                          Ignore
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && (!reportedFiles || reportedFiles.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No reported files found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-neutral font-medium">
              Showing Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-gray-700 mx-2">
                {page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal Context Placeholder */}
      <div className="p-6 rounded-lg border border-primary-100 bg-primary-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-white border border-primary-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Deletion Process
            </h4>
            <p className="text-sm text-secondary-900/80 mt-1.5 leading-relaxed">
              When clicking "Delete File", you will be required to provide a
              mandatory reason for removal (e.g., specific copyright claim ID or
              violation policy section). This reason will be logged and
              communicated to the file owner.
            </p>
          </div>
        </div>
      </div>

      {selectedFileId && (
        <ReportDetailsModal
          fileId={Number(selectedFileId)}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFileId(null);
          }}
        />
      )}

      {/* Delete Reason Modal */}
      <Dialog open={!!deleteFileId} onOpenChange={(open) => !open && setDeleteFileId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please provide a mandatory reason for removing this file. This reason will be logged and sent to the file owner.
            </p>
            <Textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="e.g. Copyright infringement (Claim #1234), explicitly violates Section 3 of Terms..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFileId(null)} disabled={isActionPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isActionPending || deleteReason.trim().length < 3}>
              {isActionPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
