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
import { FileText, Folder, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
    isOwner = true,
}: StudyListCardProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const { editStudyList, deleteStudyList, loading } = useStudyListStore();
    const queryClient = useQueryClient();

    // Form states
    const [editName, setEditName] = useState(title);
    const [editDesc, setEditDesc] = useState(description);
    const [editPrivacy, setEditPrivacy] = useState(privacy);

    const handleEdit = (e: React.MouseEvent) => {
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
            privacy: editPrivacy,
        });

        if (res.success) {
            toast.success("Study list updated successfully");
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["myStudyList"] });
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between border border-slate-100 dark:border-slate-800/80 hover:shadow-md hover:border-[#ae1ce9]/20 transition-all duration-300 cursor-pointer group min-h-[104px]">
            <div className="flex items-center gap-5 flex-1 min-w-0">
                {/* Modern decorative folder icon with beautiful purple/blue gradient */}
                <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-[#0975e6]/10 to-[#ae1ce9]/10 dark:from-[#0975e6]/20 dark:to-[#ae1ce9]/20 flex items-center justify-center text-[#ae1ce9] dark:text-purple-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <Folder className="w-7 h-7 fill-[#ae1ce9]/20 dark:fill-[#ae1ce9]/40" strokeWidth={1.5} />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight truncate group-hover:text-[#ae1ce9] dark:group-hover:text-purple-400 transition-colors">
                            {title}
                        </h4>
                    </div>

                    {description && (
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 line-clamp-1 leading-relaxed">
                            {description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span>{files} Files</span>
                        </div>

                        {/* Semantic, visually elegant privacy badge */}
                        <div className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                            privacy === "public"
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}>
                            {privacy}
                        </div>
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className="absolute top-5 right-5 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button data-stop variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <MoreVertical className="h-4.5 w-4.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent data-stop align="end" className="rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl p-1.5">
                            <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 p-2.5">
                                <Pencil className="w-4 h-4 text-[#0975e6]" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer text-rose-500 focus:text-rose-500 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 p-2.5">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

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
                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#ae1ce9]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                            <Textarea
                                id="description"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#ae1ce9] min-h-[100px] resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="privacy" className="text-xs font-black uppercase tracking-widest text-slate-400">Privacy Status</Label>
                            <Select value={editPrivacy} onValueChange={(val: any) => setEditPrivacy(val)}>
                                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-[#ae1ce9]">
                                    <SelectValue placeholder="Select privacy" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
                                    <SelectItem value="public" className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">Public</SelectItem>
                                    <SelectItem value="private" className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={onSaveEdit}
                            disabled={loading}
                            className="w-full bg-[#ae1ce9] hover:bg-[#9612c8] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/10 transition-all duration-300"
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