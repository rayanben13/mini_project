"use client"

import FilePreviewModal from "@/components/FilePreviewModal";
import { Button } from "@/components/ui/button";
import { useAdminApproveRejectFile } from "@/hooks/useAdminFiles";
import { useFileDetails } from "@/hooks/useFilesInformations";
import { AlertCircle, Check, ChevronLeft, Loader2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function FileDetails() {
    const param = useParams()
    const router = useRouter()
    const id = Number(param.id)
    const { data: fileDetails, isLoading, error } = useFileDetails(id);

    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    // Mutations
    const approveMutation = useAdminApproveRejectFile(id, "approve");
    const rejectMutation = useAdminApproveRejectFile(id, "reject");

    const handleApprove = () => {
        approveMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success("File approved successfully");
                router.back();
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.error || "Failed to approve file");
            }
        });
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        rejectMutation.mutate(rejectReason, {
            onSuccess: () => {
                toast.success("File rejected");
                setIsRejectOpen(false);
                router.back();
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.error || "Failed to reject file");
            }
        });
    };

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
                <Button onClick={() => router.back()} variant="outline" className="mt-4 rounded-xl">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-background">
            {/* Admin Action Bar */}
            {fileDetails.status === "pending" && (

                <div className="sticky top-17 z-[60] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => router.back()}
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Reviewing File</h2>
                            <p className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md">
                                {fileDetails.title}
                            </p>
                        </div>
                    </div>


                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIsRejectOpen(true)}
                            variant="outline"
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                        >
                            <X className="w-4 h-4 mr-2" /> Reject
                        </Button>

                        <Button
                            onClick={handleApprove}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            className="rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                        >
                            {approveMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Approve
                        </Button>
                    </div>

                </div>
            )}

            <FilePreviewModal file={fileDetails} />

            {/* Rejection Modal */}
            {isRejectOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600">
                                <X className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Reject File</h3>
                                <p className="text-sm text-slate-500">Provide a reason for rejection</p>
                            </div>
                        </div>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Inappropriate content, duplicate file, poor quality..."
                            className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm transition-all"
                        />

                        <div className="flex gap-3 mt-8">
                            <Button
                                onClick={() => {
                                    setIsRejectOpen(false);
                                    setRejectReason("");
                                }}
                                variant="ghost"
                                className="flex-1 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={rejectMutation.isPending || !rejectReason.trim()}
                                className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                            >
                                {rejectMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    "Confirm Reject"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileDetails