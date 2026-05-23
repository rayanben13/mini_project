"use client";

import { ChevronRight, FileText, Folder, User } from "lucide-react";

interface AddedStudyListCardProps {
  readonly id: number;
  readonly title: string;
  readonly files: number;
  readonly userName: string;
  readonly course: string;
}

export default function AddedStudyListCard({
  title,
  files,
  userName,
  course,
}: AddedStudyListCardProps) {
  return (
    <div className="group relative flex items-center justify-between h-[110px] px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500/40">
      {/* LEFT */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* ICON */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Folder className="w-7 h-7" />
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* TITLE */}
          <h4 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h4>

          {/* META */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{files} files</span>
            </div>

            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{course}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{userName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ARROW */}
      <div className="ml-4 w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-slate-800 transition-all">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}
