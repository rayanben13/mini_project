"use client";

import { ChevronRight, FileText, Folder, User } from "lucide-react";

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

}: AddedStudyListCardProps) {



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