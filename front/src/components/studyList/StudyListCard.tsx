"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useStudyListStore from "@/Store/user/studyListStore";
import useAuthStore from "@/Store/AuthStore";
import { useQueryClient } from "@tanstack/react-query";
import {
    BookOpen,
    FlaskConical,
    Palette,
    Globe,
    Calculator,
    Folder,
    FileText,
    User,
    ChevronRight,
    Trash2,
    Pencil
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

interface StudyListCardProps {
    readonly id: number;
    readonly title: string;
    readonly description?: string;
    readonly privacy?: "public" | "private";
    readonly files: number;
    readonly likes: number;
    readonly isLoved?: boolean;
    readonly isOwner?: boolean;
    readonly creatorName?: string;
}

// Helper to match subject icons perfectly to the mockup image
function getSubjectIcon(title: string, description?: string) {
    const text = `${title} ${description || ""}`.toLowerCase();
    if (text.includes("law") || text.includes("tort")) return BookOpen;
    if (text.includes("chem") || text.includes("bio") || text.includes("sci") || text.includes("organic") || text.includes("chemistry")) return FlaskConical;
    if (text.includes("art") || text.includes("paint") || text.includes("history") || text.includes("renaiss")) return Palette;
    if (text.includes("calc") || text.includes("math") || text.includes("algebra") || text.includes("calculus") || text.includes("intro to")) return Calculator;
    if (text.includes("spanish") || text.includes("english") || text.includes("globe") || text.includes("lang") || text.includes("world") || text.includes("intensive")) return Globe;
    return BookOpen; // Default to book open matching mockup screenshot
}

export default function StudyListCard({
    id,
    title,
    description = "",
    privacy = "public",
    files,
    isOwner = true,
    creatorName,
}: StudyListCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const { editStudyList, deleteStudyList, loading } = useStudyListStore();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // Form states
    const [editName, setEditName] = useState(title);
    const [editDesc, setEditDesc] = useState(description);

    const confirmDelete = async () => {
        const res = await deleteStudyList(id);

        if (res.success) {
            toast.success("Study list deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["myStudyList"] });
        } else {
            toast.error(res.message);
        }

        setOpenConfirm(false);
    };

    const onSaveEdit = async () => {
        const res = await editStudyList(id, {
            name: editName,
            description: editDesc,
            privacy: privacy, // Keep same privacy
        });

        if (res.success) {
            toast.success("Study list updated successfully");
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["myStudyList"] });
        } else {
            toast.error(res.message);
        }
    };

    const IconComponent = getSubjectIcon(title, description);
    const resolvedCreator = creatorName || user?.fullname || user?.username || "You";

    return (
        <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 min-h-[104px] cursor-pointer group">
            <div className="flex items-center gap-5 flex-1 min-w-0">
                {/* Clean blue icon container matching mockup */}
                <div className="w-16 h-16 rounded-[1.25rem] bg-blue-50/50 dark:bg-blue-950/20 text-[#0975e6] dark:text-blue-400 flex items-center justify-center shrink-0">
                    <IconComponent className="w-6 h-6" strokeWidth={2.2} />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-slate-850 dark:text-slate-100 text-[16px] leading-tight truncate">
                        {title}
                    </h4>

                    {/* Metadata row matching mockup */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{files} Files</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">By {resolvedCreator}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Actions matching mockup */}
            <div className="flex items-center gap-1 shrink-0">
                {isOwner && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditModalOpen(true);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#0975e6] hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit List"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenConfirm(true);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Delete List"
                        >
                            <Trash2 className="w-4.5 h-4.5" />
                        </button>
                    </>
                )}

                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 group-hover:text-[#0975e6] transition-all">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent data-stop onClick={(e) => e.stopPropagation()}
                    className="sm:max-w-[425px] rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-2xl p-8" >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Edit Study List</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">List Name</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                            <Textarea
                                id="description"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#0975e6] min-h-[100px] resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={onSaveEdit}
                            disabled={loading}
                            className="w-full bg-[#0975e6] hover:bg-[#0866c9] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/10 transition-all duration-300"
                        >
                            {loading ? "Saving Changes..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <DialogContent data-stop onClick={(e) => e.stopPropagation()}
                    className="max-w-md rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-2xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Confirm Deletion
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                        Are you sure you want to delete this study list? This action is permanent and cannot be undone.
                    </p>

                    <DialogFooter className="mt-6 flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setOpenConfirm(false)}
                            className="rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="rounded-xl font-bold text-xs uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white"
                        >
                            Delete List
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}