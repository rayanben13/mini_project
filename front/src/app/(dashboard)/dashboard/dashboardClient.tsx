"use client";

import RenderState from "@/components/renderState";
import SliderSkeleton from "@/components/sliderSkeleton";
import TopFilesSlider from "@/components/topFiles";
import SubjectCard from "@/components/yourSubjects";
import { showTopFilesForUser, useFilesLikes } from "@/hooks/useFilesInformations";
import { useRecommendedStudyList } from "@/hooks/useStudyList";
import { useYourSubjects } from "@/hooks/useSubjectsInfo";
import { Book, Heart, Shapes, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ✅ حد أقصى لكل سلايدر
const MAX_PAGES = 5;

export default function DashboardClient() {
  // ✅ state منفصلة لكل سلايدر
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [filesLikes, setFilesLikes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // ✅ page منفصلة لكل سلايدر
  const [filesPage, setFilesPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [subjectsPage, setSubjectsPage] = useState(1);

  const router = useRouter();

  // ✅ كل hook له isFetching خاص به
  const {
    data: filesData,
    isLoading: filesLoading,
    isFetching: isFetchingFiles
  } = showTopFilesForUser(filesPage, 10);

  const {
    data: filesLikesData,
    isLoading: filesLikesLoading,
    isFetching: isFetchingLikes
  } = useFilesLikes(likesPage, 10);

  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isFetching: isFetchingSubjects
  } = useYourSubjects(subjectsPage, 10);

  const { data: recommendedStudyListData, isLoading: recommendedStudyListLoading } = useRecommendedStudyList(1, 10);

  // Accumulate files state safely
  useEffect(() => {
    if (filesData?.data) {
      setAllFiles((prev) => {
        const newFiles = filesData.data.filter(
          (newFile: any) => !prev.some((f) => f.id_file === newFile.id_file)
        );
        return [...prev, ...newFiles];
      });
    }
  }, [filesData]);

  useEffect(() => {
    if (filesLikesData?.data) {
      setFilesLikes((prev) => {
        const newFiles = filesLikesData.data.filter(
          (newFile: any) => !prev.some((f) => f.id_file === newFile.id_file)
        );
        return [...prev, ...newFiles];
      });
    }
  }, [filesLikesData]);

  useEffect(() => {
    if (subjectsData?.data) {
      setSubjects((prev) => {
        const newSubjects = subjectsData.data.filter(
          (newSubject: any) => !prev.some((s) => s.id_subject === newSubject.id_subject)
        );
        return [...prev, ...newSubjects];
      });
    }
  }, [subjectsData]);

  return (
    <div className="space-y-12 w-full max-w-7xl mx-auto px-1 md:px-2 py-2 animate-in fade-in duration-500">

      {/* 🌟 Premium SaaS Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#0975e6] to-[#ae1ce9] p-8 md:p-12 text-white shadow-xl shadow-blue-500/10 dark:shadow-purple-500/5">
        {/* Soft glowing circles for modern aesthetics */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-wide uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span>Welcome back to your dashboard</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
            Your academic library, redefined.
          </h1>
          <p className="text-white/85 text-sm md:text-base font-medium max-w-lg leading-relaxed">
            Discover top-rated lectures, courses, TD, and exams curated by other top-performing students.
          </p>
        </div>
      </div>

      {/* 📁 Slider 1: Top Documents */}
      <section className="bg-white dark:bg-slate-900/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 shadow-sm">
        {filesLoading && allFiles.length === 0 ? (
          <SliderSkeleton />
        ) : (
          <TopFilesSlider
            key="top-files"
            data={allFiles}
            title="Top Documents"
            icon={<Sparkles className="w-5 h-5 text-[#0975e6]" />}
            hasMore={
              filesData?.meta?.current_page < filesData?.meta?.last_page
              && filesPage < MAX_PAGES
            }
            onLoadMore={() => setFilesPage(prev => prev + 1)}
            isLoadingMore={isFetchingFiles}
            hideCardLikes={true}
            onFileClick={(fileId) => {
              router.push(`/dashboard/${fileId}`);
            }}
          />
        )}
      </section>

      {/* ❤️ Slider 2: Files You Liked */}
      <section className="bg-white dark:bg-slate-900/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 shadow-sm">
        {filesLikesLoading && filesLikes.length === 0 ? (
          <SliderSkeleton />
        ) : (
          <TopFilesSlider
            key="liked-files"
            data={filesLikes}
            title="Files You Liked"
            icon={<Heart className="w-5 h-5 text-rose-500" />}
            hasMore={
              filesLikesData?.meta?.current_page < filesLikesData?.meta?.last_page
              && likesPage < MAX_PAGES
            }
            onLoadMore={() => setLikesPage(prev => prev + 1)}
            isLoadingMore={isFetchingLikes}
            onFileClick={(fileId) => {
              router.push(`/dashboard/${fileId}`);
            }}
          />
        )}
      </section>

      {/* 📚 Slider 3: Your Subjects */}
      <section className="bg-white dark:bg-slate-900/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 shadow-sm">
        {subjectsLoading && subjects.length === 0 ? (
          <SliderSkeleton />
        ) : (
          <TopFilesSlider
            key="your-subjects"
            data={subjects}
            title="Your Subjects"
            icon={<Shapes className="w-5 h-5 text-[#0975e6]" />}
            hasMore={
              subjectsData?.meta?.current_page < subjectsData?.meta?.last_page
              && subjectsPage < MAX_PAGES
            }
            onLoadMore={() => setSubjectsPage(prev => prev + 1)}
            isLoadingMore={isFetchingSubjects}
            itemKey="id_subject"
            renderItem={(subject, index) => (
              <SubjectCard subject={subject} index={index} />
            )}
          />
        )}
      </section>

      {/* 🔖 Section 4: Recommended Study Lists */}
      <section className="bg-white dark:bg-slate-900/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <Book className="w-5 h-5 text-[#0975e6]" />
          Recommended Study Lists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RenderState
            isLoading={recommendedStudyListLoading}
            data={recommendedStudyListData}
            showSave={true}
          />
        </div>
      </section>

    </div>
  );
}