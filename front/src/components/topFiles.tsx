// components/topFiles.tsx
"use client";

import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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

export const FileCard = memo(({ file, onNavigate }: { file: any, onNavigate: () => void }) => {

    // ✅ إما نستخدم Link مباشر (للتنقل)، أو onclick للحاوية
    const cardContent = (
        <>
            {/* الجزء العلوي - معاينة */}
            <div onClick={(e) => { e.stopPropagation(); onNavigate(); }} className="h-32 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                <div className="absolute inset-x-4 top-4 bottom-0 bg-white dark:bg-slate-800 rounded-t-xl shadow-sm p-3 translate-y-4 group-hover:translate-y-2 transition-transform duration-300">
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                        {file.title}
                    </p>
                </div>
            </div>

            {/* المحتوى */}
            <div className="p-5">
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md">
                    {file.major || "general"}
                </span>

                <h3 className="mt-3 text-md font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {file.title}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
                    <span className="text-xs font-medium">{file.course}</span>
                    <span className="text-[10px] opacity-30">•</span>
                    <span className="text-xs">{file.type}</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        ❤️ <span className="font-semibold text-slate-600 dark:text-slate-300">{file.likes_count || 0}</span>
                    </p>

                    {/* زر Show أصبح جزءاً من الرابط */}
                    {/* {onNavigate && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onNavigate(); }} // منع التفاعل المزدوج
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            View Details →
                        </button>
                    )} */}
                </div>
            </div>
        </>
    );

    return (
        <div
            onClick={onNavigate}
            className="block h-full"
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full relative">

                {/* Hover Overlay (اختياري: إظهار تفاصيل إضافية عند الوقوف) */}
                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                {cardContent}
            </div>
        </div>
    );
});

FileCard.displayName = "FileCard";