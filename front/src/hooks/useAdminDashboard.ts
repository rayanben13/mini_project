import { useQuery } from "@tanstack/react-query";
import useDashboardStore from "../Store/admin/dashboardStore"; // تأكد من المسار الصحيح

// 1. هوك الإحصائيات العامة (الأرقام)
export const useAdminDashboardStats = () => {
  const { fetchDashboardStatis } = useDashboardStore();

  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchDashboardStatis(),
    staleTime: 5 * 60 * 1000, // 5 دقائق كافية للإحصائيات العامة
  });
};

// 2. هوك الرسم البياني للتحميلات
export const useAdminDashboardGraph = () => {
  const { fetchUploadsOfFilesGraph } = useDashboardStore();

  return useQuery({
    queryKey: ["admin-graph-uploads"],
    queryFn: () => fetchUploadsOfFilesGraph(),
    staleTime: 5 * 60 * 1000,
  });
};

// 3. هوك أفضل 10 مساهمين
export const useAdminDashboardContributors = () => {
  const { fetchTop10Contributors } = useDashboardStore();

  return useQuery({
    queryKey: ["admin-top-contributors"],
    queryFn: () => fetchTop10Contributors(),
    staleTime: 10 * 60 * 1000, // بيانات المساهمين لا تتغير بسرعة كبيرة
  });
};