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
    title,
    files,
    userName,
}: AddedStudyListCardProps) {
    return (
        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between border border-slate-100 dark:border-slate-800/80 hover:shadow-md hover:border-[#ae1ce9]/20 transition-all duration-300 cursor-pointer group min-h-[104px]">
            <div className="flex items-center gap-5 flex-1 min-w-0">
                {/* Modern decorative folder icon with beautiful purple/blue gradient */}
                <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-[#0975e6]/10 to-[#ae1ce9]/10 dark:from-[#0975e6]/20 dark:to-[#ae1ce9]/20 flex items-center justify-center text-[#ae1ce9] dark:text-purple-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <Folder className="w-7 h-7 fill-[#ae1ce9]/20 dark:fill-[#ae1ce9]/40" strokeWidth={1.5} />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0 pr-6">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight truncate group-hover:text-[#ae1ce9] dark:group-hover:text-purple-400 transition-colors">
                        {title}
                    </h4>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span>{files} Files</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-[#0975e6] dark:text-blue-400" />
                            <span className="truncate">{userName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smooth transition chevron indicator */}
            <div className="w-10 h-10 ml-4 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#ae1ce9] group-hover:bg-[#ae1ce9]/5 dark:group-hover:bg-purple-500/10 transition-all duration-300 shrink-0">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" />
            </div>
        </div>
    );
}