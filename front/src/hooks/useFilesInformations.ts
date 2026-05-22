import allActurStore from "@/Store/allActurStore";
import AuthStore from "@/Store/AuthStore";
import useFilesStore from "@/Store/user/filesStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "https://mini-project-1-tcp9.onrender.com/api";

export function showTopFilesForUser(page: number, limit: number) {
    const { showTopFilesForUser } = useFilesStore();

    return useQuery({
        queryKey: ['topFilesForUser', page, limit],
        queryFn: () => showTopFilesForUser(page, limit),
        staleTime: 5 * 60 * 1000,
    });
}

export function useFilesLikes(page: number, limit: number) {
  const { fetchFilesLikes } = useFilesStore();

  return useQuery({
    queryKey: ["filesLikes", page, limit],
    queryFn: () => fetchFilesLikes(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}

export const useMyFiles = (page: number = 1, limit: number = 10, status: string = 'all') => {
  const { token } = AuthStore();
  return useQuery({
    queryKey: ['myFiles', page, limit, status],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/files/showMyFiles`, {
        params: { page, limit, show: status },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFileDetails = (id_file: number) => {
  const { showDetailFile } = allActurStore();
  const { token } = AuthStore();

  return useQuery({
    queryKey: ["file-details", id_file],
    queryFn: () => showDetailFile(Number(id_file)),
    enabled: !!id_file && !!token,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSearchFiles = (id_file: number) => {
  const { showDetailFile } = allActurStore();
  const { token } = AuthStore();

  return useQuery({
    queryKey: ["file-details", id_file],
    queryFn: () => showDetailFile(Number(id_file)),
    enabled: !!id_file && !!token,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDeleteMyFile = () => {
  const queryClient = useQueryClient();
  const { token } = AuthStore();

  return useMutation({
    mutationFn: async (id_file: number) => {
      const response = await axios.delete(`${API_URL}/files/deleteMeOwnfile/${id_file}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFiles'] });
      queryClient.invalidateQueries({ queryKey: ['topFilesForUser'] });
    },
  });
};

