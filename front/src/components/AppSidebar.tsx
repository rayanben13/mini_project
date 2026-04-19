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

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Academic Profile", url: "/onboarding", icon: BookOpen },
  { title: "My Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { logout } = useAuthStore();
  const { state } = useSidebar(); // لمعرفة حالة السيدبار (collapsed أو expanded)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-4">
        {state === "expanded" && (
          <span className="font-bold text-lg">My App</span>
        )}
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenuButton
          onClick={logout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          tooltip="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
