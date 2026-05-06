"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

import useFilesStore from "@/Store/user/filesStore";

// 1. تعريف مخطط التحقق
const reportSchema = z.object({
    category: z.string().min(1, "Please select a category"),
    details: z.string()
        .min(3, "Details must be at least 3 characters")
        .max(500, "Details cannot exceed 500 characters")
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ReportDialogProps {
    file: { id_file: string | number };
}

export default function ReportDialog({ file }: ReportDialogProps) {
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const { reportFile } = useFilesStore();

    const reportReasons = [
        "Inappropriate content",
        "COPYRIGHT issuse",
        "Spam or misleading",
        "Incorrect information",
        "Other",
    ];

    // 2. إعداد النموذج
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            category: "",
            details: "",
        },
    });

    // مراقبة القيم لتحديث العداد والـ Select
    const categoryValue = watch("category");
    const detailsValue = watch("details");

    const onSubmit = async (values: ReportFormValues) => {
        setIsReporting(true);

        const res = await reportFile(Number(file.id_file), values.category, values.details);

        if (res.success) {
            toast.success("File reported successfully. Our team will review it.");
            setIsReportDialogOpen(false);
            reset();
        } else {
            toast.error(res.message || "Failed to report file");
        }

        setIsReporting(false);
    };

    return (
        <Dialog open={isReportDialogOpen} onOpenChange={(open) => {
            setIsReportDialogOpen(open);
            if (!open) reset();
        }}>
            <DialogTrigger asChild>
                <button className="p-2 border border-border rounded-xl text-red-500 hover:bg-red-500/10 transition flex items-center gap-2 font-medium">
                    Report
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 gap-0">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-black">Report Document</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Help us keep the community safe. Please explain why you are reporting this document.
                    </DialogDescription>
                </DialogHeader>

                {/* نموذج عادي بدون مكونات Form المعقدة */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* حقل التصنيف */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Category</label>
                        <Select
                            onValueChange={(val) => setValue("category", val, { shouldValidate: true })}
                            value={categoryValue}
                        >
                            <SelectTrigger className={`rounded-xl h-12 ${errors.category ? "border-red-500 ring-red-500/10" : ""}`}>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {reportReasons.map((reason) => (
                                    <SelectItem key={reason} value={reason} className="rounded-lg">
                                        {reason}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="text-xs font-bold text-red-500">{errors.category.message}</p>
                        )}
                    </div>

                    {/* حقل التفاصيل */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-700">Details</label>
                            <span className={`text-[10px] font-black ${detailsValue.length > 500 ? "text-red-500" : "text-slate-400"}`}>
                                {detailsValue.length}/500
                            </span>
                        </div>
                        <Textarea
                            {...register("details")}
                            placeholder="Provide more context (min. 3 characters)..."
                            className={`min-h-[120px] rounded-2xl resize-none border-slate-200 focus:border-[#0975e6] focus:ring-[#0975e6]/10 ${errors.details ? "border-red-500 focus:ring-red-500/10" : ""
                                }`}
                        />
                        {errors.details && (
                            <p className="text-xs font-bold text-red-500">{errors.details.message}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-2 sm:justify-between flex-row">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsReportDialogOpen(false)}
                            className="rounded-xl font-bold flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isReporting}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold px-8 flex-1 h-11"
                        >
                            {isReporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Reporting...
                                </>
                            ) : "Submit Report"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}