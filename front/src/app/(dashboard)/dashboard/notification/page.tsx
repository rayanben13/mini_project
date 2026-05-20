'use client';

import { useMyNotificationsList } from '@/hooks/useNotifications';
import useNotificationStore from '@/Store/user/notificationStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Loader2,
  Trash2,
  CheckCircle2,
  UserPlus,
  FileText,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error } = useMyNotificationsList(
    page,
    15
  );
  const router = useRouter();

  const { markNotificationAsRead, deleteAllMyNotifications } =
    useNotificationStore();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const notifications = data?.data || [];
  const meta = data?.meta;

  const handleDeleteAll = async () => {
    if (!allNotifications.length) return;
    if (!window.confirm('Are you sure you want to delete all notifications?'))
      return;

    setIsDeletingAll(true);
    // Optimistic clear
    setAllNotifications([]);
    const res = await deleteAllMyNotifications();
    setIsDeletingAll(false);
    if (res.success) {
      toast.success('All notifications deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['myNotificationsList'] });
    } else {
      toast.error(res.message || 'Failed to delete notifications');
    }
  };

  // 🔥 دمج البيانات (pagination) مع الترتيب التنازلي لإبقاء الإشعارات الجديدة في الأعلى
  useEffect(() => {
    if (!notifications.length) return;

    setAllNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id_notification));

      const newOnes = notifications.filter(
        (n: any) => !existingIds.has(n.id_notification)
      );

      const merged = [...prev, ...newOnes];
      // ترتيب الإشعارات تنازلياً حسب المعرف ID (الأحدث في الأعلى)
      return merged.sort((a, b) => b.id_notification - a.id_notification);
    });
  }, [notifications]);

  const hasMore = meta && meta.current_page < meta.last_page;

  const markAsReadHelper = async (item: any) => {
    if (!item.is_read) {
      // Optimistic update
      setAllNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === item.id_notification
            ? { ...n, is_read: true }
            : n
        )
      );
      await markNotificationAsRead(item.id_notification);
      queryClient.invalidateQueries({ queryKey: ['myNotificationsList'] });
    }
  };

  const handleNotificationClick = async (item: any) => {
    await markAsReadHelper(item);
  };

  // دالة تحليل الرسالة وتحويل أصحاب المعرفات والأسماء إلى روابط قابلة للضغط
  const renderParsedMessage = (item: any) => {
    const text = item.content || item.message || '';
    const linkClass =
      'font-bold text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 transition-colors hover:underline cursor-pointer relative z-10';

    const handleLinkClick = async (e: React.MouseEvent, url: string) => {
      e.stopPropagation(); // منع انتقال الضغطة إلى الكارت بالكامل (لكي لا يقوم فقط بالقراءة)
      await markAsReadHelper(item);
      router.push(url);
    };

    if (item.related_type === 'user') {
      const followPhrase = ' followed you';
      const lovePhrase = ' loved your study list ';
      const likePhrase = ' liked your file: ';

      if (text.includes(followPhrase)) {
        const parts = text.split(followPhrase);
        const username = parts[0];
        return (
          <span>
            <span
              onClick={(e) =>
                handleLinkClick(e, `/dashboard/user/${item.related_id}`)
              }
              className={linkClass}
            >
              {username}
            </span>
            {followPhrase}
          </span>
        );
      }

      if (text.includes(lovePhrase)) {
        const parts = text.split(lovePhrase);
        const username = parts[0];
        const rest = parts[1];
        return (
          <span>
            <span
              onClick={(e) =>
                handleLinkClick(e, `/dashboard/user/${item.related_id}`)
              }
              className={linkClass}
            >
              {username}
            </span>
            {lovePhrase}
            <span className="font-semibold text-slate-700 dark:text-slate-355">
              {rest}
            </span>
          </span>
        );
      }

      if (text.includes(likePhrase)) {
        const parts = text.split(likePhrase);
        const username = parts[0];
        const rest = parts[1];
        return (
          <span>
            <span
              onClick={(e) =>
                handleLinkClick(e, `/dashboard/user/${item.related_id}`)
              }
              className={linkClass}
            >
              {username}
            </span>
            {likePhrase}
            <span className="font-semibold text-slate-700 dark:text-slate-355">
              {rest}
            </span>
          </span>
        );
      }

      return (
        <span
          onClick={(e) =>
            handleLinkClick(e, `/dashboard/user/${item.related_id}`)
          }
          className={linkClass}
        >
          {text}
        </span>
      );
    }

    if (item.related_type === 'file') {
      const approvePhrase = 'Admin approved your file: ';
      const rejectPhrase = 'Admin rejected your file: ';
      const deleteStart = 'Your file "';

      if (text.startsWith(approvePhrase)) {
        const title = text.substring(approvePhrase.length);
        return (
          <span>
            {approvePhrase}
            <span
              onClick={(e) =>
                handleLinkClick(e, `/dashboard/${item.related_id}`)
              }
              className={linkClass}
            >
              {title}
            </span>
          </span>
        );
      }

      if (text.startsWith(rejectPhrase)) {
        const titlePart = text.substring(rejectPhrase.length);
        const reasonIndex = titlePart.indexOf(' (reason:');
        if (reasonIndex !== -1) {
          const title = titlePart.substring(0, reasonIndex);
          const reason = titlePart.substring(reasonIndex);
          return (
            <span>
              {rejectPhrase}
              <span
                onClick={(e) =>
                  handleLinkClick(e, `/dashboard/${item.related_id}`)
                }
                className={linkClass}
              >
                {title}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">
                {reason}
              </span>
            </span>
          );
        } else {
          return (
            <span>
              {rejectPhrase}
              <span
                onClick={(e) =>
                  handleLinkClick(e, `/dashboard/${item.related_id}`)
                }
                className={linkClass}
              >
                {titlePart}
              </span>
            </span>
          );
        }
      }

      if (text.startsWith(deleteStart)) {
        const firstQuote = text.indexOf('"');
        const secondQuote = text.indexOf('"', firstQuote + 1);
        if (firstQuote !== -1 && secondQuote !== -1) {
          const title = text.substring(firstQuote + 1, secondQuote);
          const rest = text.substring(secondQuote + 1);
          return (
            <span>
              Your file "
              <span
                onClick={(e) =>
                  handleLinkClick(e, `/dashboard/${item.related_id}`)
                }
                className={linkClass}
              >
                {title}
              </span>
              "{rest}
            </span>
          );
        }
      }

      return (
        <span
          onClick={(e) => handleLinkClick(e, `/dashboard/${item.related_id}`)}
          className={linkClass}
        >
          {text}
        </span>
      );
    }

    if (item.related_type === 'study_list') {
      const studyPhrase = 'Reminder to study ';
      if (text.startsWith(studyPhrase)) {
        const name = text.substring(studyPhrase.length);
        return (
          <span>
            {studyPhrase}
            <span
              onClick={(e) =>
                handleLinkClick(e, `/dashboard/study-list/${item.related_id}`)
              }
              className={linkClass}
            >
              {name}
            </span>
          </span>
        );
      }

      return (
        <span
          onClick={(e) =>
            handleLinkClick(e, `/dashboard/study-list/${item.related_id}`)
          }
          className={linkClass}
        >
          {text}
        </span>
      );
    }

    return <span>{text}</span>;
  };

  // تخصيص أيقونات مميزة وخلفيات جميلة حسب نوع الإشعار
  const getNotificationStyles = (item: any) => {
    const type = item.related_type;
    if (type === 'user') {
      return {
        icon: (
          <UserPlus className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        ),
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30',
      };
    }
    if (type === 'file') {
      return {
        icon: (
          <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        ),
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/30',
      };
    }
    if (type === 'study_list') {
      return {
        icon: <BookOpen className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
        bg: 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100/50 dark:border-cyan-900/30',
      };
    }
    return {
      icon: <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-100/50 dark:border-amber-900/30',
    };
  };

  const unreadTotal = allNotifications.filter((n) => !n.is_read).length;

  const filteredNotifications = allNotifications.filter((item) => {
    if (activeTab === 'unread') return !item.is_read;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col p-4 md:p-8 xl:p-12 overflow-y-auto transition-colors duration-300">
      <div className="max-w-4xl w-full mx-auto md:pb-20">
        {/* 🔵 Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/60 dark:bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Notification Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Stay updated with files, study lists, and connections.
              </p>
            </div>
          </div>

          <button
            onClick={handleDeleteAll}
            disabled={isDeletingAll || allNotifications.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl font-bold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed border border-rose-100/80 dark:border-rose-900/20 shrink-0"
          >
            {isDeletingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete All
          </button>
        </div>

        {/* 🎛️ Tabs Control */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl w-fit mb-6 border border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'unread' ? 'bg-white dark:bg-slate-800 text-primary dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Unread
            {unreadTotal > 0 && (
              <span className="bg-primary text-white text-xs font-black px-2 py-0.5 rounded-full shrink-0 min-w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadTotal}
              </span>
            )}
          </button>
        </div>

        {/* 🔄 Initial Loading */}
        {isLoading && page === 1 && (
          <div className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/40">
            <Loader2 className="w-10 h-10 animate-spin text-primary dark:text-blue-500" />
            <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
              Loading your notifications...
            </p>
          </div>
        )}

        {/* ❌ Error State */}
        {error && (
          <div className="text-center py-20 bg-rose-50/20 dark:bg-rose-955/5 border border-rose-100/50 dark:border-rose-900/20 rounded-[2.5rem]">
            <p className="text-rose-500 font-semibold">
              Failed to load notifications. Please check your connection.
            </p>
          </div>
        )}

        {/* 📭 Empty State */}
        {!isLoading && !error && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2.5rem] bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-md">
            <div className="w-24 h-24 bg-gradient-to-tr from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 rounded-full flex items-center justify-center mb-6 relative">
              <Bell className="w-10 h-10 text-primary dark:text-blue-400" />
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              No notifications yet
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-sm">
              {activeTab === 'unread'
                ? "You've read all your notifications! Excellent."
                : "You're all caught up. We'll alert you when updates arrive."}
            </p>
          </div>
        )}

        {/* ✅ Live Notifications Feed */}
        {filteredNotifications.length > 0 && (
          <>
            <div className="flex flex-col gap-4">
              {filteredNotifications.map((item: any) => {
                const styles = getNotificationStyles(item);
                return (
                  <div
                    onClick={() => handleNotificationClick(item)}
                    key={item.id_notification}
                    className={`group p-5 rounded-[2rem] flex items-center justify-between border transition-all duration-300 transform hover:-translate-y-0.5 relative overflow-hidden cursor-pointer
                                            ${
                                              !item.is_read
                                                ? 'bg-gradient-to-r from-blue-50/40 to-white dark:from-slate-900/80 dark:to-slate-950/40 border-blue-200/80 dark:border-blue-900/45 shadow-sm shadow-blue-100/10'
                                                : 'bg-white/80 dark:bg-slate-900/30 border-slate-150 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                            } hover:shadow-md hover:border-primary/25`}
                  >
                    {/* Unread Left Border Highlight */}
                    {!item.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-indigo-600 rounded-l-[2rem]" />
                    )}

                    {/* Left Side */}
                    <div className="flex items-start gap-4 max-w-[88%]">
                      <div
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-105 ${styles.bg}`}
                      >
                        {styles.icon}
                      </div>

                      <div>
                        <div
                          className={`text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed ${!item.is_read ? 'font-bold' : 'font-medium'}`}
                        >
                          {renderParsedMessage(item)}
                        </div>

                        {item.reason && (
                          <div className="text-xs text-rose-500 font-bold mt-1 px-2.5 py-0.5 bg-rose-500/10 rounded-lg w-fit border border-rose-500/10">
                            Reason: {item.reason}
                          </div>
                        )}

                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>{item.time || item.created_at}</span>
                          {!item.is_read && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                              <span className="text-primary dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                                Unread
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side Indicator */}
                    <div className="flex items-center gap-2">
                      {!item.is_read ? (
                        <div className="w-2.5 h-2.5 bg-primary dark:bg-blue-500 rounded-full mr-1 shrink-0 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 🔥 Show More / Pagination */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={isFetching}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-primary/20 hover:opacity-95 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Show More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
