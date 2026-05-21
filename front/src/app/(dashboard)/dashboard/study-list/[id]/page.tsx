"use client";

import SetReminder from "@/components/studyList/SetReminder";
import useStudyListStore from "@/Store/user/studyListStore";
import { getPdfPreview } from "@/utils/cloudinary";
import { Bell, FileText, Heart, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudyListDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    showDetailStudyList,
    loveStudyList,
    deleteFileFromStudyList,
    addSetReminder,
  } = useStudyListStore();

  const [details, setDetails] = useState<any>(null);
  const [loadingReminder, setLoadingReminder] = useState(false);

  // ✅ optimistic
  const [isLoved, setIsLoved] = useState<boolean | null>(null);
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const [likes, setLikes] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const handleReminder = async (date: string, time: string) => {
    setLoadingReminder(true);

    const res = await addSetReminder(id, date, time);

    setLoadingReminder(false);

    if (res.success) {
      // ✅ update local state
      setDetails((prev: any) => ({
        ...prev,
        studyListCard: {
          ...prev.studyListCard,
          isAddReminder: true,
          reminder_date: date,
          reminder_time: time,
        },
      }));

      toast.success("Reminder set successfully!");
    } else {
      toast.error(res.message || "Failed to set reminder");
    }
  };

  // 📦 fetch
  useEffect(() => {
    if (id) {
      (async () => {
        const res = await showDetailStudyList(id);
        if (res.success) setDetails(res.data);
      })();
    }
  }, [id]);

  // 🔄 sync once
  useEffect(() => {
    if (details?.studyListCard && !initialized) {
      setIsLoved(details.studyListCard.isLoved);
      setIsSaved(details.studyListCard.isSaved);
      setLikes(details.studyListCard.count_loved || 0);
      setInitialized(true);
    }
  }, [details, initialized]);

  // ❤️ optimistic like
  const handleLove = async () => {
    if (isLoved === null) return;

    const prevLoved = isLoved;
    const prevLikes = likes;

    setIsLoved(!prevLoved);
    setLikes(prevLoved ? likes - 1 : likes + 1);

    const res = await loveStudyList(id);

    if (!res.success) {
      setIsLoved(prevLoved);
      setLikes(prevLikes);
      toast.error("Failed");
    }
  };

  // 🗑 delete file
  const handleDeleteFile = async (e: React.MouseEvent, fileId: number) => {
    e.stopPropagation();

    const prevFiles = details.FilesStudylist;

    setDetails((prev: any) => ({
      ...prev,
      FilesStudylist: prev.FilesStudylist.filter(
        (f: any) => f.id_file !== fileId,
      ),
    }));

    const res = await deleteFileFromStudyList(id, fileId);

    if (!res.success) {
      setDetails((prev: any) => ({
        ...prev,
        FilesStudylist: prevFiles,
      }));
      toast.error("Delete failed");
    }
  };

  // ⏳ loading
  if (!details || isLoved === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-14">
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden mb-10">
          {/* BG EFFECT */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#0975e6]/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
            {/* LEFT */}
            <div className="flex flex-col sm:flex-row gap-5 flex-1">
              {/* ICON */}
              <div className="w-20 h-20 rounded-2xl bg-[#0975e6]/10 flex items-center justify-center shrink-0">
                <FileText className="w-10 h-10 text-[#0975e6]" />
              </div>

              {/* INFO */}
              <div className="space-y-4 flex-1">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {details.studyListCard.name}
                  </h1>

                  <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {details.studyListCard.description ||
                      "No description available."}
                  </p>
                </div>

                {/* META */}
                <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    {likes} Likes
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    {details.studyListCard.count_files} Files
                  </div>

                  {details.studyListCard.isAddReminder && (
                    <div className="flex items-center gap-1.5 text-[#0975e6]">
                      <Bell className="w-4 h-4" />
                      {details.studyListCard.reminder_time}
                    </div>
                  )}
                </div>

                {/* OWNER */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Created by:
                  </span>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-[#0975e6]/10 text-[#0975e6] flex items-center justify-center text-xs font-black uppercase">
                      {details.studyListCard.users?.fullname?.charAt(0)}
                    </div>

                    {/* Name */}
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {details.studyListCard.users?.fullname}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-start gap-3">
              {/* REMINDER */}
              <SetReminder
                isActive={details.studyListCard.isAddReminder}
                initialDate={details.studyListCard.reminder_date}
                initialTime={details.studyListCard.reminder_time}
                loading={loadingReminder}
                onSave={handleReminder}
              />

              {/* LOVE */}
              <button
                onClick={handleLove}
                className={`
                                p-3 rounded-full border transition-all
                                ${
                                  isLoved
                                    ? "bg-red-50 text-red-500 border-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500"
                                }
                            `}
              >
                <Heart className={`w-5 h-5 ${isLoved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <span className="w-1 h-6 bg-[#0975e6] rounded-full" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Study Materials
          </h2>
        </div>

        {/* FILES */}
        <div className="flex flex-col gap-5">
          {details.FilesStudylist?.map((file: any) => (
            <div
              key={file.id_file}
              onClick={() => router.push(`/dashboard/${file.id_file}`)}
              className="
        bg-white dark:bg-slate-900
        rounded-3xl overflow-hidden
        border border-slate-100 dark:border-slate-800
        shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-300
        flex flex-col md:flex-row
        group cursor-pointer
      "
            >
              {/* FILE PREVIEW */}
              <div className="relative w-full md:w-44 h-36 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {file?.file_path ? (
                  <Image
                    src={getPdfPreview(file.file_path)}
                    alt={file.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 176px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                )}

                {/* subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#0975e6]/10 text-[10px] font-black tracking-wider uppercase text-[#0975e6]">
                    {file.type || "FILE"}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {file.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {file?.subjects?.course || "Unknown course"}
                  </p>
                </div>

                {/* ACTION */}
                {details?.studyListCard?.isOwner && (
                  <div className="flex items-center gap-3 ml-auto">
                    <button
                      onClick={(e) => handleDeleteFile(e, file.id_file)}
                      className="
                p-2 rounded-full
                text-red-500
                hover:bg-red-50
                dark:hover:bg-red-500/10
                transition
              "
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
