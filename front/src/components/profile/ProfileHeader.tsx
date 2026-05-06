"use client";

import { Button } from "@/components/ui/button";
import { BadgeCheck, Edit2, GraduationCap, Share } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import FollowButton from "./FollowButton";

// تعريف الـ Props لتكون مرنة
interface ProfileHeaderProps {
    user: any;
    stats: any;
    status?: string;
    isOwnProfile?: boolean; // هل هذا بروفايلي الشخصي؟
    onEditClick?: () => void; // دالة تفتح المودال عند الضغط
}

export default function ProfileHeader({
    user,
    stats: initialStats,
    status,
    isOwnProfile = false,
    onEditClick
}: ProfileHeaderProps) {

    const userDetails = user?.user_information;

    const [currentStats, setCurrentStats] = useState(initialStats);

    // للتأكد من مزامنة الأرقام إذا تغيرت من الخارج
    useEffect(() => {
        setCurrentStats(initialStats);
    }, [initialStats]);

    // دالة لتحديث العداد محلياً عند المتابعة/إلغاء المتابعة
    const handleStatsUpdate = (isFollowing: boolean) => {
        setCurrentStats((prev: any) => ({
            ...prev,
            followers: isFollowing ? (prev.followers + 1) : (prev.followers - 1)
        }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0975e6]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8">

                    {/* Avatar Area */}
                    <div className="relative group shrink-0">
                        <div className="size-32 rounded-full border-4 border-[#0975e6]/10 shadow-inner relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <Image
                                src={user?.img_user || "/avatar.png"}
                                alt={user?.fullname || "User"}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        {user?.role === "user" && (
                            <div className="absolute bottom-1 right-1 size-8 bg-[#0975e6] rounded-full border-[3px] border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                                <BadgeCheck className="text-white fill-[#0975e6] w-5 h-5" strokeWidth={2} />
                            </div>
                        )}
                    </div>

                    {/* User Info Info */}
                    <div className="text-center md:text-left space-y-3 mt-2">
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {user?.fullname || user?.username}
                        </h2>
                        <div className="flex flex-col gap-2.5">
                            <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 font-medium">
                                <GraduationCap className="text-[#0975e6] w-5 h-5 shrink-0" />
                                {userDetails?.university || "No University Specified"}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="px-3 py-1 bg-[#0975e6]/10 text-[#0975e6] text-xs font-bold rounded-lg tracking-wide border border-[#0975e6]/10">
                                    {userDetails?.major || "General Student"}
                                </span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg tracking-wide border dark:border-slate-700">
                                    Level {userDetails?.academic_year || "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="flex items-center justify-center md:justify-start gap-8 mt-6 pt-4">
                            {[
                                { label: "Uploads", value: currentStats?.upload ?? 0 },
                                { label: "Followers", value: currentStats?.followers ?? 0 },
                                { label: "Following", value: currentStats?.following ?? 0 },
                            ].map((stat, i) => (
                                <div
                                    key={stat.label}
                                    className={`text-center md:text-left ${i === 1 ? "border-x border-slate-200 dark:border-slate-800 px-8" : ""}`}
                                >
                                    <p className="text-[28px] leading-none font-bold text-[#0975e6]">
                                        {stat.value}
                                    </p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 md:mt-2">
                    <Button variant="ghost" className="size-12 md:size-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border hover:bg-[#0975e6]/5 group">
                        <Share className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>

                    {isOwnProfile ? (
                        // إذا كان بروفايلي: أظهر زر التعديل
                        <Button
                            onClick={onEditClick}
                            className="size-12 md:size-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 rounded-2xl"
                        >
                            <Edit2 className="w-5 h-5" />
                        </Button>
                    ) : (
                        <FollowButton id_user={user?.id_user} status={status ?? ""} onActionSuccess={handleStatsUpdate} />
                    )}
                </div>
            </div>
        </div>
    );
}