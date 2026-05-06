"use client"
import useFilesStore from "@/Store/user/filesStore";
import useStudyListStore from "@/Store/user/studyListStore";
import { useQuery } from "@tanstack/react-query";

export const useFilesUserById = (id_user: number, page: number = 1, limit: number = 10) => {
  const { showFilesUserById } = useFilesStore();

  return useQuery({
    queryKey: ['user-files', id_user, page, limit],
    queryFn: () => showFilesUserById(id_user, { page, limit }),
    enabled: !!id_user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudyListsUserById = (id_user: number, page: number = 1, limit: number = 10) => {
  const { showStudyListUserById } = useStudyListStore();

  return useQuery({
    queryKey: ['user-studylists', id_user, page, limit],
    queryFn: () => showStudyListUserById(id_user, { page, limit }),
    enabled: !!id_user,
    staleTime: 5 * 60 * 1000,
  });
};
