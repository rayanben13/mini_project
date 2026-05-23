"use client";

import TopFilesSlider from "@/components/topFiles";
import { Button } from "@/components/ui/button";
import { useSubjectDetails } from "@/hooks/useSubjectsInfo";
import { cn } from "@/lib/utils";
import {
    BadgeCheck,
    BookOpen,
    ChevronLeft,
    FileEdit,
    FileText,
    FlaskConical,
    HelpCircle,
    Layout,
    Loader2,
    ScrollText,
    ShieldQuestion,
} from 'lucide-react';
import { useParams, useRouter } from "next/navigation";

// دالة مساعدة لاختيار الأيقونة والألوان بناءً على نوع الملف
const getCategoryStyles = (category: string) => {
    switch (category) {
        case 'COURS': return { icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100', accent: 'from-blue-500/10 to-transparent' };
        case 'TD': return { icon: <FileEdit className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-100', accent: 'from-emerald-500/10 to-transparent' };
        case 'TP': return { icon: <FlaskConical className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-100', accent: 'from-amber-500/10 to-transparent' };
        case 'EF': return { icon: <ScrollText className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100', accent: 'from-purple-500/10 to-transparent' };
        case 'CC': return { icon: <ShieldQuestion className="w-5 h-5" />, color: 'text-rose-600', bg: 'bg-rose-100', accent: 'from-rose-500/10 to-transparent' };
        case 'RESUME': return { icon: <Layout className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-100', accent: 'from-indigo-500/10 to-transparent' };
        default: return { icon: <FileText className="w-5 h-5" />, color: 'text-slate-600', bg: 'bg-slate-100', accent: 'from-slate-500/10 to-transparent' };
    }
};

export default function SubjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data, isLoading, error } = useSubjectDetails(Number(id));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-[#0975e6]" />
                <p className="mt-4 text-slate-500 font-medium">Fetching subject details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-red-500 font-bold text-xl">Failed to load subject</p>
                <Button onClick={() => router.back()} variant="outline" className="rounded-xl">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const { subject, files } = data;

    const totalFiles = files
        ? Object.values(files).reduce(
            (acc: number, curr: any) => acc + (curr?.length || 0),
            0
        )
        : 0;

    // تصنيف الملفات حسب النوع
    const categories = [
        { id: 'COURS', title: 'Course Lectures', icon: BookOpen },
        { id: 'TD', title: 'Tutorials (TD)', icon: FileEdit },
        { id: 'TP', title: 'Practicals (TP)', icon: FlaskConical },
        { id: 'CC', title: 'Continuous Control (CC)', icon: HelpCircle },
        { id: 'EF', title: 'Final Exams (EF)', icon: ScrollText },
        { id: 'RESUME', title: 'Summaries & Resumes', icon: Layout },
    ];

    return (
        <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-16 pb-32">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 p-10 lg:p-16 text-white shadow-2xl">
                <div className="relative z-10 space-y-6 max-w-3xl">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="text-slate-400  hover:text-slate-500 hover:cursor-pointer hover:bg-white/10 rounded-full px-4 -ml-2"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1 " /> Back
                    </Button>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                            <BadgeCheck className="w-4 h-4" />
                            <span>
                                {subject?.academic_year} • {subject?.major}
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1]  text-black dark:text-white">
                            {subject?.course}
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Complete archive of study materials for{' '}
                            <strong className="text-black dark:text-white">
                                {subject?.course}
                            </strong>{' '}
                            {subject?.course_description ||
                                ' . Filter through lectures, practicals, and exams curated by your peers.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                    Resources
                                </p>
                                <p className="font-bold text-lg mt-1 text-black dark:text-white">
                                    {totalFiles} Files
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mb-32 blur-3xl" />
            </section>

            {/* Files Sections with Sliders */}
            <div className="space-y-20">
                {categories.map((cat) => {
                    const categoryFiles = files?.[cat.id];
                    if (!categoryFiles || categoryFiles.length === 0) return null;

                    const style = getCategoryStyles(cat.id);

                    return (
                        <div key={cat.id} className="space-y-2">
                            <TopFilesSlider
                                key={cat.id}
                                data={categoryFiles}
                                title={cat.title}
                                icon={
                                    <div className={cn('p-2 rounded-lg', style.bg, style.color)}>
                                        {style.icon}
                                    </div>
                                }
                                hasMore={false}
                                itemKey="id_file"
                                onFileClick={(fileId) => router.push(`/admin/files/${fileId}`)}
                            />
                        </div>
                    );
                })}
            </div>
        </main>
    );
}