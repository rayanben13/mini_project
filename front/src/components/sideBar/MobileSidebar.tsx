"use client";

import {
    BookOpen,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    UserCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // استيراد معرف المسار

import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import useAuthStore from "@/Store/AuthStore";

const items = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Academic Profile", url: "/onboarding", icon: BookOpen },
    { title: "My Profile", url: "/dashboard/profile", icon: UserCircle },
    { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileSidebar() {
    const { logout } = useAuthStore();
    const pathname = usePathname(); // معرفة المسار الحالي

    return (
        <Sheet>
            {/* TRIGGER */}
            <SheetTrigger className="p-2 rounded-md hover:bg-primary/10 dark:hover:bg-blue-500/10 transition md:hidden outline-none">
                <Menu className="w-6 h-6 text-primary dark:text-blue-400" />
            </SheetTrigger>

            {/* CONTENT */}
            <SheetContent side="left" className="w-64 p-0 bg-background dark:bg-slate-900 border-r dark:border-slate-800">
                <SheetTitle className="sr-only">Menu</SheetTitle>

                <div className="flex flex-col h-full">
                    {/* HEADER */}
                    <div className="px-6 py-6 text-xl font-bold text-primary dark:text-blue-400 border-b dark:border-slate-800">
                        My App
                    </div>

                    {/* MENU */}
                    <div className="flex-1 px-3 py-4 space-y-1.5">
                        {items.map((item) => {
                            const isActive = pathname === item.url;

                            return (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className={`
                                        group flex items-center gap-3 rounded-xl px-3 py-3
                                        transition-all duration-200
                                        ${isActive
                                            ? "bg-primary/10 text-primary dark:bg-blue-500/20 dark:text-blue-400"
                                            : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-slate-800 hover:text-foreground"}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary dark:text-blue-400" : ""}`} />
                                    <span className={`text-[15px] font-medium ${isActive ? "font-bold" : ""}`}>
                                        {item.title}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* FOOTER */}
                    <div className="p-4 border-t dark:border-slate-800">
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
                            <span className="text-[15px] font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}