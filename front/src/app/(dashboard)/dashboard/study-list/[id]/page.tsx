"use client";

import SetReminder from "@/components/studyList/SetReminder";
import { Button } from "@/components/ui/button";
import useStudyListStore from "@/Store/user/studyListStore";
import { Bell, FileText, Heart, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudyListDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const { showDetailStudyList, loveStudyList, deleteFileFromStudyList, addSetReminder } =
        useStudyListStore();

    const [details, setDetails] = useState<any>(null);
    const [loadingReminder, setLoadingReminder] = useState(false);

    // ✅ optimistic
    const [isLoved, setIsLoved] = useState<boolean | null>(null);
    const [likes, setLikes] = useState(0);
    const [initialized, setInitialized] = useState(false);

    const handleReminder = async (date: string, time: string) => {
        setLoadingReminder(true);

        const res = await addSetReminder(id, date, time);

        setLoadingReminder(false);

        if (res.success) {
            toast.success("Reminder set successfully!");
        } else {
            toast.error(res.message || "Failed to set reminder");
        }
    };

    // 📦 fetch
    useEffect(() => {
        if (id) {
            (async () => {
                const res = await showDetailStudyList(id);
                if (res.success) setDetails(res.data);
            })();
        }
    }, [id]);

    // 🔄 sync once
    useEffect(() => {
        if (details?.studyListCard && !initialized) {
            setIsLoved(details.studyListCard.isLoved);
            setLikes(details.studyListCard.count_loved || 0);
            setInitialized(true);
        }
    }, [details, initialized]);

    // ❤️ optimistic like
    const handleLove = async () => {
        if (isLoved === null) return;

        const prevLoved = isLoved;
        const prevLikes = likes;

        setIsLoved(!prevLoved);
        setLikes(prevLoved ? likes - 1 : likes + 1);

        const res = await loveStudyList(id);

        if (!res.success) {
            setIsLoved(prevLoved);
            setLikes(prevLikes);
            toast.error("Failed");
        }
    };

    // 🗑 delete file
    const handleDeleteFile = async (e: React.MouseEvent, fileId: number) => {
        e.stopPropagation();

        const prevFiles = details.FilesStudylist;

        setDetails((prev: any) => ({
            ...prev,
            FilesStudylist: prev.FilesStudylist.filter(
                (f: any) => f.id_file !== fileId
            ),
        }));

        const res = await deleteFileFromStudyList(id, fileId);

        if (!res.success) {
            setDetails((prev: any) => ({
                ...prev,
                FilesStudylist: prevFiles,
            }));
            toast.error("Delete failed");
        }
    };

    // ⏳ loading
    if (!details || isLoved === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="space-y-4 border-b pb-6 dark:border-slate-800">

                {/* TOP ROW */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold dark:text-slate-100">
                        {details.studyListCard.name}
                    </h1>

                    <div className="flex items-center gap-2">

                        {/* ❤️ Love */}
                        <Button
                            onClick={handleLove}
                            variant="ghost"
                            className={`gap-2 rounded-full px-4 py-2
                ${isLoved
                                    ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                                    : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isLoved ? "fill-current" : ""}`} />
                            {likes}
                        </Button>

                        {/* ⏰ Reminder */}
                        <SetReminder
                            isActive={details.studyListCard.isAddReminder}
                            initialDate={details.studyListCard.reminder_date}
                            initialTime={details.studyListCard.reminder_time}
                            loading={loadingReminder}
                            onSave={handleReminder}
                        />
                    </div>
                </div>

                {/* INFO ROW */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">

                    {/* 📄 Files count */}
                    <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {details.studyListCard.count_files} Files
                    </div>

                    {/* 🔔 Reminder info */}
                    {details.studyListCard.isAddReminder && (
                        <div className="flex items-center gap-1 text-blue-500 font-medium">
                            <Bell className="w-4 h-4" />
                            Next study: {details.studyListCard.reminder_time}
                        </div>
                    )}
                </div>

                {/* DESCRIPTION */}
                {details.studyListCard.description && (
                    <p className="text-gray-600 dark:text-slate-400">
                        {details.studyListCard.description}
                    </p>
                )}
            </div>

            {/* FILES */}
            <div className="grid gap-4">
                {details.FilesStudylist?.map((file: any) => (
                    <div
                        key={file.id_file}
                        onClick={() => router.push(`/dashboard/${file.id_file}`)}
                        className="flex justify-between items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
                        <span>{file.title}</span>

                        <Button
                            variant="ghost"
                            onClick={(e) => handleDeleteFile(e, file.id_file)}
                            className="text-red-500"
                        >
                            <Trash2 />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}