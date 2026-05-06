"use client";

import { usePathname, useRouter } from "next/navigation";
import AddedStudyListCard from "./studyList/addedStudyListCard";
import StudyListSkeleton from "./studyList/StudyListSkeleton";

interface RenderStateProps {
    readonly isLoading: boolean;
    readonly data: any;
    readonly showSave?: boolean;
}


export default function RenderState({
    isLoading,
    data,
    showSave = false
}: RenderStateProps) {
    const router = useRouter();
    const pathname = usePathname();


    if (isLoading) return <StudyListSkeleton />;

    if (data?.data?.length) {
        return data.data.map((item: any) => (
            <div
                key={item.id_stuList}
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest("[data-stop]")) return;
                    router.push(`${pathname.includes('study-list') ? `/dashboard/study-list/${item.id_stuList}` : `/dashboard/study_list/${item.id_stuList}`}`)
                }}
            >
                <AddedStudyListCard
                    id={item.id_stuList}
                    title={item.name}
                    files={item.count_files}
                    userName={item.users?.fullname || "Unknown"}
                    likes={item.count_likes || 0}
                    showSave={showSave}
                    isAlreadySaved={item.isSaved}
                />
            </div>
        ));
    }

    return null;
}