
export default function StudyListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="h-[104px] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                />
            ))}
        </div>
    );
}