"use client";

import SetReminder from "@/components/studyList/SetReminder";
import { Button } from "@/components/ui/button";
import useStudyListStore from "@/Store/user/studyListStore";
import { Bell, FileText, Heart, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudyListForDashboard() {
    const { id } = useParams();
    const router = useRouter();

    const { showDetailStudyList, loveStudyList, addSetReminder } =
        useStudyListStore();

    const [data, setData] = useState<any>(null);
    const [isLoved, setIsLoved] = useState<boolean | null>(null);
    const [likes, setLikes] = useState(0);
    const [loadingReminder, setLoadingReminder] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // 📦 fetch
    useEffect(() => {
        if (!id) return;

        (async () => {
            const res = await showDetailStudyList(id);
            if (res.success) setData(res.data);
        })();
    }, [id]);

    // 🔄 init state
    useEffect(() => {
        if (data?.studyListCard && !initialized) {
            setIsLoved(data.studyListCard.isLoved);
            setLikes(data.studyListCard.count_loved || 0);
            setInitialized(true);
        }
    }, [data, initialized]);

    // ❤️ love
    const handleLove = async () => {
        if (isLoved === null) return;

        const prev = isLoved;
        const prevLikes = likes;

        setIsLoved(!prev);
        setLikes(prev ? likes - 1 : likes + 1);

        const res = await loveStudyList(id);

        if (!res.success) {
            setIsLoved(prev);
            setLikes(prevLikes);
        }
    };

    // ⏰ reminder
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

    if (!data || isLoved === null) {
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
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold dark:text-slate-100">
                        {data.studyListCard.name}
                    </h1>

                    <div className="flex items-center gap-2">

                        {/* REMINDER */}
                        <SetReminder
                            isActive={data.studyListCard.isAddReminder}
                            initialDate={data.studyListCard.reminder_date}
                            initialTime={data.studyListCard.reminder_time}
                            loading={loadingReminder}
                            onSave={handleReminder}
                        />

                        {/* LOVE */}
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
                    </div>
                </div>

                {/* INFO */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {data.studyListCard.count_files} Files
                    </div>

                    {data.studyListCard.isAddReminder && (
                        <div className="flex items-center gap-1 text-blue-500 font-medium">
                            <Bell className="w-4 h-4" />
                            Next: {data.studyListCard.reminder_time}
                        </div>
                    )}
                </div>
            </div>

            {/* FILES */}
            <div className="grid gap-4">
                {data.FilesStudylist?.map((file: any) => (
                    <div
                        key={file.id_file}
                        onClick={() => router.push(`/dashboard/${file.id_file}`)}
                        className="flex justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
                        <span>{file.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}