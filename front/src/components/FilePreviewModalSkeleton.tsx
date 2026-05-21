"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function FilePreviewModalSkeleton() {
  return (
    <main className="flex flex-1 flex-col lg:flex-row min-h-screen bg-background text-foreground animate-pulse">
      {/* ================= MAIN ================= */}
      <div className="flex flex-1 flex-col p-4 lg:p-6 gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-[280px] rounded-xl" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="h-[600px] rounded-2xl overflow-hidden border border-border bg-muted p-4">
          <div className="flex flex-col gap-3 h-full">
            <Skeleton className="h-6 w-40 rounded-lg" />

            <div className="flex-1 rounded-xl bg-background border border-border flex items-center justify-center">
              <div className="space-y-4 w-full px-8">
                <Skeleton className="h-5 w-3/4 rounded-md mx-auto" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-[95%] rounded-md" />
                <Skeleton className="h-4 w-[88%] rounded-md" />
                <Skeleton className="h-4 w-[92%] rounded-md" />
                <Skeleton className="h-4 w-[70%] rounded-md" />

                <div className="pt-8 space-y-3">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-[90%] rounded-md" />
                  <Skeleton className="h-4 w-[75%] rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-24 rounded-xl" />
        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      <aside className="w-full lg:w-[380px] p-4 lg:p-6 border-l border-border bg-card flex flex-col gap-6">
        {/* AI Button */}
        <Skeleton className="h-14 w-full rounded-xl" />

        {/* Card */}
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
          {/* Header */}
          <Skeleton className="h-4 w-32 mb-8 rounded-md" />

          <div className="space-y-6">
            {/* User */}
            <div>
              <Skeleton className="h-4 w-28 mb-3 rounded-md" />

              <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-24 rounded-md" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800" />

            {/* Subject */}
            <div>
              <Skeleton className="h-4 w-20 mb-2 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>

            {/* Info Fields */}
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2 rounded-md" />
                  <Skeleton className="h-5 w-40 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
