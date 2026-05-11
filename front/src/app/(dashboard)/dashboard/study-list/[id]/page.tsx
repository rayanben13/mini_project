"use client";

import SetReminder from "@/components/studyList/SetReminder";
import useStudyListStore from "@/Store/user/studyListStore";
import { BadgeCheck, Bookmark, FileText, Heart, Loader2, Trash2, FolderCog, Calendar, Share2, Plus, Check, BookOpen, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudyListDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const { showDetailStudyList, loveStudyList, deleteFileFromStudyList, addSetReminder, addStudylistToAddedSection } =
        useStudyListStore();

    const [details, setDetails] = useState<any>(null);
    const [loadingReminder, setLoadingReminder] = useState(false);

    // ✅ optimistic
    const [isLoved, setIsLoved] = useState<boolean | null>(null);
    const [isSaved, setIsSaved] = useState<boolean | null>(null);
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
            setIsSaved(details.studyListCard.isSaved);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-[#0975e6]" />
                <p className="mt-4 text-slate-500 font-medium">Loading details...</p>
            </div>
        );
    }

<<<<<<< HEAD

    return (
        <div className="min-h-screen">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-14">

                {/* HEADER */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden mb-10">

                    {/* BG EFFECT */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#0975e6]/5 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">

                        {/* LEFT */}
                        <div className="flex flex-col sm:flex-row gap-5 flex-1">

                            {/* ICON */}
                            <div className="w-20 h-20 rounded-2xl bg-[#0975e6]/10 flex items-center justify-center shrink-0">
                                <FileText className="w-10 h-10 text-[#0975e6]" />
                            </div>

                            {/* INFO */}
                            <div className="space-y-4 flex-1">

                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                        {details.studyListCard.name}
                                    </h1>

                                    <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                                        {details.studyListCard.description ||
                                            "No description available."}
                                    </p>
                                </div>

                                {/* META */}
                                <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-500 dark:text-slate-400">

                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-4 h-4" />
                                        {likes} Likes
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" />
                                        {details.studyListCard.count_files} Files
                                    </div>

                                    {details.studyListCard.isAddReminder && (
                                        <div className="flex items-center gap-1.5 text-[#0975e6]">
                                            <Bell className="w-4 h-4" />
                                            {details.studyListCard.reminder_time}
                                        </div>
                                    )}
                                </div>

                                {/* OWNER */}
                                <div className="flex items-center gap-3 mt-4">
                                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                                        Created by:
                                    </span>

                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">

                                        {/* Avatar */}
                                        <div className="w-7 h-7 rounded-full bg-[#0975e6]/10 text-[#0975e6] flex items-center justify-center text-xs font-black uppercase">
                                            {details.studyListCard.users?.fullname?.charAt(0)}
                                        </div>

                                        {/* Name */}
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {details.studyListCard.users?.fullname}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-start gap-3">


                            {/* REMINDER */}
                            <SetReminder
                                isActive={details.studyListCard.isAddReminder}
                                initialDate={details.studyListCard.reminder_date}
                                initialTime={details.studyListCard.reminder_time}
                                loading={loadingReminder}
                                onSave={handleReminder}
                            />

                            {/* LOVE */}
                            <button
                                onClick={handleLove}
                                className={`
                                p-3 rounded-full border transition-all
                                ${isLoved
                                        ? "bg-red-50 text-red-500 border-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500"
                                    }
                            `}
                            >
                                <Heart
                                    className={`w-5 h-5 ${isLoved ? "fill-current" : ""}`}
                                />
                            </button>
                        </div>
=======
    const createdAt = details.studyListCard.created_at || details.studyListCard.createdAt;
    const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 12, 2023';

    return (
        <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-32">
            {/* Hero Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800 mb-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                        <FolderCog className="w-10 h-10" />
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {details.studyListCard.name}
                            </h1>
                            {details.studyListCard.description && (
                                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mt-3 max-w-3xl">
                                    {details.studyListCard.description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> {likes >= 1000 ? (likes / 1000).toFixed(1) + 'k' : likes} Likes</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formattedDate}</span>
                            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {details.studyListCard.count_files} Resources</span>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Created By:</span>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-full py-1.5 px-4">
                                <Avatar className="w-6 h-6">
                                    <AvatarImage src={details.studyListCard.users?.profile_pic || details.studyListCard.user?.profile_pic || ""} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">{details.studyListCard.users?.fullname?.charAt(0) || details.studyListCard.user?.fullname?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {details.studyListCard.users?.fullname || details.studyListCard.user?.fullname || "Unknown User"}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-6">
                            {!details.studyListCard.isOwner && (
                                <Button 
                                    onClick={handleSave} 
                                    variant="outline" 
                                    className="rounded-full w-12 h-12 p-0 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <Check className="w-5 h-5 text-emerald-500" /> : <Plus className="w-5 h-5" />}
                                </Button>
                            )}
                            
                            <SetReminder
                                isActive={details.studyListCard.isAddReminder}
                                initialDate={details.studyListCard.reminder_date}
                                initialTime={details.studyListCard.reminder_time}
                                loading={loadingReminder}
                                onSave={handleReminder}
                                className="rounded-full w-12 h-12 p-0 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center"
                                iconOnly={true}
                            />

                            <Button 
                                variant="outline" 
                                className="rounded-full w-12 h-12 p-0 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Link copied to clipboard!");
                                }}
                            >
                                <Share2 className="w-5 h-5" />
                            </Button>

                            <Button 
                                onClick={handleLove} 
                                variant="outline" 
                                className={`rounded-full w-12 h-12 p-0 border-slate-200 dark:border-slate-700 transition-colors ${
                                    isLoved 
                                        ? 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isLoved ? 'fill-current' : ''}`} />
                            </Button>
                        </div>
>>>>>>> d55b84205cf548b1a0863c35fe60e93170380fb0
                    </div>
                </div>
            </div>

<<<<<<< HEAD
                {/* SECTION TITLE */}
                <div className="flex items-center gap-2 mb-6 px-1">
                    <span className="w-1 h-6 bg-[#0975e6] rounded-full" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Study Materials
                    </h2>
                </div>

                {/* FILES */}
                <div className="flex flex-col gap-5">

                    {details.FilesStudylist?.map((file: any) => (
                        <div
                            key={file.id_file}
                            onClick={() =>
                                router.push(`/dashboard/${file.id_file}`)
                            }
                            className="
                            bg-white dark:bg-slate-900
                            rounded-3xl overflow-hidden
                            border border-slate-100 dark:border-slate-800
                            shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
                            hover:shadow-lg
                            transition-all
                            flex flex-col md:flex-row
                            group cursor-pointer
                        "
                        >

                            {/* LEFT ICON */}
                            <div className="w-full md:w-44 h-32 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center shrink-0">
                                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>

                            {/* CONTENT */}
                            <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                                <div className="space-y-2">

                                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#0975e6]/10 text-[10px] font-black tracking-wider uppercase text-[#0975e6]">
                                        {file.type_file || "FILE"}
                                    </span>

                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                        {file.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {file?.subjects?.course || "Unknown course"}
                                    </p>
                                </div>

                                {/* ACTION */}
                                {details?.studyListCard?.isOwner && (
                                    <div className="flex items-center gap-3 ml-auto">

                                        <button
                                            onClick={(e) =>
                                                handleDeleteFile(e, file.id_file)
                                            }
                                            className="
                                        p-2 rounded-full
                                        text-red-500
                                        hover:bg-red-50
                                        dark:hover:bg-red-500/10
                                        transition
                                    "
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
=======
            {/* Study Materials Section */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Study Materials</h3>
            </div>

            <div className="grid gap-4">
                {details.FilesStudylist?.map((file: any) => {
                    const isImage = file.type?.toLowerCase() === 'image' || file.title?.match(/\.(jpg|jpeg|png|gif)$/i);
                    const isDoc = file.type?.toLowerCase() === 'document' || file.title?.match(/\.(doc|docx|pdf|txt)$/i);
                    const Icon = isImage ? ImageIcon : (isDoc ? FileText : BookOpen);
                    const iconColorClass = isImage ? 'text-orange-400 group-hover:text-orange-500 group-hover:bg-orange-50' : (isDoc ? 'text-blue-400 group-hover:text-blue-500 group-hover:bg-blue-50' : 'text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50');

                    return (
                        <div
                            key={file.id_file}
                            onClick={() => router.push(`/dashboard/${file.id_file}`)}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-5 overflow-hidden">
                                <div className={`size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 transition-colors ${iconColorClass}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    {/* Tag */}
                                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-wider mb-2 uppercase">
                                        {file.module_name || file.subject_name || 'BIOLOGY'}
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{file.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                        {file.subject_name || 'Resource'} • {file.type || (isDoc ? 'Document' : isImage ? 'Image' : 'File')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <Button
                                    variant="ghost"
                                    onClick={(e) => handleDeleteFile(e, file.id_file)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-xl size-10 p-0"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    );
                })}
                {details.FilesStudylist?.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <FolderCog className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No study materials yet</h4>
                        <p className="text-slate-500">Resources added to this study list will appear here.</p>
                    </div>
                )}
            </div>
        </main>
>>>>>>> d55b84205cf548b1a0863c35fe60e93170380fb0
    );
}