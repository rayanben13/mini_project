"use client";

import useFilesStore from "@/Store/user/filesStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SaveStudyListModal from "./studyList/SaveStudyListModal";
import { Button } from "./ui/button";

interface FileActionsProps {
    fileId: number;
    initialLikes?: number;
    initialDislikes?: number;
    initialStatusLike?: "LIKE" | "DISLIKE" | null;
    userRole: string; // "ADMIN" or "USER"
}

export default function FileActions({
    fileId,
    initialLikes = 0,
    initialDislikes = 0,
    initialStatusLike = null,
    userRole,
}: FileActionsProps) {
    const { likeOrDislikeFile } = useFilesStore();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [userLikeAction, setUserLikeAction] = useState<"LIKE" | "DISLIKE" | null>(initialStatusLike);

    // 1. دالة التحقق من الصلاحيات
    const checkPermission = () => {
        if (!userRole || userRole === "guest") {
            toast.error("Please sign in to use this feature", {
                action: {
                    label: "Sign In",
                    onClick: () => window.location.href = "/login",
                },
            });
            return false;
        }
        if (userRole === "admin") {
            toast.error("This feature is only available for students not admin.");
            return false;
        }
        return true;
    };

    const { mutate: handleAction } = useMutation({
        mutationFn: async (type: "LIKE" | "DISLIKE") => {
            const result = await likeOrDislikeFile(fileId, type);
            if (!result.success) toast.error(result.message);
            return result.data;
        },
        onMutate: async (newAction) => {
            const previousLikes = likes;
            const previousDislikes = dislikes;
            const previousAction = userLikeAction;

            if (userLikeAction === newAction) {
                setUserLikeAction(null);
                if (newAction === "LIKE") setLikes(prev => prev - 1);
                else setDislikes(prev => prev - 1);
            } else {
                if (userLikeAction === "LIKE") setLikes(prev => prev - 1);
                if (userLikeAction === "DISLIKE") setDislikes(prev => prev - 1);

                setUserLikeAction(newAction);
                if (newAction === "LIKE") setLikes(prev => prev + 1);
                else setDislikes(prev => prev + 1);
            }
            return { previousLikes, previousDislikes, previousAction };
        },
        onError: (err, newAction, context) => {
            if (context) {
                setLikes(context.previousLikes);
                setDislikes(context.previousDislikes);
                setUserLikeAction(context.previousAction);
            }
            toast.error("Failed to update reaction");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['file-details', fileId] });
        }
    });

    // 2. تعديل دوال الضغط
    const onLikeClick = () => {
        if (checkPermission()) handleAction("LIKE");
    };

    const onDislikeClick = () => {
        if (checkPermission()) handleAction("DISLIKE");
    };

    const onSaveClick = () => {
        if (checkPermission()) setIsSaveModalOpen(true);
    };

    return (
        <div className="flex items-center gap-2">
            {/* 👍 Like Button */}
            <button
                type="button"
                onClick={onLikeClick} // استخدام الدالة الجديدة
                className={`flex items-center justify-center p-2.5 rounded-full transition-all duration-200 group relative
                    ${userLikeAction === "LIKE"
                        ? "bg-[#0975e6]/10 text-[#0975e6]"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-[#0975e6]/10 hover:text-[#0975e6]"}`}
            >
                <ThumbsUp
                    className={`w-5 h-5 ${userLikeAction === "LIKE" ? "scale-110" : ""}`}
                    fill={userLikeAction === "LIKE" ? "currentColor" : "none"}
                />
                <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
                    ${userLikeAction === "LIKE" ? "bg-[#0975e6] text-white" : "bg-slate-200 text-slate-600"}`}>
                    {likes}
                </span>
            </button>

            {/* 👎 Dislike Button */}
            <button
                type="button"
                onClick={onDislikeClick} // استخدام الدالة الجديدة
                className={`flex items-center justify-center p-2.5 rounded-full transition-all duration-200 group relative
                    ${userLikeAction === "DISLIKE"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-red-500/10 hover:text-red-500"}`}
            >
                <ThumbsDown
                    className={`w-5 h-5 ${userLikeAction === "DISLIKE" ? "scale-110" : ""}`}
                    fill={userLikeAction === "DISLIKE" ? "currentColor" : "none"}
                />
                <span className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
                    ${userLikeAction === "DISLIKE" ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {dislikes}
                </span>
            </button>

            {/* 💾 Save Button */}
            <div className="relative group">
                <Button
                    onClick={onSaveClick} // استخدام الدالة الجديدة
                    className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 transition-colors"
                >
                    <BookmarkPlus className="w-5 h-5" />
                </Button>

                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 
                whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-lg 
                bg-black text-white opacity-0 group-hover:opacity-100 
                transition-all duration-200 pointer-events-none shadow-md">
                    Save to your study list
                </div>
            </div>

            <SaveStudyListModal
                fileId={fileId}
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
            />
        </div>
    );
}