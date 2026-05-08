"use client";

import { useAdminApproveRejectFile, useAdminFilesStatus, useAdminPendingFiles } from "@/hooks/useAdminFiles";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    Search,
    XCircle
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

    // ✅ فقط Approve All
    const approveAllMutation = useAdminApproveRejectFile(0, "approveAll");

    const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

    if (statsLoading || (pendingLoading && !isFetching)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ae1ce9]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f7f6f8] dark:bg-[#1d1121] text-slate-900 dark:text-slate-100 font-sans transition-colors pt-8 pb-16">
            <main className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Pending Files Review</h2>

                    {/* ✅ Approve All فقط */}
                    <button
                        onClick={() => approveAllMutation.mutate(undefined)}
                        disabled={approveAllMutation.isPending || totalItems === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {approveAllMutation.isPending ? (
                            <>
                                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<Clock className="w-7 h-7" />}
                        label="Pending Approvals"
                        value={statsData?.pendingFiles ?? 0}
                        color="bg-[#ae1ce9]/10 text-[#ae1ce9]"
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-7 h-7" />}
                        label="Approved Today"
                        value={statsData?.acceptedFilesToday ?? 0}
                        color="bg-green-500/10 text-green-500"
                    />
                    <StatCard
                        icon={<XCircle className="w-7 h-7" />}
                        label="Rejected Today"
                        value={statsData?.rejectedFilesToday ?? 0}
                        color="bg-red-500/10 text-red-500"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                        <h3 className="text-lg font-bold">Document Submissions</h3>

                        {/* Search & Filter */}
                        <div className="flex gap-2 w-full sm:w-auto items-center">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full pl-10 pr-8 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#ae1ce9]/50"
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
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ae1ce9] text-white text-sm font-medium hover:bg-[#ae1ce9]/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>


                        </div>
                    </div>

                    {/* Table */}
                    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-[#ae1ce9]/10 shadow-sm overflow-hidden overflow-x-auto transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}>
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[#ae1ce9]/10">
                                    <th className="px-6 py-4 table-head">File Name</th>
                                    <th className="px-6 py-4 table-head">Submitter</th>
                                    <th className="px-6 py-4 table-head">Subject</th>
                                    <th className="px-6 py-4 table-head">Date Uploaded</th>
                                    <th className="px-6 py-4 table-head">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ae1ce9]/10">
                                {files.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-slate-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                                                <p className="font-medium">No pending files found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    // ✅ بدون isChecked و onSelectionChange
                                    files.map((file) => (
                                        <FileRow key={file.id_file} file={file} />
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-[#ae1ce9]/10 flex items-center justify-between flex-wrap gap-3">
                            <span className="text-xs text-slate-500 font-medium uppercase">
                                Showing {startEntry}–{endEntry} of {totalItems} entries
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isFetching}
                                    className="pagination-btn disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${currentPage === page
                                            ? "bg-[#ae1ce9] text-white"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isFetching}
                                    className="pagination-btn disabled:opacity-30"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#ae1ce9]/10 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
        </div>
    );
}