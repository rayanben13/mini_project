"use client";

import {
  Bell,
  BookOpen,
  Bot,
  File,
  FileWarning,
  Home,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import useAiStore from "@/Store/ai/aiStore";
import { useMyNotificationsList } from "@/hooks/useNotifications";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UploadFileBtn from "../profile/uploadFileBtn";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "My Library", url: "/dashboard/study-list", icon: BookOpen },
  { title: "AI Assistant", url: "/dashboard/ai", icon: Bot },
  { title: "My Profile", url: "/dashboard/profile", icon: UserCircle },
  { title: "Notifications", url: "/dashboard/notification", icon: Bell },
];

const adminItems = [
  { title: "Admin Panel", url: "/admin", icon: ShieldCheck },
  { title: "Files", url: "/admin/files", icon: File },
  { title: "Reports", url: "/admin/reports", icon: FileWarning },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { openAiWindow } = useAiStore();

  const { data: notifData } = useMyNotificationsList(1, 50);

  const unreadCount =
    notifData?.data?.filter((n: any) => !n.is_read).length || 0;

  const isAdmin = pathname.startsWith("/admin");
  const currentItems = isAdmin ? adminItems : items;

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="bg-background/95 backdrop-blur-xl border-r border-border/60"
    >
      {/* HEADER */}
      <SidebarHeader className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/20 overflow-hidden">
            <div className="absolute inset-0 opacity-30 animate-pulse bg-white/20" />
            <BookOpen className="size-5 text-white relative z-10" />
          </div>

          {state === "expanded" && (
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                StudyShare
              </span>
              <span className="text-[11px] text-muted-foreground">
                Smart Learning Platform
              </span>
            </div>
          )}
        </div>

        <SidebarTrigger className="hover:bg-muted rounded-lg transition" />
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-2">
          {currentItems.map((item) => {
            const isActive =
              item.url === "/dashboard" || item.url === "/admin"
                ? pathname === item.url ||
                  (pathname.startsWith(`${item.url}/`) &&
                    !currentItems.some(
                      (other) =>
                        other.url !== item.url &&
                        pathname.startsWith(other.url),
                    ))
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={item.title !== "AI Assistant"}
                  tooltip={item.title}
                  onClick={
                    item.title === "AI Assistant"
                      ? (e) => {
                          e.preventDefault();
                          openAiWindow();
                        }
                      : undefined
                  }
                  className={`
                    group relative overflow-hidden
                    rounded-2xl h-12
                    flex items-center
                    transition-all duration-300
                    cursor-pointer
                    border border-transparent

                    ${isCollapsed ? "justify-center px-0" : "px-3"}

                    hover:bg-muted/60
                    hover:shadow-sm
                    hover:-translate-y-[1px]

                    ${
                      isActive && item.title !== "AI Assistant"
                        ? `
                          bg-gradient-to-r from-primary/15 to-primary/5
                          text-primary
                          border-primary/15
                        `
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {item.title === "AI Assistant" ? (
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl flex items-center justify-center bg-muted/50 group-hover:bg-background transition">
                        <item.icon className="size-[18px] group-hover:scale-110 group-hover:rotate-3 transition" />
                      </div>

                      {state === "expanded" && (
                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-3 w-full">
                        {/* ICON */}
                        <div
                          className={`
                            size-9 rounded-xl
                            flex items-center justify-center
                            transition
                            ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "bg-muted/50 text-muted-foreground group-hover:bg-background"
                            }
                            ${isCollapsed ? "mx-auto" : ""}
                          `}
                        >
                          <item.icon className="size-[18px] transition group-hover:scale-110 group-hover:rotate-3" />
                        </div>

                        {/* TEXT */}
                        {state === "expanded" && (
                          <span
                            className={`
                              text-sm whitespace-nowrap transition
                              ${
                                isActive
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-muted-foreground group-hover:text-foreground"
                              }
                            `}
                          >
                            {item.title}
                          </span>
                        )}
                      </div>

                      {/* BADGE */}
                      {item.title === "Notifications" && unreadCount > 0 && (
                        <span
                          className={`
                            absolute right-2 top-2
                            min-w-5 h-5 px-1.5
                            flex items-center justify-center
                            rounded-full text-[10px] font-bold text-white
                            bg-gradient-to-r from-red-500 to-rose-500
                            shadow-lg
                            ${isCollapsed ? "scale-90" : ""}
                          `}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      {!isAdmin && (
        <SidebarFooter className="p-3 border-t border-border/60">
          <SidebarMenuButton asChild tooltip="Upload File">
            <div
              className="
                group relative w-full
                h-12 rounded-2xl
                overflow-hidden
                cursor-pointer

                bg-gradient-to-r from-primary via-blue-500 to-indigo-500
                text-white

                shadow-md shadow-primary/20
                hover:shadow-xl hover:shadow-primary/30

                transition-all duration-300 ease-out
                hover:-translate-y-[2px]
                active:translate-y-0
              "
            >
              {/* glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-white/10 blur-xl" />

              {/* content */}
              <div className="relative flex items-center justify-center gap-2 font-semibold text-sm h-full">
                <span className="text-lg group-hover:scale-110 group-hover:rotate-6 transition">
                  +
                </span>

                <UploadFileBtn variant="sidebar" />
              </div>

              {/* bottom line */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 bg-white/40" />
            </div>
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
