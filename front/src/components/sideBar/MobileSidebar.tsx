"use client";

import {
    Bell,
    BookOpen,
    File,
    FileWarning,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    UserCircle,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMyNotificationsList } from "@/hooks/useNotifications";

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import useAuthStore from "@/Store/AuthStore";
import UploadFileBtn from "../profile/uploadFileBtn";

const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Library", url: "/dashboard/study-list", icon: BookOpen },
    { title: "My Profile", url: "/dashboard/profile", icon: UserCircle },
    { title: "Notifications", url: "/dashboard/notification", icon: Bell },
];

const adminItems = [
    { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
    { title: "Files", url: "/admin/files", icon: File },
    { title: "Reports", url: "/admin/reports", icon: FileWarning },
];

export function MobileSidebar() {

    const { logout } = useAuthStore();

    const pathname = usePathname();
    const { data: notifData } = useMyNotificationsList(1, 50);
    const unreadCount = notifData?.data?.filter((n: any) => !n.is_read).length || 0;

    const isAdmin = pathname.startsWith("/admin");

    const currentItems = isAdmin
        ? adminItems
        : items;

    return (
        <Sheet>

            {/* Trigger */}
            <SheetTrigger className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-blue-500/10 transition md:hidden outline-none">

                <Menu className="w-6 h-6 text-primary dark:text-blue-400" />

            </SheetTrigger>

            {/* Sidebar */}
            <SheetContent
                side="left"
                className="w-72 p-0 bg-background dark:bg-slate-900 border-r dark:border-slate-800"
            >

                <SheetTitle className="sr-only">
                    Mobile Sidebar
                </SheetTitle>

                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="px-6 py-6 border-b dark:border-slate-800">

                        <h2 className="text-xl font-bold text-primary dark:text-blue-400">
                            {isAdmin
                                ? "Admin Console"
                                : "My App"}
                        </h2>

                    </div>

                    {/* Menu */}
                    <div className="flex-1 px-3 py-4 space-y-2">

                        {currentItems.map((item) => {

                            const isActive =
                                item.url === "/dashboard" ||
                                    item.url === "/admin"
                                    ? pathname === item.url ||
                                    (
                                        pathname.startsWith(`${item.url}/`) &&
                                        !currentItems.some(
                                            (other) =>
                                                other.url !== item.url &&
                                                pathname.startsWith(other.url)
                                        )
                                    )
                                    : pathname.startsWith(item.url);

                            return (

                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className={`
                                        group flex items-center justify-between rounded-xl px-3 py-3
                                        transition-all duration-200

                                        ${isActive
                                            ? "bg-primary/10 text-primary dark:bg-blue-500/20 dark:text-blue-400"
                                            : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-slate-800 hover:text-foreground"
                                        }
                                    `}
                                >

                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            className={`
                                                w-5 h-5 transition-transform group-hover:scale-110

                                                ${isActive
                                                    ? "text-primary dark:text-blue-400"
                                                    : ""
                                                }
                                            `}
                                        />

                                        <span
                                            className={`
                                                text-[15px] font-medium

                                                ${isActive
                                                    ? "font-bold"
                                                    : ""
                                                }
                                            `}
                                        >
                                            {item.title}
                                        </span>
                                    </div>

                                    {item.title === "Notifications" && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 min-w-5 h-5 flex items-center justify-center animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}

                                </Link>

                            );
                        })}

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t dark:border-slate-800 space-y-3">

                        {/* Upload */}
                        {!isAdmin && (
                            <UploadFileBtn variant="sidebar" />
                        )}

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="
                                flex w-full items-center gap-3 rounded-xl px-3 py-3
                                text-destructive dark:text-red-400
                                hover:bg-destructive/10 dark:hover:bg-red-400/10
                                transition-colors
                            "
                        >

                            <LogOut className="w-5 h-5" />

                            <span className="text-[15px] font-medium">
                                Logout
                            </span>

                        </button>

                    </div>

                </div>

            </SheetContent>

        </Sheet>
    );
}