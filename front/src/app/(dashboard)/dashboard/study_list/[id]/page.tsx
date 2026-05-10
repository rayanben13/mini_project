"use client";

import SetReminder from "@/components/studyList/SetReminder";
import { Button } from "@/components/ui/button";
import useStudyListStore from "@/Store/user/studyListStore";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bookmark, FileText, Heart, Loader2, Trash2, FolderCog, Calendar, Share2, Plus, Check, BookOpen, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudyListForDashboard() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { showDetailStudyList, loveStudyList, deleteFileFromStudyList, addSetReminder, addStudylistToAddedSection } =
        useStudyListStore();

    const [details, setDetails] = useState<any>(null);
    const [loadingReminder, setLoadingReminder] = useState(false);

    // ✅ optimistic
    const [isLoved, setIsLoved] = useState<boolean | null>(null);
    const [isSaved, setIsSaved] = useState<boolean | null>(null);
    const [saving, setSaving] = useState(false);
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
            setIsSaved(details.studyListCard.isSaved);
            setLikes(details.studyListCard.count_loved || 0);
            setInitialized(true);
        }
    }, [details, initialized]);

    // 💾 save
    const handleSave = async () => {
        if (isSaved || saving) return;
        setSaving(true);
        try {
            const res = await addStudylistToAddedSection(id as string);
            if (res.success) {
                toast.success("Saved to library");
                setIsSaved(true);
                queryClient.invalidateQueries({ queryKey: ["addedStudyList"] });
                queryClient.invalidateQueries({ queryKey: ["recommendedStudyList"] });
            } else {
                toast.error(res.message);
            }
        } finally {
            setSaving(false);
        }
    };

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
                    </div>
                </div>
            </div>

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
                                {details.studyListCard.isOwner && (
                                    <Button
                                        variant="ghost"
                                        onClick={(e) => handleDeleteFile(e, file.id_file)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-xl size-10 p-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                )}
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
    );
}