"use client";

import SetReminder from "@/components/studyList/SetReminder";
import useStudyListStore from "@/Store/user/studyListStore";
import { getPdfPreview } from "@/utils/cloudinary";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookmarkCheck,
  ChevronRight,
  FileText,
  Folder,
  Heart,
  Loader2,
  Plus,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudyListForDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    showDetailStudyList,
    loveStudyList,
    addSetReminder,
    addStudylistToAddedSection,
  } = useStudyListStore();

  const [data, setData] = useState<any>(null);
  const [isLoved, setIsLoved] = useState<boolean | null>(null);
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [likes, setLikes] = useState(0);
  const [loadingReminder, setLoadingReminder] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // FETCH
  useEffect(() => {
    if (!id) return;

    (async () => {
      const res = await showDetailStudyList(id);
      if (res.success) setData(res.data);
    })();
  }, [id]);

  // INIT
  useEffect(() => {
    if (data?.studyListCard && !initialized) {
      setIsLoved(data.studyListCard.isLoved);
      setIsSaved(data.studyListCard.isSaved);
      setLikes(data.studyListCard.count_loved || 0);
      setInitialized(true);
    }
  }, [data, initialized]);

  // LOVE
  const handleLove = async () => {
    if (isLoved === null) return;

    const prev = isLoved;
    const prevLikes = likes;

    setIsLoved(!prev);
    setLikes(prev ? likes - 1 : likes + 1);

    const res = await loveStudyList(id);

    if (!res.success) {
      setIsLoved(prev);
      setLikes(prevLikes);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dashboard/study-list/${id}`;

    try {
      // Mobile / supported browsers
      if (navigator.share) {
        await navigator.share({
          title: studyList.name,
          text:
            studyList.description || `Check this study list: ${studyList.name}`,
          url: shareUrl,
        });

        toast.success("Shared successfully!");
        return;
      }

      // Fallback desktop → copy link
      await navigator.clipboard.writeText(shareUrl);

      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to share");
    }
  };

  const handleReminder = async (date: string, time: string) => {
    setLoadingReminder(true);

    const res = await addSetReminder(id, date, time);

    setLoadingReminder(false);

    if (res.success) {
      // ✅ update local state instantly
      setData((prev: any) => ({
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

  // SAVE
  const handleSave = async () => {
    if (saving) return;

    setSaving(true);

    try {
      const res = await addStudylistToAddedSection(id);

      if (res.success) {
        setIsSaved((prev) => !prev);

        toast.success(isSaved ? "Removed from library" : "Saved to library");

        queryClient.invalidateQueries({ queryKey: ["addedStudyList"] });
        queryClient.invalidateQueries({ queryKey: ["recommendedStudyList"] });
      } else {
        toast.error(res.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!data || isLoved === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0975e6]" />
        <p className="mt-3 text-slate-500">Loading study list...</p>
      </div>
    );
  }

  const studyList = data.studyListCard;

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
                <Folder className="w-10 h-10 text-[#0975e6]" />
              </div>

              {/* INFO */}
              <div className="space-y-4 flex-1">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {studyList.name}
                  </h1>

                  <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {studyList.description || "No description available."}
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
                    {studyList.count_files} Files
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4" />
                    {studyList.privacy}
                  </div>
                </div>

                {/* OWNER */}
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Created by:
                  </span>

                  <Link
                    href={
                      studyList.isOwner
                        ? "/dashboard/profile"
                        : `/dashboard/user/${studyList.users?.id_user}`
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[#0975e6] dark:hover:text-[#0975e6] transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-[#0975e6]/10 text-[#0975e6] flex items-center justify-center text-xs font-black uppercase">
                      {studyList.users?.fullname?.charAt(0)}
                    </div>

                    {/* Name */}
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {studyList.users?.fullname}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-start gap-3">
              {/* SAVE */}
              {!studyList.isOwner && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
            p-3 rounded-full border transition-all duration-200
            active:scale-95
            ${
              isSaved
                ? "bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 hover:bg-red-50 hover:border-red-100"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#0975e6] hover:border-[#0975e6]/30"
            }
        `}
                  title={"Save to library"}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSaved ? (
                    // ✅ Saved State
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    // ➕ Unsaved State
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* REMINDER */}
              <SetReminder
                isActive={studyList.isAddReminder}
                initialDate={studyList.reminder_date}
                initialTime={studyList.reminder_time}
                loading={loadingReminder}
                onSave={handleReminder}
              />

              {/* SHARE */}
              {/* SHARE */}
              <button
                onClick={handleShare}
                className="
    p-3 rounded-full border
    bg-slate-50 dark:bg-slate-800
    border-slate-200 dark:border-slate-700
    text-slate-600 dark:text-slate-300
    hover:text-[#0975e6]
    hover:border-[#0975e6]/30
    transition-all duration-200
    active:scale-95
  "
                title="Share study list"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* LOVE */}
              <button
                title={isLoved ? "Remove like" : "Add like"}
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
          {data.FilesStudylist?.map((file: any) => (
            <div
              key={file.id_file}
              onClick={() => router.push(`/dashboard/${file.id_file}`)}
              className="
                bg-white dark:bg-slate-900
                rounded-3xl overflow-hidden
                border border-slate-100 dark:border-slate-800
                shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]
                hover:shadow-lg
                transition-all
                flex flex-col md:flex-row
                group cursor-pointer
              "
            >
              {/* LEFT ICON */}
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
                    {file.type_file || "FILE"}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {file.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {file?.subjects?.course || "Unknown course"}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="flex items-center justify-center ml-auto pr-2">
                  <ChevronRight className="w-8 h-8 text-slate-400 group-hover:text-[#0975e6] transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
