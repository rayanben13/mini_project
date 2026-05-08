import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useFilesStatusStore from "../Store/admin/filesStatusStore";

// 1. جلب حالة الملفات العامة
export const useAdminFilesStatus = () => {
  const { fetchFilesStatus } = useFilesStatusStore();

  return useQuery({
    queryKey: ["admin-files-status"],
    queryFn: () => fetchFilesStatus(),
    staleTime: 5 * 60 * 1000, 
  });
};

// 2. جلب الملفات المعلقة مع دعم الصفحات والبحث
export const useAdminPendingFiles = (page = 1, limit = 10, search = "") => {
  const { fetchPendingFiles } = useFilesStatusStore();

  return useQuery({
    // إضافة page و search للـ queryKey تجعل التحديث تلقائياً عند تغيرهم
    queryKey: ["admin-files-pending", page, search], 
    queryFn: () => fetchPendingFiles(page, limit, search),
    staleTime: 1 * 60 * 1000, 
    // keepPreviousData: true, // مفيد جداً عند التنقل بين الصفحات لعدم ظهور الـ loading بشكل مزعج
  });
};

// 3. تعديل الحالة (Approve/Reject) - استخدام useMutation
export const useAdminApproveRejectFile = (
  id_file: number,
  status: string
) => {
  const queryClient = useQueryClient();
  const { approveRejectFile } = useFilesStatusStore();

  return useMutation({
    mutationFn: (reason?: string) =>
      approveRejectFile(id_file, status, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-files-pending"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-files-status"],
      });
    },
  });
};