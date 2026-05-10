"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertOctagon, X, Info } from "lucide-react";
import { toast } from "sonner";
import useReportedFilesStore from "@/Store/admin/reportedFilesStore";

interface ReportDetailsModalProps {
  fileId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDetailsModal({ fileId, isOpen, onClose }: ReportDetailsModalProps) {
  const {
    reportedDetails,
    reportedFiles,
    detailsLoading,
    fetchReportedDetails,
    deleteOrIgnoreReportedFile,
  } = useReportedFilesStore();

  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    if (isOpen && fileId) {
      fetchReportedDetails(fileId);
    }
  }, [isOpen, fileId, fetchReportedDetails]);

  const handleDismissAll = async () => {
    if (!fileId) return;
    setIsActionPending(true);
    const res = await deleteOrIgnoreReportedFile(fileId, "ignore");
    setIsActionPending(false);
    if (res.success) {
      toast.success("All reports dismissed successfully.");
      onClose();
    } else {
      toast.error(res.message || "Failed to dismiss reports");
    }
  };

  const fileInfo = reportedFiles.find((f: any) => f.id_file === fileId)?.file;
  const fileName = fileInfo?.title || `FILE #${fileId}`;

  const getReasonStyles = (reason: string) => {
    const r = reason.toLowerCase();
    if (r.includes('copyright')) return 'bg-red-100 text-red-700';
    if (r.includes('spam') || r.includes('misleading')) return 'bg-blue-100 text-blue-700';
    if (r.includes('inappropriate')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 bg-white">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 text-red-500" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Report Details
                </DialogTitle>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  FILE: {fileName}
                </div>
              </div>
            </div>
            {/* The dialog component normally adds its own X, but we can rely on it if we don't hide it, or we hide it in global CSS. Assuming standard ui/dialog behavior, we don't need a manual X here unless we want to override it. */}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
          {detailsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !reportedDetails || reportedDetails.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-medium">
              No reports found for this file.
            </div>
          ) : (
            <div className="space-y-4">
              {reportedDetails.map((report: any, index: number) => {
                const reporterName = report.users?.fullname || report.users?.username || "Unknown User";
                const initials = reporterName.substring(0, 2).toUpperCase();
                const reasonLabel = report.reason || "OTHER";
                const date = new Date(report.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).toUpperCase();

                return (
                  <div 
                    key={index}
                    className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {/* If we had an avatar URL we'd use it, otherwise initials */}
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reporterName}`} alt={reporterName} className="w-full h-full rounded-full" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">
                            {reporterName}
                          </div>
                          <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getReasonStyles(reasonLabel)}`}>
                            {reasonLabel}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {date}
                      </div>
                    </div>
                    
                    {report.details && (
                      <p className="text-sm text-gray-700 leading-relaxed pt-1">
                        {report.details}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Info className="w-4 h-4 text-gray-500" />
            {reportedDetails?.length || 0} total reports for this file
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-gray-700 font-semibold hover:bg-gray-100"
              onClick={handleDismissAll}
              disabled={isActionPending || detailsLoading || !reportedDetails?.length}
            >
              {isActionPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Dismiss All
            </Button>
            <Button 
              className="bg-[#0f62fe] hover:bg-[#0353e9] text-white font-semibold px-6"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
