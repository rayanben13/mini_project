'use client';

import {
  Bell,
  BookOpen,
  Bot,
  File,
  FileWarning,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

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
} from '@/components/ui/sidebar';

import { House } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UploadFileBtn from '../profile/uploadFileBtn';
import useAiStore from '@/Store/ai/aiStore';
import { useMyNotificationsList } from '@/hooks/useNotifications';

const items = [
  { title: 'Home', url: '/dashboard', icon: House },
  { title: 'My Library', url: '/dashboard/study-list', icon: BookOpen },
  { title: 'AI Assistant', url: '/dashboard/ai', icon: Bot },
  { title: 'My Profile', url: '/dashboard/profile', icon: UserCircle },
  { title: 'Notifications', url: '/dashboard/notification', icon: Bell },
];

const adminItems = [
  { title: 'Admin Panel', url: '/admin', icon: ShieldCheck },
  { title: 'Files', url: '/admin/files', icon: File },
  { title: 'Reports', url: '/admin/reports', icon: FileWarning },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const { openAiWindow } = useAiStore();
  const { data: notifData } = useMyNotificationsList(1, 50);
  const unreadCount =
    notifData?.data?.filter((n: any) => !n.is_read).length || 0;

  const isAdmin = pathname.startsWith('/admin');
  const currentItems = isAdmin ? adminItems : items;

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar border-r border-sidebar-border"
    >
      <SidebarHeader className="flex items-center justify-between px-4 py-5">
        {state === 'expanded' && (
          <span className="text-lg font-semibold text-primary dark:text-blue-400">
            Study Share
          </span>
        )}
        <SidebarTrigger className="hover:bg-sidebar-accent rounded-md transition-colors" />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-2">
          {currentItems.map((item) => {
            const isActive =
              item.url === '/dashboard' || item.url === '/admin'
                ? pathname === item.url ||
                  (pathname.startsWith(`${item.url}/`) &&
                    !currentItems.some(
                      (other) =>
                        other.url !== item.url && pathname.startsWith(other.url)
                    ))
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild={item.title !== 'AI Assistant'}
                  tooltip={item.title}
                  onClick={
                    item.title === 'AI Assistant'
                      ? (e) => {
                          e.preventDefault();
                          openAiWindow();
                        }
                      : undefined
                  }
                  className={`
                    group rounded-xl px-3 py-2
                    transition-all duration-200
                    cursor-pointer
                    ${
                      isActive && item.title !== 'AI Assistant'
                        ? 'bg-primary/10 text-primary dark:bg-blue-500/20 dark:text-blue-400'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  {item.title === 'AI Assistant' ? (
                    <div className="flex items-center gap-2">
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {state === 'expanded' && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center gap-2 relative">
                        <div className="relative">
                          <item.icon
                            className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary dark:text-blue-400' : ''}`}
                          />
                          {item.title === 'Notifications' &&
                            unreadCount > 0 &&
                            state === 'icon' && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900 shrink-0" />
                            )}
                        </div>
                        {state === 'expanded' && (
                          <span
                            className={`font-medium ${isActive ? 'font-bold' : ''}`}
                          >
                            {item.title}
                          </span>
                        )}
                      </div>
                      {item.title === 'Notifications' &&
                        unreadCount > 0 &&
                        state === 'expanded' && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 min-w-5 h-5 flex items-center justify-center animate-pulse">
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
