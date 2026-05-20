"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useStudyListStore from "@/Store/user/studyListStore";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Folder, MoreVertical, Pencil, Trash2, Edit3, Globe, Loader2 } from "lucide-react";
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
}

export default function StudyListCard({
    id,
    title,
    description = "",
    privacy = "public",
    files,
    likes,
    isLoved = false,
    isOwner = true,
}: StudyListCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const { editStudyList, deleteStudyList, loveStudyList, loading } = useStudyListStore();
    const queryClient = useQueryClient();

    // Form states
    const [editName, setEditName] = useState(title);
    const [editDesc, setEditDesc] = useState(description);
    const [editPrivacy, setEditPrivacy] = useState(privacy);

    const handleEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditModalOpen(true);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenConfirm(true);
    };

    const confirmDelete = async () => {
        const res = await deleteStudyList(id);

        if (res.success) {
            toast.success("Study list deleted");
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
            privacy: editPrivacy,
        });

        if (res.success) {
            toast.success("Study list updated");
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["myStudyList"] });
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 rounded-[24px] p-6 flex items-center justify-between border border-[#e0e2ec] dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group min-h-[104px] relative">
            <div className="flex items-center gap-5 flex-1">
                {/* أيقونة المجلد مع خلفية متغيرة */}
                <div className="w-[60px] h-[60px] rounded-2xl bg-[#f1f3fd] dark:bg-slate-800 flex items-center justify-center text-[#0975e6] dark:text-blue-400 group-hover:bg-[#0975e6]/10 dark:group-hover:bg-blue-400/20">
                    <Folder className="w-8 h-8 fill-[#d7e3ff] dark:fill-blue-900/50" strokeWidth={1.5} />
                </div>

                <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-primary dark:text-slate-100 text-[17px] line-clamp-1 ">
                            {title}
                        </h4>

                        {isOwner ? (
                            <div className="absolute top-4 right-4 z-10">

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button data-stop variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent data-stop align="end" className="rounded-xl border-slate-200 dark:border-slate-800">
                                        <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer font-medium">
                                            <Pencil className="w-4 h-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-red-600 focus:text-red-600 font-medium">
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : null}
                    </div>

                    {description && (
                        <p className="text-[13px] text-[#74777f] dark:text-slate-400 line-clamp-1">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-[13px] text-[#74777f] dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {files} Files
                        </div>

                        <div className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 uppercase tracking-wider font-bold">
                            {privacy}
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent data-stop onClick={(e) => e.stopPropagation()}
                    className="max-w-[390px] w-full rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-2xl p-6 space-y-5" >
                    
                    {/* Centered Header */}
                    <div className="flex flex-col items-center justify-center text-center space-y-3.5 pt-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0975e6] dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Edit3 className="w-6 h-6" strokeWidth={2.2} />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                Edit Study List
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                Update your study list details
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                List Name
                            </label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0975e6] text-sm h-auto transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-800/50 dark:text-slate-100 rounded-xl px-4 py-3 min-h-[110px] resize-none outline-none focus:ring-2 focus:ring-[#0975e6] text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Visibility Card */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 flex items-center justify-between border border-slate-100/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-slate-400 shrink-0" strokeWidth={1.8} />
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Public Visibility
                                </h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
                                    Allow other students to see this list
                                </p>
                            </div>
                        </div>

                        {/* Custom Blue sliding toggle switch */}
                        <button
                            type="button"
                            onClick={() => setEditPrivacy(editPrivacy === "public" ? "private" : "public")}
                            className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ${
                                editPrivacy === "public" ? "bg-[#0975e6]" : "bg-slate-200 dark:bg-slate-700"
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-transform duration-200 shadow-sm ${
                                editPrivacy === "public" ? "translate-x-5" : "translate-x-0"
                            }`} />
                        </button>
                    </div>

                    {/* Symmetrical Action Buttons */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="w-[48%] py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onSaveEdit}
                            disabled={loading || !editName}
                            className={`w-[48%] py-3.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                loading || !editName
                                    ? "bg-blue-400 dark:bg-blue-800 cursor-not-allowed"
                                    : "bg-[#0975e6] hover:bg-[#0866c9] hover:shadow"
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
                <DialogContent data-stop onClick={(e) => e.stopPropagation()}
                    className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                            Confirm Deletion
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete this study list? This action cannot be undone.
                    </p>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setOpenConfirm(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}