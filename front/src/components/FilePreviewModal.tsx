"use client";

import allActurStore from "@/Store/allActurStore";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FileActions from "./fileAction";

import { useProfileDropdownData } from "@/hooks/useUserInformation";
import ReportDialog from "./reportingDialog";
import useAiStore from "@/Store/ai/aiStore";



export default function FilePreviewModal({ file }: { file: any }) {
    const { getShareLink, getDownloadFiles } = allActurStore();
    const { data: userInfo } = useProfileDropdownData()
    const { openAiWindow } = useAiStore();



    if (!file) return <p>Loading...</p>;

    const subject = file.subjects;


    const handleShare = async () => {
        const res = await getShareLink(file.id_file);
        if (res.success) {
            const shareUrl = res.data.link || res.data; // Handle both direct string and object
            navigator.clipboard.writeText(shareUrl);
            toast.success("Share link copied to clipboard!");
        } else {
            toast.error(res.message || "Failed to get share link");
        }
    };


    return (
        <main className="flex flex-1 flex-col lg:flex-row min-h-screen bg-background text-foreground">

            {/* ================= MAIN ================= */}
            <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">

                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>University Docs</span>
                    <span>›</span>
                    <span>{subject?.major || "Unknown"}</span>
                    <span>›</span>
                    <span className="font-semibold text-foreground">
                        {file.title}
                    </span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4">

                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl lg:text-3xl font-black">
                            {file.title}
                        </h1>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                                📅 {file.approved_at || "Not approved yet"}
                            </span>
                            <span>📄 {file.type}</span>
                            {file.status !== 'accepted' && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${file.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {file.status}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => getDownloadFiles(file.id_file)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition"
                        >
                            Download
                        </button>

                        <button
                            onClick={handleShare}
                            className="p-2 border border-border rounded-xl hover:bg-muted transition"
                        >
                            Share
                        </button>

                        {userInfo?.profileData?.role === "user" && <ReportDialog file={file} />}


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
                    userRole={userInfo?.profileData?.role || ""}
                    fileId={file.id_file}
                    initialLikes={file.like || 0}
                    initialDislikes={file.dislike || 0}
                    initialStatusLike={file.statusLike}
                />
            </div>

            {/* ================= SIDEBAR ================= */}
            <aside className="w-full lg:w-[380px] p-4 lg:p-6 border-l border-border bg-card flex flex-col gap-6">

                {userInfo?.profileData?.role === "user" && (
                    <button
                        onClick={() => openAiWindow(file.id_file)}
                        className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm"
                    >
                        <span className="text-xl">✨</span> Use AI with this document
                    </button>
                )}

                <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">

                    {/* Header */}
                    <h3 className="text-xs font-extrabold tracking-[0.25em] uppercase text-slate-400 mb-8">
                        Document Info
                    </h3>

                    <div className="space-y-6">

                        {/* Submitter */}
                        <div>
                            <p className="text-sm text-slate-400 mb-3">
                                Submitted by
                            </p>

                            <Link
                                href={`/dashboard/user/${file.users?.id_user}`}
                                onClick={(e) => {
                                    if (file.users?.role === "admin") {
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
                                            alt={file.users?.fullname || "User"}
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
                                        {file.users?.fullname || "Unknown user"}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        @{file.users?.username || "unknown"}
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-slate-800" />

                        {/* Subject */}
                        <div>
                            <p className="text-sm text-slate-400 mb-2">
                                Subject
                            </p>

                            <span className="inline-flex px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700 text-sm font-semibold">
                                {subject?.course}
                            </span>
                        </div>

                        {/* Info Fields */}
                        <div className="space-y-5">

                            <div>
                                <p className="text-sm text-slate-400">
                                    Major
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {subject?.major}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    University
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {subject?.university}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Academic Year
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {subject?.academic_year}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Type
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {file?.type}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Status
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {file?.status}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-400">
                                    Approved At
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {file?.approved_at}
                                </p>
                            </div>



                            <div>
                                <p className="text-sm text-slate-400">
                                    Creation Year
                                </p>

                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {file.creation_year}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </aside>
        </main>
    );
}