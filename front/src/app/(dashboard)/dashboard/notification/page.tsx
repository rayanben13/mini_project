"use client";

import { useMyNotificationsList } from "@/hooks/useNotifications";
import useNotificationStore from "@/Store/user/notificationStore";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function NotificationsPage() {
    const [page, setPage] = useState(1);
    const [allNotifications, setAllNotifications] = useState<any[]>([]);
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useMyNotificationsList(page);
    const router = useRouter();
    console.log("nn", data)

    const notifications = data?.data || [];
    const meta = data?.meta;

    const { markNotificationAsRead, deleteAllMyNotifications } = useNotificationStore();
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const handleDeleteAll = async () => {
        if (!allNotifications.length) return;
        setIsDeletingAll(true);
        // Optimistic clear
        setAllNotifications([]);
        const res = await deleteAllMyNotifications();
        setIsDeletingAll(false);
        if (res.success) {
            toast.success("All notifications deleted");
            queryClient.invalidateQueries({ queryKey: ["myNotificationsList"] });
        } else {
            toast.error(res.message || "Failed to delete notifications");
        }
    };

    // 🔥 دمج البيانات (pagination)
    useEffect(() => {
        if (!notifications.length) return;

        setAllNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id_notification));

            const newOnes = notifications.filter(
                (n: any) => !existingIds.has(n.id_notification)
            );

            return [...prev, ...newOnes];
        });
    }, [notifications]);

    const hasMore =
        meta && meta.current_page < meta.last_page;

    const handleNotificationClick = async (item: any) => {
        if (!item.is_read) {
            // Optimistic update
            setAllNotifications((prev) =>
                prev.map((n) =>
                    n.id_notification === item.id_notification
                        ? { ...n, is_read: true }
                        : n
                )
            );
            await markNotificationAsRead(item.id_notification);
            queryClient.invalidateQueries({ queryKey: ["myNotificationsList"] });
        }

        if (item.related_type === "user") {
            router.push(`/dashboard/user/${item.related_id}`);
        }
        else if (item.related_type === "file") {
            router.push(`/dashboard/${item.related_id}`);
        }
        else {
            router.push(`/dashboard/study-list/${item.related_id}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-4 md:p-8 xl:p-12 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto md:pb-20">

                {/* 🔵 Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 bg-primary rounded-full"></div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Recent Notifications
                        </h1>
                    </div>

                    <button
                        onClick={handleDeleteAll}
                        disabled={isDeletingAll || allNotifications.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-600 hover:border-red-200 rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isDeletingAll
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4 text-red-500" />
                        }
                        DELETE ALL
                    </button>
                </div>

                {/* 🔄 Loading أولي */}
                {isLoading && page === 1 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Loading notifications...
                        </p>
                    </div>
                )}

                {/* ❌ Error */}
                {error && (
                    <p className="text-center text-red-500 py-10">
                        Failed to load notifications
                    </p>
                )}

                {/* 📭 Empty */}
                {!isLoading && !error && allNotifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-slate-400" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                            No notifications yet
                        </h3>

                        <p className="text-slate-400 text-sm mt-1">
                            You're all caught up 🎉
                        </p>
                    </div>
                )}

                {/* ✅ List */}
                {allNotifications.length > 0 && (
                    <>
                        <div className="flex flex-col gap-3">
                            {allNotifications.map((item: any) => (
                                <div
                                    onClick={() => handleNotificationClick(item)}
                                    key={item.id_notification}
                                    className={`p-4 sm:p-5 rounded-[2rem] flex items-center justify-between border cursor-pointer transition-all duration-200 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-primary/30 ${!item.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : ''}`}
                                >
                                    {/* Left */}
                                    <div className="flex items-start sm:items-center gap-4 max-w-[90%]">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Bell className="w-5 h-5" />
                                        </div>

                                        <div>
                                            <p className={`text-slate-800 dark:text-slate-200 ${!item.is_read ? 'font-semibold' : ''}`}>
                                                {item.content || item.message}
                                            </p>

                                            {item.reason && (
                                                <p className="text-xs text-red-500 font-bold">
                                                    {item.reason}
                                                </p>
                                            )}

                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                {item.time || item.created_at}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    {!item.is_read && (
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full mr-2 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 🔥 Show More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={isFetching}
                                    className="px-6 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all flex items-center gap-2"
                                >
                                    {isFetching ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        "Show More"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NotificationsPage;