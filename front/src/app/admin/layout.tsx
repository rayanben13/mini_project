import Header from "@/components/header";
import { AppSidebar } from "@/components/sideBar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <SidebarInset className="flex-1">
                        {/* يمكنك إضافة Navbar علوي هنا للأدمن */}
                        <Header />
                        <main className="p-6">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}