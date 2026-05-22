// components/topFiles.tsx
"use client";

import { Button } from "@/components/ui/button";
import { getPdfPreview } from "@/utils/cloudinary";
import useEmblaCarousel from "embla-carousel-react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  ThumbsUp,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useDeleteMyFile } from "@/hooks/useFilesInformations";
import { toast } from "sonner";

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
  readonly data: any[];
  readonly title: string;
  readonly icon: any;
  readonly onLoadMore?: () => void;
  readonly hasMore?: boolean;
  readonly isLoadingMore?: boolean;
  readonly itemKey?: string;
  readonly renderItem?: (item: any, index: number) => React.ReactNode;
  readonly onFileClick?: (fileId: string | number) => void; // ✅ جديد
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
            {isLoadingMore ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {data?.length === 0 ? (
        <p className="flex items-center justify-center gap-2 text-muted-foreground">
          No files available
        </p>
      ) : (
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {data?.map((item: any, index: number) => (
              <div
                key={item[itemKey]}
                className="flex-[0_0_85%] md:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4"
              >
                {renderItem ? (
                  renderItem(item, index)
                ) : (
                  <FileCard
                    file={item}
                    showStatus={true}
                    onNavigate={() => onFileClick?.(item[itemKey])}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export const FileCard = memo(
  ({
    file,
    onNavigate,
    showStatus = false,
    allowDelete = false,
    onDelete,
  }: {
    file: any;
    onNavigate: () => void;
    showStatus?: boolean;
    allowDelete?: boolean;
    onDelete?: (id_file: number) => void;
  }) => {
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const deleteMutation = useDeleteMyFile();
    const menuRef = useRef<HTMLDivElement>(null);
    const previewUrl = getPdfPreview(file.file_path);

    useEffect(() => {
      if (!showDeleteMenu) return;
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setShowDeleteMenu(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showDeleteMenu]);

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
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}
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
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/400x600/e2e8f0/64748b?text=No+Preview";
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
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-400">
                  Rejection Reason
                </span>
                <div className="max-h-16 overflow-y-auto mt-1 px-1 w-full custom-scrollbar">
                  <p className="text-[11px] text-slate-100 font-medium leading-relaxed">
                    {file.reason_rejected ||
                      "No reason specified by administrator."}
                  </p>
                </div>
                <span className="text-[8px] text-slate-400/80 mt-2 font-semibold uppercase tracking-wider">
                  Hover out to view details
                </span>
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
              <span className="text-xs font-medium truncate max-w-[150px]">
                {file.course || "No Course"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
            {file.likes_count !== undefined && file.likes_count > 0 ? (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <ThumbsUp className={`w-5 h-5`} />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {file.likes_count}
                </span>
              </p>
            ) : (
              <span />
            )}

            {/* 3-dot Menu — Bottom Right */}
            {allowDelete && file.status === "accepted" && (
              <div
                ref={menuRef}
                className="relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteMenu(!showDeleteMenu);
                  }}
                  className="flex items-center justify-center size-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showDeleteMenu && (
                  <div className="absolute bottom-full right-0 mb-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-bottom-1 duration-150 z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteConfirmOpen(true);
                        setShowDeleteMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
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

        {/* Custom Premium Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteConfirmOpen(false);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 flex-shrink-0">
                  <Trash2 className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    Delete File
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Are you sure you want to permanently delete this file? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteConfirmOpen(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-extrabold text-slate-700 dark:text-slate-300 cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(file.id_file, {
                      onSuccess: () => {
                        toast.success("File deleted successfully");
                        setIsDeleteConfirmOpen(false);
                        onDelete?.(file.id_file);
                      },
                      onError: (err: any) => {
                        toast.error(err?.response?.data?.error || "Failed to delete file");
                      },
                    });
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-extrabold text-xs transition duration-150 cursor-pointer flex items-center justify-center active:scale-95 gap-1.5"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Delete File"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

FileCard.displayName = "FileCard";
