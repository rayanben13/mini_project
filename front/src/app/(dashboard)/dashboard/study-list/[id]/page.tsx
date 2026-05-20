"use client";

import SetReminder from "@/components/studyList/SetReminder";
import useStudyListStore from "@/Store/user/studyListStore";
import { Bell, BookOpen, FileText, Heart, Loader2, Trash2 } from "lucide-react";
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

    // ✅ optimistic states
    const [isLoved, setIsLoved] = useState<boolean | null>(null);
    const [likes, setLikes] = useState(0);
    const [initialized, setInitialized] = useState(false);

    const handleReminder = async (date: string, time: string) => {
        setLoadingReminder(true);

        const res = await addSetReminder(id, date, time);

        setLoadingReminder(false);

        if (res.success) {
            // ✅ update local state
            setDetails((prev: any) => ({
                ...prev,
                studyListCard: {
                    ...prev.studyListCard,
                    isAddReminder: true,
                    reminder_date: date,
                    reminder_time: time,
                },
            }));

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
            toast.error("Failed to update likes");
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
            toast.error("Failed to delete file from study list");
        } else {
            toast.success("File removed from study list successfully!");
        }
    };

    // ⏳ loading spinner
    if (!details || isLoved === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#ae1ce9]" />
                <p className="mt-2 text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-1 md:px-2 py-2 animate-in fade-in duration-500">
            <main className="space-y-10">

                {/* 🌟 Premium Collection Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                    {/* Modern purple/blue background glowing accent */}
                    <div className="absolute -top-12 -right-12 w-60 h-60 bg-gradient-to-br from-[#0975e6]/10 to-[#ae1ce9]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                        {/* LEFT SECTION */}
                        <div className="flex flex-col sm:flex-row gap-6 flex-1 min-w-0">
                            {/* Premium Icon Wrapper */}
                            <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-[#0975e6]/15 to-[#ae1ce9]/15 dark:from-[#0975e6]/25 dark:to-[#ae1ce9]/25 flex items-center justify-center shrink-0 text-[#ae1ce9] dark:text-purple-400 shadow-inner">
                                <BookOpen className="w-10 h-10" />
                            </div>

                            {/* TEXT INFO */}
                            <div className="space-y-4 flex-1 min-w-0">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white leading-tight">
                                        {details.studyListCard.name}
                                    </h1>
                                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                                        {details.studyListCard.description || "No description available for this study list."}
                                    </p>
                                </div>

                                {/* META METRICS */}
                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <Heart className={`w-4 h-4 ${isLoved ? "text-rose-500 fill-current animate-pulse" : "text-slate-400"}`} />
                                        <span>{likes} Likes</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                        <FileText className="w-4 h-4 text-[#ae1ce9]" />
                                        <span>{details.studyListCard.count_files} Files</span>
                                    </div>

                                    {details.studyListCard.isAddReminder && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0975e6]/10 text-[#0975e6] dark:text-blue-400">
                                            <Bell className="w-4 h-4 animate-bounce" />
                                            <span>{details.studyListCard.reminder_time}</span>
                                        </div>
                                    )}
                                </div>

                                {/* CREATOR PILL */}
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">
                                        Collection Creator:
                                    </span>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                                        <div className="w-6 h-6 rounded-full bg-[#ae1ce9] text-white flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                                            {details.studyListCard.users?.fullname?.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {details.studyListCard.users?.fullname}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT ACTIONS */}
                        <div className="flex items-center gap-3.5 self-stretch lg:self-auto shrink-0">
                            {/* REMINDER MODAL TRIGGER */}
                            <SetReminder
                                isActive={details.studyListCard.isAddReminder}
                                initialDate={details.studyListCard.reminder_date}
                                initialTime={details.studyListCard.reminder_time}
                                loading={loadingReminder}
                                onSave={handleReminder}
                            />

                            {/* LOVE BUTTON */}
                            <button
                                onClick={handleLove}
                                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center shrink-0 ${
                                    isLoved
                                        ? "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20"
                                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/20 shadow-sm"
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isLoved ? "fill-current" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 📂 study list items title */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1">
                        <span className="w-1.5 h-6 bg-[#ae1ce9] rounded-full animate-pulse" />
                        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                            Study Materials
                        </h2>
                    </div>

                    {/* FILES ITEMS LIST */}
                    <div className="grid grid-cols-1 gap-4">
                        {details.FilesStudylist?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                                <FileText className="w-10 h-10 mb-2 stroke-[1.5]" />
                                <p className="text-sm font-semibold uppercase tracking-wider">This study list is empty</p>
                            </div>
                        ) : (
                            details.FilesStudylist?.map((file: any) => (
                                <div
                                    key={file.id_file}
                                    onClick={() => router.push(`/dashboard/${file.id_file}`)}
                                    className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-[#ae1ce9]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center p-4 gap-5 cursor-pointer group"
                                >
                                    {/* Gradient type indicator thumbnail cover */}
                                    <div className="w-full sm:w-28 h-24 rounded-2xl bg-gradient-to-br from-[#0975e6]/5 to-[#ae1ce9]/5 dark:from-[#0975e6]/10 dark:to-[#ae1ce9]/10 flex items-center justify-center shrink-0 text-[#ae1ce9] dark:text-purple-400 shadow-inner group-hover:scale-102 transition-transform duration-300">
                                        <FileText className="w-8 h-8 fill-purple-500/5" strokeWidth={1.5} />
                                    </div>

                                    {/* CONTENT DESCRIPTION */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#ae1ce9]/10 text-[10px] font-black tracking-wider uppercase text-[#ae1ce9]">
                                                {file.type_file || "FILE"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-extrabold text-slate-850 dark:text-slate-100 leading-snug truncate group-hover:text-[#ae1ce9] dark:group-hover:text-purple-400 transition-colors">
                                            {file.title}
                                        </h3>

                                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                            Subject: <span className="text-[#0975e6] dark:text-blue-400">{file?.subjects?.course || "General Subject"}</span>
                                        </p>
                                    </div>

                                    {/* DELETE ACTION BUTTON */}
                                    {details?.studyListCard?.isOwner && (
                                        <div className="flex items-center justify-end pr-2">
                                            <button
                                                onClick={(e) => handleDeleteFile(e, file.id_file)}
                                                className="p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 transition-all duration-300 shrink-0"
                                                title="Remove from list"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}