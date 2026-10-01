'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Droplet,
  Bell,
  BellOff,
  CheckCheck,
  RefreshCw,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Info,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { Notification, NotificationType } from '@/types/notification.types';
import { timeAgo } from '@/lib/format';

type Filter = 'all' | 'unread';

const TYPE_META: Record<NotificationType, { icon: typeof Bell; className: string; href: string }> = {
  CONNECTION_REQUEST_RECEIVED: {
    icon: UserPlus,
    className: 'bg-red-600/10 text-red-600',
    href: '/connections?tab=received',
  },
  CONNECTION_REQUEST_ACCEPTED: {
    icon: UserCheck,
    className: 'bg-emerald-500/10 text-emerald-600',
    href: '/connections?tab=connected',
  },
  CONNECTION_REQUEST_REJECTED: {
    icon: UserX,
    className: 'bg-rose-500/10 text-rose-600',
    href: '/connections?tab=sent',
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    className: 'bg-sky-500/10 text-sky-600',
    href: '/messages',
  },
  SYSTEM_NOTIFICATION: {
    icon: Info,
    className: 'bg-amber-500/10 text-amber-600',
    href: '',
  },
};

export default function NotificationsPage() {
  const router = useRouter();

  // Auth Store Selectors
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // Notification Store Selectors
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const error = useNotificationStore((state) => state.error);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const [filter, setFilter] = useState<Filter>('all');

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
    if (!isInitializing && user?.role === 'BLOOD_BANK') {
      router.push('/dashboard/blood-bank');
    }
  }, [status, isInitializing, user, router]);

  useEffect(() => {
    if (!isInitializing && status === 'authenticated') {
      fetchNotifications();
    }
  }, [status, isInitializing, fetchNotifications]);

  const visibleNotifications = useMemo(
    () => (filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications),
    [notifications, filter]
  );

  const handleOpen = async (notification: Notification) => {
    await markAsRead(notification._id);
    const href = TYPE_META[notification.type]?.href;
    if (href) router.push(href);
  };

  if (isInitializing || status === 'idle') {
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="h-10 w-10 text-crimson-600 animate-bounce" />
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground flex flex-col overflow-hidden">
      <AmbientOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto mt-18 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-red-600">Notifications</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : "You're all caught up."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications()}
              disabled={isLoading}
              className="gap-2 text-xs text-muted-foreground cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
              className="h-9 gap-1.5 text-xs cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 p-1 mb-6 rounded-2xl bg-card border border-border w-fit">
          {(['all', 'unread'] as Filter[]).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === option
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-xs text-rose-500 font-medium flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        {visibleNotifications.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border rounded-2xl">
            <BellOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">{isLoading ? 'Loading...' : 'No Notifications'}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading
                ? 'Fetching your notifications...'
                : filter === 'unread'
                  ? 'No unread notifications.'
                  : 'Updates about your connection requests will show up here.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {visibleNotifications.map((notification) => {
              const meta = TYPE_META[notification.type] ?? TYPE_META.SYSTEM_NOTIFICATION;
              const Icon = meta.icon;
              return (
                <motion.div key={notification._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <button onClick={() => handleOpen(notification)} className="w-full text-left cursor-pointer group">
                    <Card
                      className={`p-4 rounded-2xl border-border transition-all hover:border-red-600/40 hover:shadow-lg flex flex-row items-center gap-4 ${
                        notification.isRead ? 'bg-card' : 'bg-red-600/5 border-red-600/20'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${meta.className}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm truncate ${notification.isRead ? 'font-medium' : 'font-bold'}`}>{notification.title}</h4>
                          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-red-600 shrink-0" aria-label="Unread" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notification.createdAt)}</p>
                      </div>
                      {meta.href && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </Card>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
