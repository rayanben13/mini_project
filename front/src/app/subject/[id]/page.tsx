"use client";

import allActurStore from "@/Store/allActurStore";
import TopFilesSlider from "@/components/topFiles";
import { Book, GraduationCap, Layout, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GuestSubjectPage() {
    const { id } = useParams();
    const router = useRouter();
    const showDetailSubject = allActurStore((state) => state.showDetailSubject);
    
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubject = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await showDetailSubject(id as string);
                if (res.success) {
                    setData(res.data);
                } else {
                    setError(res.message || "Subject not found");
                }
            } catch (err) {
                console.error("Error fetching subject:", err);
                setError("Failed to load subject details");
            } finally {
                setLoading(false);
            }
        };

        fetchSubject();
    }, [id, showDetailSubject]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading subject details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
                <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Subject Not Found</h1>
                <p className="text-slate-500 max-w-md">{error || "The subject you are looking for might have been moved or deleted."}</p>
                <button 
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const { subject, files } = data;
    const hasAnyFiles = Object.values(files).some((arr: any) => arr.length > 0);

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Guest Banner */}
            <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium">
                You are viewing this subject as a guest. <a href="/signup" className="underline font-bold">Sign up</a> to download materials and save study lists.
            </div>

            {/* Hero Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-12 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider mb-4">
                        <GraduationCap className="w-5 h-5" />
                        {subject.major}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
                        {subject.course}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                        {subject.course_description || "Explore top-rated study materials, summaries, and exam papers shared by students."}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        <div className="flex items-center gap-2">
                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Academic Year</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{subject.academic_year}</p>
                            </div>
                        </div>
                        {subject.specialization && (
                            <div className="flex items-center gap-2">
                                <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                                    <Book className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Specialization</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{subject.specialization}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Files Sections */}
            <div className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
                {!hasAnyFiles ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
                        <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Book className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No files yet</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            There are currently no materials available for this subject. Check back later!
                        </p>
                    </div>
                ) : (
                    <>
                        {Object.entries(files).map(([type, items]: [string, any]) => {
                            if (items.length === 0) return null;
                            return (
                                <TopFilesSlider
                                    key={type}
                                    title={`${type} Materials`}
                                    data={items}
                                    icon={<Layout className="w-6 h-6 text-blue-500" />}
                                    onFileClick={(id) => router.push(`/file/${id}`)}
                                />
                            );
                        })}
                    </>
                )}
            </div>
        </main>
    );
}
