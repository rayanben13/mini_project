import { PlusCircle } from "lucide-react";

export function AddStudyListCard({ onClick }: { onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white/10 dark:bg-slate-900/10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex items-center justify-center cursor-pointer hover:border-[#0975e6] dark:hover:border-blue-400 hover:bg-blue-50/10 transition-all duration-200 min-h-[104px] group"
        >
            <div className="flex items-center gap-3 font-semibold text-slate-500 dark:text-slate-400 group-hover:text-[#0975e6] dark:group-hover:text-blue-400 transition-colors text-sm">
                <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-[#0975e6] transition-colors" strokeWidth={2} />
                <span>Create New List</span>
            </div>
        </div>
    );
}