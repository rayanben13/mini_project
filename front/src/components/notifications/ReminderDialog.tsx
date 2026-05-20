"use client";

import useAuthStore from "@/Store/AuthStore";
import useNotificationSocketStore from "@/Store/user/useNotificationSocketStore";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useFullUserData } from "@/hooks/useUserInformation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Bell, BookOpen, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ReminderDialog() {
    const { notifications, initializeSocket } = useNotificationSocketStore();
    const { isAuthenticated } = useAuthStore();
    const { data: userData } = useFullUserData();
    const [isOpen, setIsOpen] = useState(false);
    const [activeReminder, setActiveReminder] = useState<any>(null);
    const lastNotificationId = useRef<any>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Initialize socket when authenticated
    useEffect(() => {
        // Extract userId based on potential API response structures
        const userId =
            userData?.profileData?.id_user ||
            userData?.result?.information?.id_user ||
            userData?.id_user;

        if (isAuthenticated && userId) {
            initializeSocket(userId);
        }
    }, [isAuthenticated, userData, initializeSocket]);

    // Watch for new notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];

            // Only process if it's a new notification ID
            const notificationId =
                latest.id_notification ||
                latest.id ||
                `${latest.message}-${latest.created_at || Date.now()}`;

            if (notificationId && notificationId !== lastNotificationId.current) {
                lastNotificationId.current = notificationId;

                // Invalidate react-query notifications cache so list is always up-to-date!
                queryClient.invalidateQueries({ queryKey: ["myNotificationsList"] });

                // Check if it's a reminder
                const isReminder =
                    latest.related_type === 'study_list' &&
                    (latest.message?.toLowerCase().includes('reminder') || latest.content?.toLowerCase().includes('reminder'));

                // Play audio alert
                const audio = new Audio('/mixkit-correct-answer-tone-2870.wav');
                audio.play().catch(e => console.log("Audio play failed", e));

                if (isReminder) {
                    toast.info("Study Reminder: " + (latest.message || latest.content));
                    setActiveReminder(latest);
                    setIsOpen(true);
                } else {
                    // Show a beautiful live interactive toast!
                    toast(latest.message || latest.content || "New notification received", {
                        description: latest.time || "Just now",
                        action: {
                            label: "View",
                            onClick: () => {
                                const relatedId = latest.related_id;
                                const relatedType = latest.related_type || latest.type;

                                if (relatedType === "user") {
                                    router.push(`/dashboard/user/${relatedId}`);
                                } else if (relatedType === "file") {
                                    router.push(`/dashboard/${relatedId}`);
                                } else if (relatedId) {
                                    router.push(`/dashboard/study-list/${relatedId}`);
                                } else {
                                    router.push('/dashboard/notification');
                                }
                            }
                        }
                    });
                }
            } else {
                console.log("ReminderDialog: Notification already processed or missing ID", latest.id_notification);
            }
        }
    }, [notifications, queryClient, router]);

    const handleGoToStudyList = () => {
        if (activeReminder?.related_id) {
            router.push(`/dashboard/study-list/${activeReminder.related_id}`);
            setIsOpen(false);
        }
    };

    if (!activeReminder) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-[390px] w-full rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-2xl p-6 space-y-5" >
                
                {/* Centered Header */}
                <div className="flex flex-col items-center justify-center text-center space-y-3.5 pt-2">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0975e6] dark:text-blue-400 flex items-center justify-center shrink-0 animate-bounce">
                        <Bell className="w-6 h-6 animate-pulse" strokeWidth={2.2} />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            Study Reminder! ⏰
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-400 dark:text-slate-500">
                            Time to focus and build your future
                        </DialogDescription>
                    </div>
                </div>

                {/* Message Content */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100/50 dark:border-slate-800/50 text-center">
                    <p className="text-sm font-semibold text-slate-705 dark:text-slate-200 leading-relaxed">
                        "{activeReminder.message || activeReminder.content}"
                    </p>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3 py-1">
                    <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50 text-center">
                        <BookOpen className="w-5 h-5 text-blue-500 mb-1.5" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Target</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Study List</p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-800/50 text-center">
                        <Clock className="w-5 h-5 text-emerald-500 mb-1.5" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-250">Active Now</p>
                    </div>
                </div>

                {/* Action Footer Buttons matching mockup layout exactly */}
                <div className="flex items-center justify-between gap-4 pt-2">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-[48%] py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                        Dismiss
                    </button>

                    <button
                        onClick={handleGoToStudyList}
                        className="w-[48%] py-3.5 rounded-xl text-white bg-[#0975e6] hover:bg-[#0866c9] font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                        <span>Start Now</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
