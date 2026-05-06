import useNotificationStore from "../Store/user/notificationStore";

import { useQuery } from "@tanstack/react-query";




export function useMyNotificationsList(page: number = 1, limit: number = 10) {
  const { showMyNotifications } = useNotificationStore();
  return useQuery({
    queryKey: ["myNotificationsList", page, limit],
    queryFn: () => showMyNotifications(page, limit),
    staleTime: 5 * 60 * 1000,
  });
}