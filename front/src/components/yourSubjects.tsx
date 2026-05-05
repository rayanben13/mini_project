// components/SubjectCard.tsx
"use client";

import { cn } from '@/lib/utils';
import { ArrowRight, BookOpen, FlaskConical, Library, Microscope, Shapes } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

const themes = [
    {
        iconBg: "bg-blue-50 dark:bg-blue-900/30",
        iconText: "text-blue-500",
        tagBg: "bg-blue-500/10",
        tagText: "text-blue-500",
    },
    {
        iconBg: "bg-orange-50 dark:bg-orange-900/30",
        iconText: "text-orange-500",
        tagBg: "bg-[#0975e6]/10",
        tagText: "text-[#0975e6]",
    },
    {
        iconBg: "bg-green-50 dark:bg-green-900/30",
        iconText: "text-green-500",
        tagBg: "bg-green-500/10",
        tagText: "text-green-500",
    },
    {
        iconBg: "bg-red-50 dark:bg-red-900/30",
        iconText: "text-red-500",
        tagBg: "bg-red-500/10",
        tagText: "text-red-500",
    },
    {
        iconBg: "bg-purple-50 dark:bg-purple-900/30",
        iconText: "text-purple-500",
        tagBg: "bg-purple-500/10",
        tagText: "text-purple-500",
    },
];

// ✅ أيقونات متنوعة تتغير حسب الـ index
const icons = [Library, BookOpen, FlaskConical, Microscope, Shapes];

const SubjectCard = memo(({ subject, index }: { subject: any; index: number }) => {
    // ✅ اختيار الثيم والأيقونة بناءً على الـ index (يتكرر تلقائياً)
    const theme = themes[index % themes.length];
    const Icon = icons[index % icons.length];

    return (
        <Link
            href={`/subjects/${subject.id_subject}`}
            className="group p-6 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col gap-4 focus:outline-none focus:ring-2 focus:ring-[#0975e6]/50 h-full"
        >
            {/* الأيقونة والـ Level */}
            <div className="flex items-start justify-between">
                <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ease-out",
                    theme.iconBg
                )}>
                    <Icon className={cn("w-6 h-6", theme.iconText)} />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                    {subject.academic_year}
                </span>
            </div>

            {/* المحتوى */}
            <div className="mt-2 flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-white text-xl group-hover:text-[#0975e6] transition-colors line-clamp-1">
                    {subject.course}
                </h3>
                <p className="mt-2.5">
                    <span className={cn(
                        "px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider",
                        theme.tagBg,
                        theme.tagText
                    )}>
                        {subject.major}
                    </span>
                </p>
            </div>

            {/* Footer */}
            <div className="pt-5 mt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    {subject._count?.files ?? 0} {subject._count?.files === 1 ? 'File' : 'Files'}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:bg-[#0975e6] transition-colors duration-300">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </div>
        </Link>
    );
});

SubjectCard.displayName = "SubjectCard";

export default SubjectCard;