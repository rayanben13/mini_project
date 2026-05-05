"use client";

import useFilesStore from "@/Store/user/filesStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import SaveStudyListModal from "./studyList/SaveStudyListModal";

// تعريف أنواع البيانات المتوقعة
interface FileActionsProps {
    fileId: number;
    initialLikes?: number;
    initialDislikes?: number;
    initialStatusLike?: "LIKE" | "DISLIKE" | null;
}

export default function FileActions({
    fileId,
    initialLikes = 0,
    initialDislikes = 0,
    initialStatusLike = null,
}: FileActionsProps) {
    const { likeOrDislikeFile } = useFilesStore();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [userLikeAction, setUserLikeAction] = useState<"LIKE" | "DISLIKE" | null>(initialStatusLike);

    const { mutate: handleAction } = useMutation({
        mutationFn: async (action: "LIKE" | "DISLIKE") => {
            const result = await likeOrDislikeFile(fileId, action);
            if (!result.success) toast.error(result.message);
            return result.data;
        },
        onMutate: async (newAction) => {

            // حفظ القيم الحالية للرجوع إليها في حال الفشل
            const previousLikes = likes;
            const previousDislikes = dislikes;
            const previousAction = userLikeAction;

            // تحديث الواجهة فوراً بشكل "متفائل"
            if (userLikeAction === newAction) {
                // إلغاء التفاعل الحالي (Toggle off)
                setUserLikeAction(null);
                if (newAction === "LIKE") setLikes(prev => prev - 1);
                else setDislikes(prev => prev - 1);
            } else {
                // تغيير من Like إلى Dislike أو العكس، أو إضافة تفاعل جديد
                if (userLikeAction === "LIKE") setLikes(prev => prev - 1);
                if (userLikeAction === "DISLIKE") setDislikes(prev => prev - 1);

                setUserLikeAction(newAction);
                if (newAction === "LIKE") setLikes(prev => prev + 1);
                else setDislikes(prev => prev + 1);
            }

            return { previousLikes, previousDislikes, previousAction };
        },
        onError: (err, newAction, context) => {
            // في حال فشل السيرفر، نعود للقيم القديمة
            if (context) {
                setLikes(context.previousLikes);
                setDislikes(context.previousDislikes);
                setUserLikeAction(context.previousAction);
            }
            toast.error("Failed to update reaction");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['file-details', fileId] });
            queryClient.invalidateQueries({ queryKey: ['topFilesForUser'] });
            queryClient.invalidateQueries({ queryKey: ['myFiles'] });
        }
    });

    return (
        <div className="flex items-center gap-2">
            {/* 👍 Like Button */}
            <button
                type="button"
                onClick={() => handleAction("LIKE")}
                // disabled={isPending}
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
                onClick={() => handleAction("DISLIKE")}
                // disabled={isPending}
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
            <button
                onClick={() => setIsSaveModalOpen(true)}
                className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 transition-colors"
            >
                <BookmarkPlus className="w-5 h-5" />
            </button>

            <SaveStudyListModal
                fileId={fileId}
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
            />
        </div>
    );
}