'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  CheckCheck,
  RefreshCw,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Info,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { EmptyState, ListSkeleton, Notice, PageHeader, PageLoader, Panel, Segmented } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { Notification, NotificationType } from '@/types/notification.types';
import { timeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'unread';

const TYPE_META: Record<NotificationType, { icon: typeof Bell; className: string; href: string }> = {
  CONNECTION_REQUEST_RECEIVED: {
    icon: UserPlus,
    className: 'bg-brand-soft text-brand',
    href: '/connections?tab=received',
  },
  CONNECTION_REQUEST_ACCEPTED: {
    icon: UserCheck,
    className: 'bg-success-soft text-success',
    href: '/connections?tab=connected',
  },
  CONNECTION_REQUEST_REJECTED: {
    icon: UserX,
    className: 'bg-brand-soft text-brand',
    href: '/connections?tab=sent',
  },
  NEW_MESSAGE: {
    icon: MessageSquare,
    className: 'bg-muted text-foreground',
    href: '/messages',
  },
  SYSTEM_NOTIFICATION: {
    icon: Info,
    className: 'bg-warning-soft text-warning',
    href: '',
  },
};

// Buckets notifications for section headings (Today / Yesterday / Earlier).
function groupLabel(date?: string): string {
  if (!date) return 'Earlier';
  const d = new Date(date);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  if (d.getTime() >= startOfToday) return 'Today';
  if (d.getTime() >= startOfToday - dayMs) return 'Yesterday';
  return 'Earlier';
}

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

  const groupedNotifications = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = [];
    visibleNotifications.forEach((n) => {
      const label = groupLabel(n.createdAt);
      const group = groups.find((g) => g.label === label);
      if (group) group.items.push(n);
      else groups.push({ label, items: [n] });
    });
    return groups;
  }, [visibleNotifications]);

  const handleOpen = async (notification: Notification) => {
    await markAsRead(notification._id);
    // Message notifications reference their conversation, so open it directly
    const href =
      notification.type === 'NEW_MESSAGE' && notification.referenceId
        ? `/messages?c=${notification.referenceId}`
        : TYPE_META[notification.type]?.href;
    if (href) router.push(href);
  };

  if (isInitializing || status === 'idle') {
    return <PageLoader label="Authenticating session" />;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          icon={Bell}
          title="Notifications"
          description={
            unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : "You're all caught up."
          }
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={() => fetchNotifications()} disabled={isLoading} aria-label="Refresh notifications">
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAllAsRead()} disabled={unreadCount === 0}>
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            </>
          }
        />

        <Segmented<Filter>
          label="Filter notifications"
          layoutId="notification-filter"
          value={filter}
          onChange={setFilter}
          className="mb-6"
          options={[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount, pulse: true },
          ]}
        />

        {error && (
          <Notice tone="brand" className="mb-6">
            {error}
          </Notice>
        )}

        {visibleNotifications.length === 0 ? (
          isLoading ? (
            <ListSkeleton rows={4} />
          ) : (
            <Panel>
              <EmptyState
                icon={filter === 'unread' ? CheckCheck : BellOff}
                title={filter === 'unread' ? 'Nothing unread' : 'No notifications'}
                description={
                  filter === 'unread' ? 'No unread notifications.' : 'Updates about your connection requests will show up here.'
                }
              />
            </Panel>
          )
        ) : (
          <div className="space-y-8">
            {groupedNotifications.map((group) => (
              <section key={group.label} aria-label={group.label}>
                <h2 className="mb-3 px-1 text-sm font-medium text-muted-foreground">{group.label}</h2>
                <Panel className="overflow-hidden">
                  <ul className="divide-y divide-border">
                    <AnimatePresence initial={false}>
                      {group.items.map((notification) => {
                        const meta = TYPE_META[notification.type] ?? TYPE_META.SYSTEM_NOTIFICATION;
                        const Icon = meta.icon;
                        const isUnread = !notification.isRead;
                        return (
                          <motion.li
                            key={notification._id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22 }}
                            className="group relative"
                          >
                            <button
                              onClick={() => handleOpen(notification)}
                              className={cn(
                                'flex w-full items-start gap-4 px-5 py-4 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-muted',
                                isUnread ? 'bg-brand-soft/40 hover:bg-brand-soft/70' : 'hover:bg-surface'
                              )}
                            >
                              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105', meta.className)}>
                                <Icon className="h-6 w-6" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className={cn('text-sm leading-snug', isUnread ? 'font-semibold' : 'font-medium text-foreground/80')}>
                                    {notification.title}
                                  </h3>
                                  <time
                                    dateTime={notification.createdAt}
                                    title={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : undefined}
                                    className="shrink-0 text-xs text-muted-foreground tabular-nums"
                                  >
                                    {timeAgo(notification.createdAt)}
                                  </time>
                                </div>
                                <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                              </div>
                              <div className="flex h-10 items-center gap-2">
                                {isUnread && (
                                  <span className="relative flex h-2 w-2" aria-label="Unread">
                                    <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
                                    <span className="relative h-2 w-2 rounded-full bg-brand" />
                                  </span>
                                )}
                                {meta.href && (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                )}
                              </div>
                            </button>

                            {/* Quick mark-as-read without navigating */}
                            {isUnread && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="absolute right-14 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md bg-background px-2 py-1 text-xs font-medium text-muted-foreground shadow-card opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 sm:inline-flex cursor-pointer"
                                aria-label={`Mark "${notification.title}" as read`}
                              >
                                <Check className="h-3 w-3" />
                                Mark read
                              </button>
                            )}
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </Panel>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
