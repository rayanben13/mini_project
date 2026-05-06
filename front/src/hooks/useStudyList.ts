import useStudyListStore from "@/Store/user/studyListStore";
import { useQuery } from "@tanstack/react-query";

export function useRecommendedStudyList(page: number = 1, limit: number = 10) {
  const { showRecommendedStudyList } = useStudyListStore();

  return useQuery({
    queryKey: ["recommendedStudyList", page, limit],
    queryFn: () => showRecommendedStudyList(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}
export function useMyStudyList(page: number = 1, limit: number = 10) {
  const { showMyStudyList } = useStudyListStore();

  return useQuery({
    queryKey: ["myStudyList", page, limit],
    queryFn: () => showMyStudyList(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}


export function useAddedStudyList(page: number = 1, limit: number = 10) {
  const { showAddedStudyList } = useStudyListStore();

  return useQuery({
    queryKey: ["addedStudyList", page, limit],
    queryFn: () => showAddedStudyList(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}