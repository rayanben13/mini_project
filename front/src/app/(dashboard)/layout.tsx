"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center border-b px-4">
          {/* يمكنك وضع زر البحث أو التنبيهات هنا */}
        </header>
        <main className="p-4 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
