import useSubjectsStore from "@/Store/user/subjectsStore";
import { useQuery } from "@tanstack/react-query";

export function useYourSubjects(page: number, limit: number) {
  const { yourSubjects } = useSubjectsStore();

  return useQuery({
    queryKey: ["yourSubjects", page, limit],
    queryFn: () => yourSubjects(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}
export function useSubjectDetails(id: number) {
  const { showDetailSubject } = useSubjectsStore();

  return useQuery({
    queryKey: ["subjectDetails", id],
    queryFn: () => showDetailSubject(id),
    staleTime: 5 * 60 * 1000,
  });
}