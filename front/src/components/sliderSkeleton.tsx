"use client";

export default function SliderSkeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Skeleton للهيدر (العنوان والأزرار) */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>
            </div>

            {/* Skeleton لبطاقات الملفات (Cards) */}
            <div className="flex gap-6 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_31%] border border-slate-100 dark:border-slate-800 rounded-2xl p-0 overflow-hidden"
                    >
                        {/* منطقة الصورة/المعاينة */}
                        <div className="h-32 bg-slate-100 dark:bg-slate-800/50" />

                        {/* منطقة النصوص */}
                        <div className="p-5 space-y-4">
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="h-5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                            <div className="flex gap-2">
                                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                                <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between">
                                <div className="h-4 w-10 bg-slate-100 dark:bg-slate-800 rounded" />
                                <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}