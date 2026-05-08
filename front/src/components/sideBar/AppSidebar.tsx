"use client";

import {
  Bell,
  BookOpen,
  File,
  LayoutDashboard,
  ShieldCheck,
  UserCircle
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

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { title: "Reports", url: "/admin/reports", icon: File },
  { title: "Universities", url: "/admin/universities", icon: File },
  { title: "Subjects", url: "/admin/subjects", icon: File },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  const currentItems = isAdmin ? adminItems : items;

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar border-r border-sidebar-border"
    >
      <SidebarHeader className="flex items-center justify-between px-4 py-5">
        {state === "expanded" && (
          <span className="text-lg font-semibold text-primary dark:text-blue-400">
            {isAdmin ? "Admin Console" : "My App"}
          </span>
        )}
        <SidebarTrigger className="hover:bg-sidebar-accent rounded-md transition-colors" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-2">
          {currentItems.map((item) => {
            const isActive = item.url === "/dashboard" || item.url === "/admin"
              ? pathname === item.url || (pathname.startsWith(`${item.url}/`) && !currentItems.some(other => other.url !== item.url && pathname.startsWith(other.url)))
              : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`
                    group rounded-xl px-3 py-2
                    transition-all duration-200
                    ${isActive
                      ? "bg-primary/10 text-primary dark:bg-blue-500/20 dark:text-blue-400"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                  `}
                >
                  <Link href={item.url}>
                    <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary dark:text-blue-400" : ""}`} />
                    {state === "expanded" && (
                      <span className={`font-medium ${isActive ? "font-bold" : ""}`}>
                        {item.title}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {!isAdmin && (
        <SidebarFooter className="p-3 border-t border-sidebar-border">
          <SidebarMenuButton
            asChild
            tooltip="Upload File"
            className="
              rounded-xl px-3 py-2
              bg-primary text-primary-foreground
              hover:opacity-90
              transition
              dark:bg-blue-600 dark:hover:bg-blue-700
            "
          >
            <UploadFileBtn variant="sidebar" />
          </SidebarMenuButton>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}