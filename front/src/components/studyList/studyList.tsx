"use client";

import { useMyStudyList } from "@/hooks/useStudyList";
import { useRouter } from "next/navigation";
import StudyListCard from "./StudyListCard";
import StudyListSkeleton from "./StudyListSkeleton";

export default function StudyList() {
  const { data: myStudyList, isLoading, error } = useMyStudyList();
  const router = useRouter();

  if (isLoading) return <StudyListSkeleton />;

  if (error) {
    return (
      <p className="text-red-500 text-center dark:text-red-400">
        Something went wrong
      </p>
    );
  }

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

  if (!myStudyList?.data?.length) {
    return (
      <div className="space-y-4">
        <p className="text-center text-2xl dark:text-slate-300">No study list found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {myStudyList.data.map((item: any) => (
        <div

          key={item.id_stuList}

          onClick={(e) => {
            if ((e.target as HTMLElement).closest("[data-stop]")) return;
            router.push(`/dashboard/study-list/${item.id_stuList}`)
          }}
        >
          <StudyListCard
            id={item.id_stuList}
            title={item.name}
            description={item.description}
            privacy={item.privacy}
            files={item.count_files}
            likes={item.count_likes || 0}
            isLoved={item.isLoved || false}
          />
        </div>
      ))}
    </div>
  );
}