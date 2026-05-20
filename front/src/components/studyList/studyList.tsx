"use client";

import { useMyStudyList } from "@/hooks/useStudyList";
import { useRouter } from "next/navigation";
import StudyListCard from "./StudyListCard";
import StudyListSkeleton from "./StudyListSkeleton";
import { AddStudyListCard } from "@/app/(dashboard)/dashboard/study-list/AddStudyListCard";

export default function StudyList({ onOpenCreateModal }: { readonly onOpenCreateModal: () => void }) {
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

  const studyLists = myStudyList?.data || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {studyLists.map((item: any) => (
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

      {/* Render the Create List card directly inside the grid matching mockup exactly */}
      <AddStudyListCard onClick={onOpenCreateModal} />
    </div>
  );
}