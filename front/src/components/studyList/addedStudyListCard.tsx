"use client";

import {
    BookOpen,
    FlaskConical,
    Palette,
    Globe,
    Calculator,
    Folder,
    FileText,
    User,
    ChevronRight
} from "lucide-react";

interface AddedStudyListCardProps {
    readonly id: number;
    readonly title: string;
    readonly files: number;
    readonly userName: string;
    readonly likes?: number;
    readonly showSave?: boolean;
    readonly isAlreadySaved?: boolean;
}

// Helper to match subject icons perfectly to the mockup image
function getSubjectIcon(title: string) {
    const text = title.toLowerCase();
    if (text.includes("law") || text.includes("tort")) return BookOpen;
    if (text.includes("chem") || text.includes("bio") || text.includes("sci") || text.includes("organic") || text.includes("chemistry")) return FlaskConical;
    if (text.includes("art") || text.includes("paint") || text.includes("history") || text.includes("renaiss")) return Palette;
    if (text.includes("calc") || text.includes("math") || text.includes("algebra") || text.includes("calculus") || text.includes("intro to")) return Calculator;
    if (text.includes("spanish") || text.includes("english") || text.includes("globe") || text.includes("lang") || text.includes("world") || text.includes("intensive")) return Globe;
    return BookOpen; // Default to book open matching mockup screenshot
}

export default function AddedStudyListCard({
    title,
    files,
    userName,
}: AddedStudyListCardProps) {
    const IconComponent = getSubjectIcon(title);

    return (
        <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 min-h-[104px] cursor-pointer group">
            <div className="flex items-center gap-5 flex-1 min-w-0">
                {/* Clean blue icon container matching mockup */}
                <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50/50 dark:bg-blue-950/20 text-[#0975e6] dark:text-blue-400 flex items-center justify-center shrink-0">
                    <IconComponent className="w-6 h-6" strokeWidth={2.2} />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-slate-850 dark:text-slate-100 text-[16px] leading-tight truncate">
                        {title}
                    </h4>

                    {/* Metadata row matching mockup */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{files} Files</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">By {userName}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side chevron matching mockup */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 group-hover:text-[#0975e6] transition-all shrink-0">
                <ChevronRight className="w-5 h-5" />
            </div>
        </div>
    );
}