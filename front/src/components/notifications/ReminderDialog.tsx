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
import { Bell, BookOpen, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ReminderDialog() {
    const { notifications, initializeSocket } = useNotificationSocketStore();
    const { isAuthenticated } = useAuthStore();
    const { data: userData } = useFullUserData();
    const [isOpen, setIsOpen] = useState(false);
    const [activeReminder, setActiveReminder] = useState<any>(null);
    const lastNotificationId = useRef<number | null>(null);
    const router = useRouter();

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
            if (latest.id_notification && latest.id_notification !== lastNotificationId.current) {
                lastNotificationId.current = latest.id_notification;

                // Check if it's a reminder
                const isReminder =
                    latest.related_type === 'study_list' &&
                    (latest.message?.toLowerCase().includes('reminder') || latest.content?.toLowerCase().includes('reminder'));


                if (isReminder) {
                    toast.info("Study Reminder: " + (latest.message || latest.content));
                    setActiveReminder(latest);
                    setIsOpen(true);

                    const audio = new Audio('/mixkit-correct-answer-tone-2870.wav');
                    audio.play().catch(e => console.log("Audio play failed", e));
                }
            } else {
                console.log("ReminderDialog: Notification already processed or missing ID", latest.id_notification);
            }
        }
    }, [notifications]);

    const handleGoToStudyList = () => {
        if (activeReminder?.related_id) {
            router.push(`/dashboard/study-list/${activeReminder.related_id}`);
            setIsOpen(false);
        }
    };

    if (!activeReminder) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl overflow-hidden p-0">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
                        <Bell className="w-8 h-8 text-primary" />
                    </div>

                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            Study Reminder! ⏰
                        </DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg mt-2">
                            {activeReminder.message || activeReminder.content}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 py-4 space-y-4 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Target</p>
                            <p className="text-slate-800 dark:text-white font-semibold">Time to Study Now!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                            <p className="text-slate-800 dark:text-white font-semibold">Active Session</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/30 flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl border-slate-200 dark:border-slate-700 h-12 flex-1"
                    >
                        Dismiss
                    </Button>
                    <Button
                        onClick={handleGoToStudyList}
                        className="rounded-xl bg-primary hover:bg-primary/90 h-12 flex-1 shadow-lg shadow-primary/20"
                    >
                        Start Studying
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
