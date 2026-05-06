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

  const { data: recommendedStudyListData, isLoading: recommendedStudyListLoading, isFetching: isFetchingRecommendedStudyList } = useRecommendedStudyList(1, 10);

  // ✅ useEffect منفصل لكل سلايدر
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
    <div className="space-y-12 w-full">

      {/* السلايدر الأول: أهم الملفات */}
      <section>
        {filesLoading && allFiles.length === 0 ? (
          <SliderSkeleton />
        ) : (
          <TopFilesSlider
            key="top-files"                                    // ✅ key ثابت وفريد
            data={allFiles}                                    // ✅ State المتراكمة
            title="Top Documents"
            icon={<Sparkles className="w-5 h-5 text-blue-500" />}
            hasMore={
              filesData?.meta?.current_page < filesData?.meta?.last_page
              && filesPage < MAX_PAGES                         // ✅ حد أقصى
            }
            onLoadMore={() => setFilesPage(prev => prev + 1)} // ✅ filesPage
            isLoadingMore={isFetchingFiles}
            onFileClick={(fileId) => {
              router.push(`/dashboard/${fileId}`);
            }}
          />
        )}
      </section>

      {/* السلايدر الثاني: الملفات المعجبة */}
      <section>
        {filesLikesLoading && filesLikes.length === 0 ? (
          <SliderSkeleton />
        ) : (
          <TopFilesSlider
            key="liked-files"                                   // ✅ key فريد
            data={filesLikes}                                   // ✅ State المتراكمة
            title="Files You Liked"
            icon={<Heart className="w-5 h-5 text-red-500" />}
            hasMore={
              filesLikesData?.meta?.current_page < filesLikesData?.meta?.last_page
              && likesPage < MAX_PAGES                          // ✅ حد أقصى
            }
            onLoadMore={() => setLikesPage(prev => prev + 1)}  // ✅ likesPage
            isLoadingMore={isFetchingLikes}
            onFileClick={(fileId) => {
              router.push(`/dashboard/${fileId}`);
            }}
          />
        )}
      </section>

      <section>
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

      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 pl-3 mb-6">
          <Book className="w-5 h-5 text-[#0975e6]" />
          Recommended Study Lists
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
          <RenderState isLoading={recommendedStudyListLoading} data={recommendedStudyListData} />
        </div>
      </section>

    </div>
  );
}