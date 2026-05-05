import { useRouter } from "next/navigation";
import AddedStudyListCard from "./studyList/addedStudyListCard";
import StudyListSkeleton from "./studyList/StudyListSkeleton";

export default function RenderState({ isLoading, data }: { isLoading: boolean; data: any }) {
    const router = useRouter();
    if (isLoading) return <StudyListSkeleton />;

    if (data?.data?.length) {
        return data.data.map((item: any) => <div key={item.id_stuList} onClick={() => router.push(`/dashboard/study-list/${item.id_stuList}`)}
        >
            <AddedStudyListCard
                title={item.name}
                files={item.count_files}
                userName={item.users.fullname}
            />
        </div>
        )
    }

}