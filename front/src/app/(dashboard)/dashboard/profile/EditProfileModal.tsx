"use client";

import SuggestionInput from "@/components/SuggestionInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuggestions } from "@/hooks/useSuggestions";
import useUserStore from "@/Store/user/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ====== Zod Schema ======
const profileSchema = z
    .object({
        fullname: z.string().min(3).max(30),
        univ: z.string().min(2),
        major: z.string().min(2),
        specialty: z.string().optional(),
        academic_year: z.enum(["L1", "L2", "L3", "M1", "M2"]),
    })
    .superRefine((data, ctx) => {
        const isMaster = data.academic_year === "M1" || data.academic_year === "M2";

        if (isMaster && !data.specialty?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Specialization is required for Master students",
                path: ["specialty"],
            });
        }

        if (!isMaster && data.specialty) {
            ctx.addIssue({
                path: ["specialty"],
                code: "custom",
                message: "Specialty must be empty for L1–L3",
            });
        }
    });

type ProfileFormData = z.infer<typeof profileSchema>;

// ====== Props ======
interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentData: {
        fullname?: string;
        img_user?: string;
        university?: string;
        major?: string;
        specialization?: string;
        academic_year?: string;
    };
}

export default function EditProfileModal({
    isOpen,
    onClose,
    currentData,
}: EditProfileModalProps) {
    const { UpdateProfile } = useUserStore();
    const queryClient = useQueryClient();

    // ====== Image State ======
    const [imagePreview, setImagePreview] = useState<string | null>(
        currentData.img_user || null
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // ====== Form Setup ======
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullname: currentData.fullname || "",
            univ: currentData.university || "",
            major: currentData.major || "",
            specialty: currentData.specialization || "",
            academic_year: (currentData.academic_year as any) || "L1",
        },
    });

    const isMaster = ["M1", "M2"].includes(watch("academic_year") as any);


    const {
        suggestions: univSuggestions,
        isSuggestionsLoading: isUnivLoading,
        fetchSuggestions: fetchUnivSuggestions,
        clearSuggestions: clearUnivSuggestions,
    } = useSuggestions();

    const {
        suggestions: majorSuggestions,
        isSuggestionsLoading: isMajorLoading,
        fetchSuggestions: fetchMajorSuggestions,
        clearSuggestions: clearMajorSuggestions,
    } = useSuggestions();

    const {
        suggestions: specialtySuggestions,
        isSuggestionsLoading: isSpecialtyLoading,
        fetchSuggestions: fetchSpecialtySuggestions,
        clearSuggestions: clearSpecialtySuggestions,
    } = useSuggestions();

    // ✅ Local state للحقول (منفصلة عن react-hook-form لدعم الاقتراحات)
    const [univValue, setUnivValue] = useState(currentData.university || "");
    const [majorValue, setMajorValue] = useState(currentData.major || "");
    const [specialtyValue, setSpecialtyValue] = useState(currentData.specialization || "");




    // ✅ Update values only when the modal opens
    useEffect(() => {
        if (isOpen) {
            reset({
                fullname: currentData.fullname || "",
                univ: currentData.university || "",
                major: currentData.major || "",
                specialty: currentData.specialization || "",
                academic_year: (currentData.academic_year as any) || "L1",
            });
            setImagePreview(currentData.img_user || null);
            setUnivValue(currentData.university || "");
            setMajorValue(currentData.major || "");
            setSpecialtyValue(currentData.specialization || "");
        }
    }, [isOpen, reset]); // Removed currentData from deps to avoid resets while typing

    // ====== Image Handler ======
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // التحقق من نوع وحجم الصورة
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: async (formData: ProfileFormData) => {
            // ✅ إنشاء FormData لإرسال الصورة مع البيانات
            const data = new FormData();
            data.append("fullname", formData.fullname);
            data.append("univ", formData.univ);
            data.append("major", formData.major);
            data.append("academic_year", formData.academic_year);
            if (formData.specialty) {
                data.append("specialty", formData.specialty);
            }
            if (imageFile) {
                data.append("img_user", imageFile);
            }
            return await UpdateProfile(data);
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success("Profile updated successfully!");
                // ✅ تحديث الكاش تلقائياً
                queryClient.invalidateQueries({ queryKey: ["userInformation"] });
                queryClient.invalidateQueries({ queryKey: ["topFilesForUser"] });
                queryClient.invalidateQueries({ queryKey: ["myFiles"] });
                queryClient.invalidateQueries({ queryKey: ["filesLikes"] });
                queryClient.invalidateQueries({ queryKey: ["yourSubjects"] });
                queryClient.invalidateQueries({ queryKey: ["recommendedStudyList"] });
                queryClient.invalidateQueries({ queryKey: ["myNotificationsList"] });
                onClose();
            } else {
                toast.error(result.message || "Update failed");
            }
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.");
        },
    });

    const onSubmit = (data: ProfileFormData) => mutate(data);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden">

                {/* ====== Header ====== */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* ====== Form ====== */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                        {/* ====== Image Upload ====== */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="size-24 rounded-full border-4 border-[#0975e6]/10 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                    <Image
                                        src={imagePreview || "/avatar.png"}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                {/* زر تغيير الصورة */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-sm text-[#0975e6] font-medium hover:underline"
                            >
                                Change Profile Photo
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            {imageFile && (
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <Check className="w-3 h-3 text-green-500" />
                                    {imageFile.name}
                                </p>
                            )}
                        </div>

                        {/* ====== Full Name ====== */}
                        <div className="space-y-1.5">
                            <Label htmlFor="fullname" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Full Name
                            </Label>
                            <Input
                                id="fullname"
                                {...register("fullname")}
                                placeholder="Enter your full name"
                                className={`rounded-xl border-slate-200 dark:border-slate-700 focus:border-[#0975e6] ${errors.fullname ? "border-red-400" : ""
                                    }`}
                            />
                            {errors.fullname && (
                                <p className="text-xs text-red-500">{errors.fullname.message}</p>
                            )}
                        </div>

                        <SuggestionInput
                            label="University"
                            placeholder="Search your university..."
                            value={univValue}
                            onChange={(val) => {
                                setUnivValue(val);
                                setValue("univ", val); // 🔥 هذا هو الحل
                            }}
                            onFetch={(val) => fetchUnivSuggestions("univ", val)}
                            suggestions={univSuggestions}
                            isLoading={isUnivLoading}
                            error={errors.univ?.message}
                        />

                        {/* ✅ Major مع Suggestions */}
                        <SuggestionInput
                            label="Major"
                            placeholder="Search your major..."
                            value={majorValue}
                            onChange={(val) => {
                                setMajorValue(val);
                                setValue("major", val); // 🔥 مهم
                                setSpecialtyValue("");
                                setValue("specialty", "");
                                clearSpecialtySuggestions();
                            }}
                            onFetch={(val) =>
                                fetchMajorSuggestions("major", val, { univ: univValue })
                            }
                            suggestions={majorSuggestions}
                            isLoading={isMajorLoading}
                            error={errors.major?.message}
                        />

                        {/* ✅ Specialty مع Suggestions */}
                        <SuggestionInput
                            label="Specialization"
                            placeholder={
                                isMaster
                                    ? "Search your specialization..."
                                    : "Not available for L1–L3"
                            }
                            value={specialtyValue}
                            onChange={(val) => {
                                setSpecialtyValue(val);
                                setValue("specialty", val);
                            }}
                            onFetch={(val) =>
                                fetchSpecialtySuggestions("specialty", val, {
                                    univ: univValue,
                                    major: majorValue,
                                    year: getValues("academic_year"),
                                })
                            }
                            suggestions={specialtySuggestions}
                            isLoading={isSpecialtyLoading}
                            disabled={!isMaster}
                        />

                        {/* ====== Academic Year ====== */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Academic Year
                            </Label>
                            <div className="flex gap-2 flex-wrap">
                                {["L1", "L2", "L3", "M1", "M2"].map((year) => (
                                    <label
                                        key={year}
                                        className="cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            value={year}
                                            {...register("academic_year", {
                                                onChange: (e) => {
                                                    const isM = ["M1", "M2"].includes(e.target.value);
                                                    if (!isM) {
                                                        setSpecialtyValue("");
                                                        setValue("specialty", "");
                                                        clearSpecialtySuggestions();
                                                    }
                                                }
                                            })}
                                            className="sr-only peer"
                                        />
                                        <span className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 peer-checked:border-[#0975e6] peer-checked:bg-[#0975e6]/10 peer-checked:text-[#0975e6] transition-all cursor-pointer block">
                                            {year}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.academic_year && (
                                <p className="text-xs text-red-500">{errors.academic_year.message}</p>
                            )}
                        </div>

                    </div>

                    {/* ====== Footer ====== */}
                    <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 rounded-xl bg-[#0975e6] hover:bg-[#0975e6]/90"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}