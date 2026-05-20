"use client";

import AddedStudyList from "@/components/studyList/addedStudyList";
import StudyList from "@/components/studyList/studyList";
import useStudyListStore from "@/Store/user/studyListStore";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AddStudyListCard } from "./AddStudyListCard";
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
        <div className="space-y-8 w-full max-w-7xl mx-auto px-1 md:px-2 py-2 animate-in fade-in duration-500">
            
            {/* Page Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                    My Library
                </h1>
                <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                    Manage and organize your curated subject study lists and collections
                </p>
            </div>

            {/* 🔵 Premium Tabs Filter Controls */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2.5xl w-fit border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                <button
                    onClick={() => setActiveTab("myList")}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 ${
                        activeTab === "myList"
                            ? "bg-white dark:bg-slate-800 text-[#ae1ce9] dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700/40"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                >
                    <div className="w-2 h-2 rounded-full bg-[#ae1ce9] animate-pulse" />
                    <span>My Lists</span>
                </button>

                <button
                    onClick={() => setActiveTab("added")}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 ${
                        activeTab === "added"
                            ? "bg-white dark:bg-slate-800 text-blue-500 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-700/40"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                >
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>Added Lists</span>
                </button>
            </div>

            {/* 🟢 Content */}
            {activeTab === "myList" && (
                <div className="space-y-6">
                    <AddStudyListCard onClick={() => setOpenModal(true)} />
                    <StudyList />
                </div>
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