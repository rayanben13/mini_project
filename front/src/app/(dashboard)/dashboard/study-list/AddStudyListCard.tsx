import { Plus } from "lucide-react";

export function AddStudyListCard({ onClick }: { onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-900 rounded-[24px] p-6 flex items-center justify-between border-2 border-dashed border-[#dbe3ff] dark:border-slate-800 hover:border-[#0975e6] dark:hover:border-blue-500 cursor-pointer group min-h-[104px] hover:bg-[#f8faff] dark:hover:bg-blue-900/10 transition-all"
        >
            <div className="flex items-center gap-5">
                <div className="w-[60px] h-[60px] rounded-2xl bg-[#f1f3fd] dark:bg-slate-800 flex items-center justify-center text-[#0975e6] dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Plus className="w-8 h-8" />
                </div>

                <div>
                    <h4 className="font-bold text-[#0975e6] dark:text-blue-400">Create Study List</h4>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Organize your files in a new list
                    </p>
                </div>
            </div>
        </div>
    );
}