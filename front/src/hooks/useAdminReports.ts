import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useReportedFilesStore from "../Store/admin/reportedFilesStore";

// 1. Fetch general status of reported files
export const useAdminReportedStatus = () => {
  const { fetchReportedFilesStatus } = useReportedFilesStore();

  return useQuery({
    queryKey: ["admin-reported-status"],
    queryFn: () => fetchReportedFilesStatus(),
    staleTime: 5 * 60 * 1000, 
  });
};

// 2. Fetch pending reported files (with pagination and section filter)
export const useAdminReportedFiles = (page = 1, limit = 10, section = "all") => {
  const { fetchFilesReported } = useReportedFilesStore();

  return useQuery({
    queryKey: ["admin-reported-files", page, section], 
    queryFn: () => fetchFilesReported(page, limit, section),
    staleTime: 1 * 60 * 1000, 
  });
};

// 3. Fetch specific report details for a file
export const useAdminReportDetails = (id_file: number | null) => {
  const { fetchReportedDetails } = useReportedFilesStore();

  return useQuery({
    queryKey: ["admin-report-details", id_file],
    queryFn: () => {
      if (!id_file) return null;
      return fetchReportedDetails(id_file);
    },
    enabled: !!id_file,
    staleTime: 1 * 60 * 1000,
  });
};

// 4. Update report status (Delete or Ignore)
export const useAdminDeleteOrIgnoreReport = () => {
  const queryClient = useQueryClient();
  const { deleteOrIgnoreReportedFile } = useReportedFilesStore();

  return useMutation({
    mutationFn: ({
      id_file,
      action,
      reason,
    }: {
      id_file: number;
      action: "delete" | "ignore";
      reason?: string;
    }) => deleteOrIgnoreReportedFile(id_file, action, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-reported-files"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-reported-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-report-details"],
      });
    },
  });
};
