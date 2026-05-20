// components/topFiles.tsx
"use client";

import { Button } from "@/components/ui/button";
import { getPdfPreview } from "@/utils/cloudinary";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader2, Clock, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";

export default function TopFilesSlider({
    data,
    title,
    icon,
    onLoadMore,
    hasMore,
    isLoadingMore = false,
    itemKey = "id_file",
    renderItem,
    onFileClick, // ✅ جديد: دالة عند النقر (اختيارية)
}: {
    readonly data: any[],
    readonly title: string,
    readonly icon: any,
    readonly onLoadMore?: () => void,
    readonly hasMore?: boolean,
    readonly isLoadingMore?: boolean,
    readonly itemKey?: string,
    readonly renderItem?: (item: any, index: number) => React.ReactNode,
    readonly onFileClick?: (fileId: string | number) => void, // ✅ جديد
}) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        slidesToScroll: 1,
        containScroll: "trimSnaps",
        dragFree: true,
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
    const prevDataLength = useRef(data.length);
    const currentIndexRef = useRef(0);

    const onSelect = useCallback((api: any) => {
        if (!api) return;
        setPrevBtnDisabled(!api.canScrollPrev());
        setNextBtnDisabled(!api.canScrollNext());
        currentIndexRef.current = api.selectedScrollSnap();
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        if (data.length > prevDataLength.current) {
            const scrollIndex = currentIndexRef.current;
            emblaApi.reInit();
            setTimeout(() => emblaApi.scrollTo(scrollIndex, true), 0);
        }

        prevDataLength.current = data.length;
        onSelect(emblaApi);
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, data, onSelect]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);

    const scrollNext = useCallback(() => {
        if (!emblaApi) return;
        if (emblaApi.canScrollNext()) {
            emblaApi.scrollNext();
        } else if (hasMore && onLoadMore && !isLoadingMore) {
            onLoadMore();
        }
    }, [emblaApi, hasMore, onLoadMore, isLoadingMore]);

    return (
        <section className="mb-12 px-2">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {icon}
                    {title}
                </h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollPrev}
                        disabled={prevBtnDisabled}
                        className="rounded-full shadow-sm disabled:opacity-30"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={scrollNext}
                        disabled={(nextBtnDisabled && !hasMore) || isLoadingMore}
                        className="rounded-full shadow-sm"
                    >
                        {isLoadingMore
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <ChevronRight className="w-5 h-5" />
                        }
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {data?.map((item: any, index: number) => (
                        <div
                            key={item[itemKey]}
                            className="flex-[0_0_85%] md:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4"
                        >
                            {/* ✅ تمرير dunction للنقر */}
                            {renderItem
                                ? renderItem(item, index)
                                : <FileCard file={item} onNavigate={() => onFileClick?.(item[itemKey])}
                                />
                            }
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export const FileCard = memo(({
    file,
    onNavigate,
    showStatus = false,
}: {
    file: any;
    onNavigate: () => void;
    showStatus?: boolean;
}) => {
    const previewUrl = getPdfPreview(file.file_path);

    // Dynamic semantic status badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <div className="absolute top-4 right-4 z-20 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Pending</span>
                    </div>
                );
            case "accepted":
                return (
                    <div className="absolute top-4 right-4 z-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <CheckCircle className="w-3 h-3" />
                        <span>Accepted</span>
                    </div>
                );
            case "rejected":
                return (
                    <div className="absolute top-4 right-4 z-20 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Rejected</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const cardContent = (
        <>
            {/* Upper Section - Preview */}
            <div
                onClick={(e) => { e.stopPropagation(); onNavigate(); }}
                className="h-36 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden rounded-t-2xl border-b border-slate-100 dark:border-slate-800"
            >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-[#ae1ce9]/5"></div>

                {/* Preview Image */}
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    <Image
                        src={previewUrl}
                        alt={file.title}
                        fill
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x600/e2e8f0/64748b?text=No+Preview";
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

                    {/* Status Badge */}
                    {showStatus && getStatusBadge(file.status)}

                    {/* Rejection Hover Tooltip Overlay (Stunning Glassmorphism) */}
                    {showStatus && file.status === "rejected" && (
                        <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center items-center p-4 text-center z-30 backdrop-blur-sm">
                            <AlertCircle className="w-5 h-5 text-rose-500 mb-1.5 animate-bounce" />
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-400">Rejection Reason</span>
                            <div className="max-h-16 overflow-y-auto mt-1 px-1 w-full custom-scrollbar">
                                <p className="text-[11px] text-slate-100 font-medium leading-relaxed">
                                    {file.reason_rejected || "No reason specified by administrator."}
                                </p>
                            </div>
                            <span className="text-[8px] text-slate-400/80 mt-2 font-semibold uppercase tracking-wider">Hover out to view details</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Lower Section - Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#ae1ce9] bg-[#ae1ce9]/10 px-2.5 py-1 rounded-md">
                            {file.major || "General"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase">
                            {file.type || "Other"}
                        </span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-[#ae1ce9] transition-colors">
                        {file.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
                        <span className="text-xs font-medium truncate max-w-[150px]">{file.course || "No Course"}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    {file.likes_count !== undefined && file.likes_count > 0 && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="text-red-500">❤️</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{file.likes_count}</span>
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <div onClick={onNavigate} className="block h-full">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group h-full relative overflow-hidden flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.02] pointer-events-none" />
                {cardContent}
            </div>
        </div>
    );
});

FileCard.displayName = "FileCard";