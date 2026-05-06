"use client";

import useStudyListStore from "@/Store/user/studyListStore";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, FileText, Folder, Plus, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface AddedStudyListCardProps {
    readonly id: number;
    readonly title: string;
    readonly files: number;
    readonly userName: string;
    readonly likes?: number;
    readonly showSave?: boolean;
    readonly isAlreadySaved?: boolean;
}

export default function AddedStudyListCard({
    id,
    title,
    files,
    userName,
    likes = 0,
    showSave = false,
    isAlreadySaved = false,
}: AddedStudyListCardProps) {
    const { addStudylistToAddedSection, loveStudyList } = useStudyListStore();
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const res = await addStudylistToAddedSection(id);
            if (res.success) {
                toast.success("Saved to library");
                queryClient.invalidateQueries({ queryKey: ["addedStudyList"] });
                queryClient.invalidateQueries({ queryKey: ["recommendedStudyList"] });
            } else {
                toast.error(res.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 flex items-center justify-between border border-[#e0e2ec] dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group min-h-[104px] relative">
            <div className="flex items-center gap-5 flex-1">
                {/* حاوية الأيقونة */}
                <div className="w-[60px] h-[60px] rounded-2xl bg-[#f1f3fd] dark:bg-slate-800 flex items-center justify-center text-[#0975e6] dark:text-blue-400 group-hover:bg-[#0975e6]/10 dark:group-hover:bg-blue-400/20 transition-colors">
                    <Folder className="w-8 h-8 fill-[#d7e3ff] dark:fill-blue-900/40" strokeWidth={1.5} />
                </div>

                <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[17px] line-clamp-1 text-gray-900 dark:text-slate-100 group-hover:text-[#0975e6] dark:group-hover:text-blue-400">
                            {title}
                        </h4>

                        <div className="flex items-center gap-2">


                            {showSave && !isAlreadySaved && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={loading}
                                    onClick={handleSave}
                                    className="h-8 gap-1.5 rounded-full bg-[#f1f3fd] dark:bg-slate-800 text-[#0975e6] dark:text-blue-400 hover:bg-[#0975e6] hover:text-white dark:hover:bg-blue-600 transition-all font-bold text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Save
                                </Button>
                            )}

                            {showSave && isAlreadySaved && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                                    Saved
                                </span>
                            )}
                        </div>
                    </div>

                    {/* المعلومات الفرعية */}
                    <div className="flex items-center gap-4 text-[13px] text-[#74777f] dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{files} Files</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="line-clamp-1">{userName}</span>
                        </div>


                    </div>
                </div>
            </div>

            {/* سهم الانتقال */}
            <div className="w-10 h-10 ml-4 rounded-xl flex items-center justify-center text-[#74777f] dark:text-slate-500 group-hover:text-[#0975e6] dark:group-hover:text-blue-400 group-hover:bg-[#f1f3fd] dark:group-hover:bg-slate-800 transition-all shrink-0">
                <ChevronRight className="w-5 h-5" />
            </div>
        </div>
    );
}