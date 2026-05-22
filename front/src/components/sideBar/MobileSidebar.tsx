'use client';

import {
  Bell,
  BookOpen,
  Bot,
  File,
  FileWarning,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  UserCircle,
  Home,
} from 'lucide-react';
import { useState } from 'react';

import { useMyNotificationsList } from '@/hooks/useNotifications';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import useAiStore from '@/Store/ai/aiStore';
import UploadFileBtn from '../profile/uploadFileBtn';

const items = [
  { title: 'Home', url: '/dashboard', icon: Home },
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

export function MobileSidebar() {
  const { openAiWindow } = useAiStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { data: notifData } = useMyNotificationsList(1, 50);

  const unreadCount =
    notifData?.data?.filter((n: any) => !n.is_read).length || 0;

  const isAdmin = pathname.startsWith('/admin');
  const currentItems = isAdmin ? adminItems : items;

  const handleCloseSidebar = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* TRIGGER */}
      <SheetTrigger
        className="
          md:hidden
          p-2 rounded-xl
          bg-background/70 backdrop-blur-xl
          border border-border/50
          shadow-sm
          hover:bg-primary/10
          transition-all duration-300
          hover:scale-105 active:scale-95
        "
      >
        <Menu className="w-6 h-6 text-primary" />
      </SheetTrigger>

      {/* SIDEBAR */}
      <SheetContent
        side="left"
        className="
          w-80 p-0
          bg-background/95 backdrop-blur-2xl
          border-r border-border/60
        "
      >
        <SheetTitle className="sr-only">Mobile Sidebar</SheetTitle>

        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="px-5 py-6 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div
                className="
                  size-11 rounded-2xl
                  bg-gradient-to-br from-primary to-blue-600
                  flex items-center justify-center
                  shadow-md shadow-primary/20
                  relative overflow-hidden
                "
              >
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                <GraduationCap className="size-5 text-white relative z-10" />{" "}
              </div>

              <div>
                <h2 className="font-black text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  {isAdmin ? 'Admin Console' : 'StudyShare'}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Smart Learning Platform
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="flex-1 px-3 py-4 space-y-6">
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground px-2">
              MAIN
            </p>

            <div className="space-y-2">
              {currentItems.map((item) => {
                const isActive =
                  item.url === '/dashboard' || item.url === '/admin'
                    ? pathname === item.url
                    : pathname.startsWith(item.url);

                return item.title === 'AI Assistant' ? (
                  <button
                    key={item.title}
                    onClick={() => {
                      openAiWindow();
                      handleCloseSidebar();
                    }}
                    className="
                      w-full flex items-center gap-3
                      px-3 py-3 rounded-2xl
                      transition-all duration-300
                      hover:bg-muted/60
                      hover:-translate-y-[1px]
                      active:scale-[0.98]
                    "
                  >
                    <div
                      className="
                        size-10 rounded-xl
                        bg-gradient-to-br from-indigo-500 to-blue-500
                        flex items-center justify-center
                        text-white shadow-md
                      "
                    >
                      <item.icon className="size-[18px]" />
                    </div>

                    <span className="font-medium text-[15px]">
                      {item.title}
                    </span>
                  </button>
                ) : (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={handleCloseSidebar}
                    className={`
                      group flex items-center justify-between
                      px-3 py-3 rounded-2xl
                      transition-all duration-300
                      hover:-translate-y-[1px]

                      ${
                        isActive
                          ? `
                            bg-gradient-to-r from-primary/15 to-primary/5
                            text-primary
                            shadow-sm
                            border border-primary/10
                          `
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          size-10 rounded-xl
                          flex items-center justify-center
                          transition
                          ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted/50 group-hover:bg-background'
                          }
                        `}
                      >
                        <item.icon className="size-[18px] group-hover:scale-110 group-hover:rotate-3 transition" />
                      </div>

                      <span
                        className={`text-[15px] ${
                          isActive ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    {item.title === 'Notifications' && unreadCount > 0 && (
                      <span
                        className="
                          min-w-5 h-5 px-1.5
                          flex items-center justify-center
                          rounded-full
                          text-[10px] font-bold text-white
                          bg-gradient-to-r from-red-500 to-rose-500
                          shadow-md shadow-red-500/20
                          animate-in zoom-in-50
                        "
                      >
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="space-y-3 pt-4 border-t border-border/60">
              {!isAdmin && (
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
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-white/10 blur-xl" />

                  {/* content */}
                  <div className="relative pl-3 flex items-center justify-center gap-2 font-semibold text-sm h-full">
                    {/* Upload handles its own modal open */}
                    <UploadFileBtn variant="sidebar" />
                  </div>

                  {/* bottom line */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 bg-white/40" />
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
