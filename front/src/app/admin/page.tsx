"use client";

import {
    useAdminDashboardContributors,
    useAdminDashboardGraph,
    useAdminDashboardStats
} from "@/hooks/useAdminDashboard";

import {
    ClipboardList,
    FileText,
    Loader2,
    User
} from "lucide-react";

import Image from "next/image";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis
} from "recharts";

export default function AdminPage() {
    const { data: statsData, isLoading: isLoadingStats } =
        useAdminDashboardStats();

    const { data: graphData, isLoading: isLoadingGraph } =
        useAdminDashboardGraph();

    const { data: contributorsData, isLoading: isLoadingContributors } =
        useAdminDashboardContributors();

    if (isLoadingStats || isLoadingGraph || isLoadingContributors) {
        return (
            <div className="h-[80vh] w-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                    Admin Dashboard
                </h1>

                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Overview of platform activity and contributors.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Users */}
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

                    <div className="relative flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <User size={24} />
                        </div>

                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400">
                            Active
                        </span>
                    </div>

                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            Total Users
                        </p>

                        <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                            {statsData?.totalUsers?.toLocaleString() || 0}
                        </h2>
                    </div>
                </div>

                {/* Files */}
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />

                    <div className="relative flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={24} />
                        </div>

                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Live
                        </span>
                    </div>

                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            Total Files
                        </p>

                        <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                            {statsData?.totalFiles?.toLocaleString() || 0}
                        </h2>
                    </div>
                </div>

                {/* Study Lists */}
                <div className="relative overflow-hidden rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />

                    <div className="relative flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <ClipboardList size={24} />
                        </div>

                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Live
                        </span>
                    </div>

                    <div className="relative">
                        <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                            Total Study Lists
                        </p>

                        <h2 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">
                            {statsData?.totalStudyLists || 0}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">

                <div className="absolute -top-20 -right-20 w-52 h-52 bg-primary/10 blur-3xl rounded-full" />

                <div className="relative flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-5 h-5" />
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                                File Upload Trends
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Last 7 days analytics
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
                        Weekly Analytics
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={graphData?.stats || []}
                            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="colorUploads"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#0975e6"
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#0975e6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                strokeOpacity={0.08}
                                stroke="#64748b"
                            />

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                minTickGap={0}
                                padding={{ left: 16, right: 16 }}
                                dy={12}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                            />

                            <Tooltip
                                cursor={{
                                    stroke: "#0975e6",
                                    strokeWidth: 1,
                                    strokeDasharray: "4 4",
                                }}
                                contentStyle={{
                                    borderRadius: "18px",
                                    border:
                                        "1px solid rgba(148,163,184,0.15)",
                                    background: "rgba(15,23,42,0.92)",
                                    color: "#fff",
                                    backdropFilter: "blur(12px)",
                                    boxShadow:
                                        "0px 10px 40px rgba(0,0,0,0.35)",
                                }}
                                labelStyle={{
                                    color: "#fff",
                                    fontWeight: 700,
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="totalUplodesOfDate"
                                stroke="#0975e6"
                                strokeWidth={3}
                                fill="url(#colorUploads)"
                                dot={{
                                    r: 4,
                                    strokeWidth: 2,
                                    fill: "#0f172a",
                                }}
                                activeDot={{
                                    r: 7,
                                    stroke: "#0975e6",
                                    strokeWidth: 3,
                                    fill: "#0f172a",
                                }}
                                animationDuration={1600}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Contributors */}
            <div className="overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

                <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                            Top Contributors
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Most active users on the platform
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-8 py-5 text-left font-bold">
                                    Contributor
                                </th>

                                <th className="px-8 py-5 text-center font-bold">
                                    Lists
                                </th>

                                <th className="px-8 py-5 text-center font-bold">
                                    Likes
                                </th>

                                <th className="px-8 py-5 text-center font-bold">
                                    Uploads
                                </th>

                                <th className="px-8 py-5 text-center font-bold">
                                    Followers
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {contributorsData?.data?.top10.map(
                                (contributor: any, index: number) => (
                                    <tr
                                        key={contributor.id || index}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">

                                                <div className="relative size-10 rounded-full overflow-hidden border border-primary/20 shrink-0 bg-slate-100 dark:bg-slate-800">
                                                    {contributor.avatar ? (
                                                        <Image
                                                            src={contributor.avatar}
                                                            alt={contributor.name}
                                                            fill
                                                            className="object-cover"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">
                                                            {contributor.fullname?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors whitespace-nowrap">
                                                    {contributor.fullname}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-8 py-5 text-center font-semibold text-slate-600 dark:text-slate-300">
                                            {contributor.studyLists || 0}
                                        </td>

                                        <td className="px-8 py-5 text-center font-semibold text-slate-600 dark:text-slate-300">
                                            {contributor.likes || 0}
                                        </td>

                                        <td className="px-8 py-5 text-center font-black text-slate-900 dark:text-slate-100">
                                            {contributor.files || 0}
                                        </td>

                                        <td className="px-8 py-5 text-center font-semibold text-slate-600 dark:text-slate-300">
                                            {contributor.followers || 0}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}