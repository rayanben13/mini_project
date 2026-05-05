// hooks/useUserInformation.ts
"use client"
import useAuthStore from "@/Store/AuthStore";
import useUserStore from "@/Store/user/userStore";
import { useQuery } from "@tanstack/react-query";


export const useProfileDropdownData = () => {
  const { getMyInformation } = useUserStore();
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['userInformation', 'dropdown'], // مفتاح خاص بالهيدر
    queryFn: () => getMyInformation(true), // نرسل true هنا
    enabled: !!token ,
    staleTime: 10 * 60 * 1000, 
  });
};

// 2. للـ Dashboard (بيانات كاملة)
export const useFullUserData = () => {
  const { getMyInformation } = useUserStore();
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['userInformation', 'full'], // مفتاح خاص بالبيانات الكاملة
    queryFn: () => getMyInformation(false), // نرسل false هنا
    enabled: !!token ,    staleTime: 5 * 60 * 1000,
  });
};

export const useUserById = (id :number) => {
  const { ShowUserByid } = useUserStore();
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['userInformation', id], // مفتاح خاص بالبيانات الكاملة
    queryFn: () => ShowUserByid(id), // نرسل false هنا
    enabled: !!token, 
    staleTime: 5 * 60 * 1000,
  });
};