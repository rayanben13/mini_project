"use client"
import ProfileHeader from "@/components/profile/ProfileHeader";
import AddedStudyListCard from "@/components/studyList/addedStudyListCard";
import { FileCard } from "@/components/topFiles";
import { useFilesUserById, useStudyListsUserById } from "@/hooks/usePublicProfile";
import { useUserById } from "@/hooks/useUserInformation";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Loader2, Shapes } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PublicUserProfile() {
    const params = useParams();
    const router = useRouter();
    const userId = Number(params.id);
    const { data, isPending } = useUserById(userId);

    const [activeTab, setActiveTab] = useState("files");

    // Fetch user's files and study lists
    const { data: filesData, isLoading: isLoadingFiles } = useFilesUserById(userId);

    const { data: studyListsData, isLoading: isLoadingStudyLists } = useStudyListsUserById(userId);

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

    const userFiles = filesData?.data || [];
    const userStudyLists = studyListsData?.data || [];

    return (
        <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] p-4 md:p-8 lg:p-12 pb-32">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <ProfileHeader
                    user={user}
                    stats={stats}
                    status={data.result.status}
                    isOwnProfile={false}
                />

                {/* Tabs Section */}
                <div className="space-y-8">
                    <div className="flex items-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab("files")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === "files"
                                    ? "bg-white dark:bg-slate-900 text-[#0975e6] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <FileText className="w-4 h-4" />
                            User Files
                            <span className="ml-1 opacity-50 text-xs">{userFiles.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("lists")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === "lists"
                                    ? "bg-white dark:bg-slate-900 text-[#0975e6] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <Shapes className="w-4 h-4" />
                            Study Lists
                            <span className="ml-1 opacity-50 text-xs">{userStudyLists.length}</span>
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="min-h-[400px]">
                        {activeTab === "files" ? (
                            isLoadingFiles ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#0975e6]" />
                                </div>
                            ) : userFiles.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {userFiles.data.map((file: any) => (
                                        <FileCard
                                            key={file.id_file}
                                            file={file}
                                            showStatus={true}
                                            onNavigate={() => router.push(`/dashboard/${file.id_file}`)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<BookOpen className="w-12 h-12" />}
                                    title="No files yet"
                                    description="This user hasn't uploaded any documents yet."
                                />
                            )
                        ) : (
                            isLoadingStudyLists ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#0975e6]" />
                                </div>
                            ) : userStudyLists.data.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {userStudyLists.data.map((list: any) => (
                                        <div
                                            key={list.id_stuList}
                                            onClick={() => router.push(`/dashboard/study_list/${list.id_stuList}`)}
                                            className="cursor-pointer"
                                        >
                                            <AddedStudyListCard
                                                id={list.id_stuList}
                                                title={list.name}
                                                files={list._count?.study_list_files || 0}
                                                userName={user.fullname}
                                                showSave={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={<Shapes className="w-12 h-12" />}
                                    title="No study lists"
                                    description="This user hasn't created any public study lists yet."
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4 bg-white dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="opacity-20">{icon}</div>
            <div className="text-center">
                <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                <p className="text-sm max-w-[200px]">{description}</p>
            </div>
        </div>
    );
}