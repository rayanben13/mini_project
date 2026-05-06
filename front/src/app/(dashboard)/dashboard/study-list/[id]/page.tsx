"use client";

import useStudyListStore from "@/Store/user/studyListStore";
import { FileText, Heart, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudyListDetailPage() {
    const { id } = useParams();
    const { showDetailStudyList, loading } = useStudyListStore();
    const [details, setDetails] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        if (id) {
            const fetchDetails = async () => {
                const result = await showDetailStudyList(id);
                if (result.success) {
                    setDetails(result.data);
                }
            };
            fetchDetails();
        }
    }, [id, showDetailStudyList]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading details...</p>
            </div>
        );
    }

    if (!details) return <p className="text-center py-10">No details found.</p>;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="space-y-2 border-b dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                    {details.name}
                </h1>
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {details.count_files} Files</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {details.count_likes} Likes</span>
                </div>
            </div>

            {/* Files List Section */}
            <div className="grid gap-4">
                <h3 className="font-semibold text-lg">Files in this list:</h3>
                {details.FilesStudylist?.length > 0 ? (
                    details.FilesStudylist.map((file: any) => (
                        <div
                            key={file.id_file}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                            onClick={() => router.push(`/dashboard/${file.id_file}`)} // التوجيه لصفحة الملف
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="text-blue-500" />
                                <span className="font-medium dark:text-slate-200">{file.title}</span>
                            </div>
                            <div className="text-primary text-sm font-bold flex items-center gap-1">
                                Open Details
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground italic text-sm">This list has no files yet.</p>
                )}
            </div>
        </div>
    );
}