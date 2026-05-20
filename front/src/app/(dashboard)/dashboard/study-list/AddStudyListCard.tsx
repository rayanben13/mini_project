import { Plus } from "lucide-react";

export function AddStudyListCard({ onClick }: { onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#ae1ce9] dark:hover:border-purple-400 cursor-pointer group min-h-[104px] hover:bg-[#ae1ce9]/5 dark:hover:bg-[#ae1ce9]/5 transition-all duration-300 shadow-sm hover:shadow-md"
        >
            <div className="flex items-center gap-5">
                <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-[#0975e6]/10 to-[#ae1ce9]/10 dark:from-[#0975e6]/20 dark:to-[#ae1ce9]/20 flex items-center justify-center text-[#ae1ce9] dark:text-purple-400 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#0975e6] group-hover:to-[#ae1ce9] group-hover:text-white transition-all duration-300 shrink-0">
                    <Plus className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                    <h4 className="font-extrabold text-[#ae1ce9] dark:text-purple-400 text-lg leading-tight transition-colors">
                        Create Study List
                    </h4>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        Organize your files and notes in a beautiful collection
                    </p>
                </div>
            </div>
        </div>
    );
}