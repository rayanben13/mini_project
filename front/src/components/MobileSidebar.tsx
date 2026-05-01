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

    return (
        <Sheet>
            {/* TRIGGER */}
            <SheetTrigger className="p-2 rounded-md hover:bg-primary/10 transition md:hidden">
                <Menu className="w-6 h-6 text-primary" />
            </SheetTrigger>

            {/* CONTENT */}
            <SheetContent side="left" className="w-64 p-0 bg-background">
                <SheetTitle className="sr-only">Menu</SheetTitle>

                <div className="flex flex-col h-full">
                    {/* HEADER */}
                    <div className="px-4 py-5 text-lg font-bold text-primary border-b">
                        My App
                    </div>

                    {/* MENU */}
                    <div className="flex-1 px-3 py-4 space-y-2">
                        {items.map((item) => (
                            <Link
                                key={item.title}
                                href={item.url}
                                className="
                  group flex items-center gap-3 rounded-xl px-3 py-2.5
                  text-muted-foreground
                  hover:bg-primary/10
                  hover:text-primary
                  transition-all duration-200
                "
                            >
                                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                <span className="text-sm font-medium">
                                    {item.title}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* FOOTER */}
                    <div className="p-3 border-t">
                        <button
                            onClick={logout}
                            className="
                flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                text-destructive
                hover:bg-destructive/10
                transition-colors
              "
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}