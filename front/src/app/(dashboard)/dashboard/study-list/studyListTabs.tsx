"use client";

import AddedStudyList from "@/components/studyList/addedStudyList";
import StudyList from "@/components/studyList/studyList";
import useStudyListStore from "@/Store/user/studyListStore";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CreateStudyListModal } from "./CreateStudyListModal";

export default function StudyListTabs() {
    const [activeTab, setActiveTab] = useState<"myList" | "added">("myList");
    const [openModal, setOpenModal] = useState(false);
    const { createStudyList, loading: isLoading } = useStudyListStore();

    const queryClient = useQueryClient();

    const handleCreate = async (data: any) => {
        const payload = {
            name: data.name,
            subject: data.subject,
            description: data.description,
            privacy: data.isPublic ? "public" : "private"
        };
        const res = await createStudyList(payload);

        if (res.success) {
            setOpenModal(false);
            toast.success("Study list created successfully");
            queryClient.invalidateQueries({ queryKey: ["myStudyList"] });
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto px-1 md:px-2 py-2 animate-in fade-in duration-500">
            
            {/* Page Header matching mockup */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Study Lists
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage and organize your learning materials across all subjects
                </p>
            </div>

            {/* 🔵 Minimalist Tabs matching mockup */}
            <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-0">
                <button
                    onClick={() => setActiveTab("myList")}
                    className={`pb-3 text-sm font-semibold transition-all duration-200 relative ${
                        activeTab === "myList"
                            ? "text-[#0975e6] dark:text-blue-400 border-b-2 border-[#0975e6] -mb-[2px]"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    My List
                </button>

                <button
                    onClick={() => setActiveTab("added")}
                    className={`pb-3 text-sm font-semibold transition-all duration-200 relative ${
                        activeTab === "added"
                            ? "text-[#0975e6] dark:text-blue-400 border-b-2 border-[#0975e6] -mb-[2px]"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    Added
                </button>
            </div>

            {/* 🟢 Content */}
            {activeTab === "myList" && (
                <StudyList onOpenCreateModal={() => setOpenModal(true)} />
            )}

            {activeTab === "added" && <AddedStudyList />}

            {/* ✅ Modal */}
            <CreateStudyListModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleCreate}
                isLoading={isLoading}
            />
        </div>
    );
}