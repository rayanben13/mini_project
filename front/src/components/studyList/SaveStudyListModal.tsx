"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useMyStudyList } from "@/hooks/useStudyList";
import useFilesStore from "@/Store/user/filesStore";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: number;
}

export default function SaveStudyListModal({ isOpen, onClose, fileId }: SaveModalProps) {
    const { data: studyLists, isLoading } = useMyStudyList();
    console.log(studyLists);
    const { saveFileToStudyList } = useFilesStore();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <FolderPlus className="w-5 h-5 text-primary" />
                        Save to Study List
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : studyLists?.data?.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {studyLists?.data?.map((list: any) => (
                                <button
                                    key={list?.id_stuList}
                                    onClick={async () => {
                                        try {
                                            // نفترض أن id_file متاح في هذا السياق (Context)
                                            const response = await saveFileToStudyList(fileId, list.id_stuList);

                                            if (response.success) {
                                                toast.success(`Successfully added to "${list.name}"`, {
                                                    description: "Your file has been saved to your study list.",
                                                    duration: 3000,
                                                });
                                                onClose(); // إغلاق المودال بعد النجاح
                                            } else {
                                                toast.error(response.message || "Failed to save file");
                                            }
                                        } catch (error) {
                                            toast.error("Something went wrong. Please try again.");
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-primary/5 hover:border-primary transition-all text-left group dark:border-slate-800 dark:hover:bg-blue-500/10"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-semibold group-hover:text-primary transition-colors dark:text-slate-200">
                                            {list.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {list.count_files} files saved
                                        </span>
                                    </div>

                                    {/* أيقونة اختيار تظهر عند الحوم (Hover) */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-primary text-sm font-bold">Add +</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-6 text-sm">
                            No study lists found. Create one first!
                        </p>
                    )}

                    <button
                        className="w-full py-2.5 mt-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition shadow-md"
                    >
                        Create New List
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}