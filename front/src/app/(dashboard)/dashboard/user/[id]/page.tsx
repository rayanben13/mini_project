"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import { useUserById } from "@/hooks/useUserInformation"; // الـ Hook الخاص بك
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function PublicUserProfile() {
    const params = useParams();
    const userId = Number(params.id);
    const { data, isPending } = useUserById(userId);
    console.log("data", data);

    const [activeTab, setActiveTab] = useState("files");

    if (isPending || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6] dark:bg-[#221610]">
                <Loader2 className="w-10 h-10 animate-spin text-[#0975e6]" />
            </div>
        );
    }

    if (data.success === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6] dark:bg-[#221610]">
                <p className="text-red-500 font-bold">{data.message || "User not found or Server error"}</p>
            </div>
        );
    }

    const user = data?.result?.user;
    const stats = data?.result?.stats;
    const userDetails = user?.user_information;

    return (
        <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header - نفس تصميمك */}
                <ProfileHeader
                    user={user}
                    stats={stats}
                    isOwnProfile={false}
                />

                {/* التبويبات لعرض ملفات هذا المستخدم تحديداً */}
                {/* هنا ستحتاج لتمرير userId لمكون FilesSection ليجلب ملفات هذا المستخدم فقط */}
            </div>
        </div>
    );
}