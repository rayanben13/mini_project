"use client";

import { useAdminApproveRejectFile, useAdminFilesStatus, useAdminPendingFiles } from "@/hooks/useAdminFiles";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    Search,
    XCircle,
    Loader2
} from "lucide-react";
import { useState } from "react";
import FileRow from "./fileRaw";

export default function DocumentReviewPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const handleSearch = () => {
        setCurrentPage(1);
        setActiveSearch(searchTerm);
    };

    const { data: statsData, isLoading: statsLoading } = useAdminFilesStatus();
    const { data: pendingData, isLoading: pendingLoading, isFetching } =
        useAdminPendingFiles(currentPage, itemsPerPage, activeSearch);

    const files = pendingData?.mappedFiles || [];
    const totalItems = pendingData?.meta?.total_files || 0;
    const totalPages = pendingData?.meta?.last_page || 1;

    const approveAllMutation = useAdminApproveRejectFile(0, "approveAll");

    const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

    if (statsLoading || (pendingLoading && !isFetching)) {
        return (
            <div className="h-[80vh] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                        Pending Files
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Review and approve or reject document submissions.
                    </p>
                </div>
                {/* Approve All Button */}
                <button
                    onClick={() => approveAllMutation.mutate(undefined)}
                    disabled={approveAllMutation.isPending || totalItems === 0}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
                >
                    {approveAllMutation.isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Approving All...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Approve All ({totalItems})
                        </>
                    )}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending */}
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
                    <div className="relative flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Clock size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Waiting
                        </span>
                    </div>
                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            Pending Approvals
                        </p>
                        <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                            {statsData?.pendingFiles ?? 0}
                        </h2>
                    </div>
                </div>

                {/* Approved */}
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full" />
                    <div className="relative flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircle2 size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                            Today
                        </span>
                    </div>
                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            Approved
                        </p>
                        <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                            {statsData?.acceptedFilesToday ?? 0}
                        </h2>
                    </div>
                </div>

                {/* Rejected */}
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full" />
                    <div className="relative flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                            <XCircle size={24} />
                        </div>
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                            Today
                        </span>
                    </div>
                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            Rejected
                        </p>
                        <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                            {statsData?.rejectedFilesToday ?? 0}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
                {/* Search Bar */}
                <div className="p-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">Document Submissions</h3>
                    <div className="flex gap-2 w-full sm:w-auto items-center">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by title or user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActiveSearch("");
                                        setCurrentPage(1);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={!searchTerm.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}>
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">Submitter</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider">Date Uploaded</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {files.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                                            <p className="font-medium">No pending files found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                files.map((file: any) => (
                                    <FileRow key={file.id_file} file={file} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-neutral font-medium">
                            Showing {startEntry}–{endEntry} of {totalItems} entries
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || isFetching}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-400 hover:bg-white hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${currentPage === page
                                        ? "bg-primary text-white border border-primary"
                                        : "border border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || isFetching}
                                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-white hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}