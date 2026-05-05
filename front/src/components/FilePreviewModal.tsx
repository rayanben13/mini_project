"use client";

import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FileActions from "./fileAction";

export default function FilePreviewModal({ file }: { file: any }) {
    if (!file) return <p>Loading...</p>;

    const subject = file.subjects;

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
                                📅 {file.approved_at ? new Date(file.approved_at).toLocaleDateString() : "Not approved yet"}
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
                        <Link
                            href={file.file_path}
                            target="_blank"
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition"
                        >
                            Download
                        </Link>

                        <button className="p-2 border border-border rounded-xl hover:bg-muted transition">
                            Share
                        </button>

                        <button className="p-2 border border-border rounded-xl text-red-500 hover:bg-red-500/10 transition">
                            Report
                        </button>
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
                    fileId={file.id_file}
                    initialLikes={file.like || 0}
                    initialDislikes={file.dislike || 0}
                    initialStatusLike={file.statusLike}
                />
            </div>

            {/* ================= SIDEBAR ================= */}
            <aside className="w-full lg:w-[380px] p-4 lg:p-6 border-l border-border bg-card">

                <div className="rounded-2xl border border-border p-6 space-y-6 bg-background">

                    <h3 className="font-bold text-xl">Document Info</h3>

                    <div className="space-y-3 text-sm">

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subject</span>
                            <span className="text-primary font-bold">
                                {subject?.course}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Major</span>
                            <span>{subject?.major}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">University</span>
                            <span>{subject?.university}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Year</span>
                            <span>{subject?.academic_year}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Creation</span>
                            <span>{file.creation_year}</span>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* User */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">
                            Submitted by
                        </p>

                        <div className="flex items-center gap-3">
                            <Link
                                href={`/dashboard/user/${file.users?.id_user}`}
                                onClick={(e) => {
                                    if (file.users?.role === "admin") {
                                        e.preventDefault(); // 🔥 يمنع الانتقال
                                        toast.error("You can't see this profile");
                                    }
                                }}
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <div className="size-10 rounded-full overflow-hidden bg-muted relative border-2 border-transparent group-hover:border-primary transition-all">
                                    <Image
                                        src={file.users?.img_user || "/avatar.png"}
                                        alt={file.users?.fullname || "User"}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                <div>
                                    <p className="font-bold group-hover:text-primary transition-colors">
                                        {file.users?.fullname || "Unknown user"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        @{file.users?.username || "unknown"}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>

                </div>
            </aside>
        </main>
    );
}