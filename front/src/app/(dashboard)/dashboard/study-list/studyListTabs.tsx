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

    const queryClient = useQueryClient(); // ✅ FIX

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

            // 🔄 refresh data
            queryClient.invalidateQueries({ queryKey: ["myStudyList"] });
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="space-y-6">

            {/* 🔵 Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("myList")}
                    className={`px-4 py-2 rounded-lg font-medium transition
            ${activeTab === "myList"
                            ? "bg-primary text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                >
                    My Lists
                </button>

                <button
                    onClick={() => setActiveTab("added")}
                    className={`px-4 py-2 rounded-lg font-medium transition
            ${activeTab === "added"
                            ? "bg-primary text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }`}
                >
                    Added Lists
                </button>
            </div>

            {/* 🟢 Content */}
            {activeTab === "myList" && (
                <div className="space-y-4">
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