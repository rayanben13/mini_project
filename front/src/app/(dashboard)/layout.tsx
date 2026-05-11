"use client";

import AiWindow from "@/components/ai/AiWindow";
import Header from "@/components/header";
import ReminderDialog from "@/components/notifications/ReminderDialog";
import { AppSidebar } from "@/components/sideBar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarProvider style={
        {
          "--sidebar-width": "15rem",       // ≈ w-56
          "--sidebar-width-icon": "3rem",   // collapsed
        } as React.CSSProperties
      }>

        <AppSidebar />

        <SidebarInset className="flex flex-col min-w-0 relative">
          <Header />
          <ReminderDialog />
          {/* استخدام min-w-0 هنا ضروري جداً لكي تسمح للمحتوى بالتقلص 
              داخل الـ Flexbox بدلاً من دفع الحواف للخارج.
          */}
          <main className="flex-1 p-4 md:p-6 w-full max-w-full overflow-x-hidden">
            <div className="mx-auto max-w-full lg:max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
      <AiWindow />
    </TooltipProvider>
  );
}