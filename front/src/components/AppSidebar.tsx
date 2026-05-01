"use client";

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Settings,
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

import useAuthStore from "@/Store/AuthStore";
import Link from "next/link";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Academic Profile", url: "/onboarding", icon: BookOpen },
  { title: "My Profile", url: "/dashboard/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { logout } = useAuthStore();
  const { state } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar border-r border-sidebar-border"
    >
      {/* HEADER */}
      <SidebarHeader className="flex items-center justify-between px-4 py-5">
        {state === "expanded" && (
          <span className="text-lg font-semibold text-primary">
            My App
          </span>
        )}
        <SidebarTrigger className="hover:bg-sidebar-accent rounded-md transition-colors" />
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="
                  group rounded-xl px-3 py-2
                  text-sidebar-foreground
                  hover:bg-primary/10
                  hover:text-primary
                  transition-all duration-200
                "
              >
                <Link href={item.url}>
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {state === "expanded" && (
                    <span className="font-medium">{item.title}</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <SidebarMenuButton
          onClick={logout}
          tooltip="Logout"
          className="
            rounded-xl px-3 py-2
            bg-primary text-primary-foreground
            hover:opacity-90
            transition
          "
        >
          <LogOut className="w-5 h-5" />
          {state === "expanded" && (
            <span className="font-medium">Logout</span>
          )}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}