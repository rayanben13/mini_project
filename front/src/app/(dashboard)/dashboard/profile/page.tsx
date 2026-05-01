"use client";

import SliderSkeleton from "@/components/sliderSkeleton";
import TopFilesSlider from "@/components/topFiles";
import { Button } from "@/components/ui/button";
import { showMyFiles } from "@/hooks/useFilesInformations";
import { useFullUserData } from "@/hooks/useUserInformation";
import { BadgeCheck, BookOpen, Edit2, GraduationCap, Loader2, Share, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type TabType = "files" | "studylists";

const MAX_PAGES = 5;

export default function UserProfile() {
  const { data, isLoading } = useFullUserData();

  // ✅ Tab State
  const [activeTab, setActiveTab] = useState<TabType>("files");

  // ✅ Pagination State
  const [myFiles, setMyFiles] = useState<any[]>([]);
  const [filesPage, setFilesPage] = useState(1);

  const {
    data: filesData,
    isLoading: isFilesLoading,
    isFetching: isFetchingFiles,
  } = showMyFiles(filesPage, 10);

  // ✅ تجميع الملفات تدريجياً
  useEffect(() => {
    if (filesData?.data) {
      setMyFiles((prev) => {
        const newFiles = filesData.data.filter(
          (newFile: any) => !prev.some((f) => f.id_file === newFile.id_file)
        );
        return [...prev, ...newFiles];
      });
    }
  }, [filesData]);

  const user = data?.result?.information;
  const stats = data?.result?.stats;
  const userDetails = user?.user_information;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f6] dark:bg-[#221610]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0975e6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f6] dark:bg-[#221610] p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ===== Profile Header ===== */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0975e6]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="size-32 rounded-full border-4 border-[#0975e6]/10 shadow-inner relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={user?.img_user || "/avatar.png"}
                    alt={user?.fullname || "User Avatar"}
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

              {/* Info */}
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

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-8 mt-6 pt-4">
                  {[
                    { label: "Uploads", value: stats?.upload ?? 0 },
                    { label: "Followers", value: stats?.followers ?? 0 },
                    { label: "Following", value: stats?.following ?? 0 },
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

            {/* Actions */}
            <div className="flex gap-3 md:mt-2">
              <Button variant="ghost" className="size-12 md:size-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border hover:bg-[#0975e6]/5 group">
                <Share className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
              <Button className="size-12 md:size-14 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border hover:bg-[#0975e6]/5 group">
                <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* ===== Tabs & Content ===== */}
        <div className="space-y-8">

          {/* Tab Buttons */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 px-2 lg:px-0">
            {[
              { id: "files" as TabType, label: "Uploaded Files", icon: Upload },
              { id: "studylists" as TabType, label: "Study Lists", icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm tracking-wide transition-colors
                  ${activeTab === tab.id
                    ? "border-[#0975e6] text-[#0975e6]"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "files" && (
            <div>
              {isFilesLoading && myFiles.length === 0 ? (
                <SliderSkeleton />
              ) : myFiles.length === 0 ? (
                // ✅ حالة عدم وجود ملفات
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                    No files uploaded yet
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Start sharing your study materials!
                  </p>
                  <Button className="mt-6 bg-[#0975e6] hover:bg-[#0975e6]/90">
                    Upload Your First File
                  </Button>
                </div>
              ) : (
                <TopFilesSlider
                  key="my-files"
                  data={myFiles}
                  title="My Uploaded Files"
                  icon={<Upload className="w-5 h-5 text-[#0975e6]" />}
                  hasMore={
                    filesData?.meta?.current_page < filesData?.meta?.last_page
                    && filesPage < MAX_PAGES
                  }
                  onLoadMore={() => setFilesPage(prev => prev + 1)}
                  isLoadingMore={isFetchingFiles}
                  itemKey="id_file"
                />
              )}
            </div>
          )}

          {activeTab === "studylists" && (
            // ✅ مكان Study Lists (يمكن إضافته لاحقاً)
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                No study lists yet
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Create your first study list!
              </p>
              <Button className="mt-6 bg-[#0975e6] hover:bg-[#0975e6]/90">
                Create Study List
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}