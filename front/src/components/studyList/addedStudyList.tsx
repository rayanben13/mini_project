import { useAddedStudyList } from "@/hooks/useStudyList";
import RenderState from "../renderState";

export default function AddedStudyList() {
    const { data: addedStudyList, isLoading } = useAddedStudyList();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-[104px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse border dark:border-slate-800"
                    />
                ))}
            </div>
        );
    }

    if (addedStudyList?.data?.length === 0) {
        return (
            <div className="space-y-4">
                <p className="text-center text-2xl dark:text-slate-300">No added study list found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            <RenderState isLoading={isLoading} data={addedStudyList} />


        </div>
    );
}