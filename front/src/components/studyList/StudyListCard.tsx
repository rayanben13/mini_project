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
                    className="sm:max-w-[425px] rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-2xl" >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Edit Study List</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Name</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="rounded-xl border-slate-200 dark:border-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
                            <Textarea
                                id="description"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="rounded-xl border-slate-200 dark:border-slate-800 min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="privacy" className="text-xs font-black uppercase tracking-widest text-slate-400">Privacy</Label>
                            <Select value={editPrivacy} onValueChange={(val: any) => setEditPrivacy(val)}>
                                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Select privacy" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={onSaveEdit}
                            disabled={loading}
                            className="w-full bg-[#0975e6] hover:bg-[#0866c9] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-sm"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
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