'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Building2,
  ChevronRight,
  Droplets,
  Heart,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User as UserIcon,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, CountBadge, Logo } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useChatStore } from '@/stores/chat.store';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth.types';

// Blood Bank accounts carry their name under `bloodBankName`, not `fullName`.
function getDisplayName(user: User): string {
  if (user.role === 'BLOOD_BANK') {
    return (user as unknown as { bloodBankName?: string }).bloodBankName || user.email;
  }
  return user.fullName || user.email;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * Application frame used by every page except the landing page: a soft grey
 * sidebar rail with the account at the top, grouped navigation, and a dark
 * call-to-action at the bottom; content sits on a raised white panel.
 * On mobile the rail becomes a slide-out drawer behind a top bar.
 * Pass `bleed` for full-height screens (chat) that manage their own layout.
 */
export function AppShell({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const logout = useAuthStore((state) => state.logout);

  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  const isAuthed = status === 'authenticated' && !!user;
  const isDonor = Boolean(user?.donor);
  const isBloodBank = user?.role === 'BLOOD_BANK';
  // Connections, chat and notifications are for individual (USER) accounts
  const showSocialLinks = status === 'authenticated' && user?.role === 'USER';

  // Poll the unread count while signed in
  useEffect(() => {
    if (!showSocialLinks) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [showSocialLinks, fetchUnreadCount]);

  const handleLogout = () => {
    useChatStore.getState().disconnect();
    useNotificationStore.getState().reset();
    logout();
  };

  const sections: NavSection[] = [];
  if (!isAuthed) {
    sections.push(
      {
        items: [
          { href: '/', label: 'Home', icon: Home },
          { href: '/login', label: 'Sign in', icon: LogIn },
          { href: '/register', label: 'Create account', icon: UserPlus },
        ],
      },
      {
        title: 'Register as',
        items: [
          { href: '/register/user', label: 'Individual', icon: UserIcon },
          { href: '/register/blood-bank', label: 'Blood bank', icon: Building2 },
        ],
      },
      {
        title: 'Directory',
        items: [
          { href: '/dashboard/donor', label: 'Find donors', icon: Search },
          { href: '/dashboard/blood-banks', label: 'Blood banks', icon: Building2 },
        ],
      }
    );
  } else if (isBloodBank) {
    sections.push(
      {
        items: [
          { href: '/', label: 'Home', icon: Home },
          { href: '/dashboard/blood-bank', label: 'Inventory', icon: Droplets },
          { href: '/dashboard/blood-banks', label: 'Blood bank directory', icon: Building2 },
        ],
      },
      { title: 'Account', items: [{ href: '/profile', label: 'Profile', icon: UserIcon }] }
    );
  } else {
    sections.push(
      {
        items: [
          { href: '/', label: 'Home', icon: Home },
          { href: '/dashboard/donor', label: 'Find donors', icon: Search },
          { href: '/dashboard/blood-banks', label: 'Blood banks', icon: Building2 },
        ],
      },
      {
        title: 'Network',
        items: showSocialLinks
          ? [
              { href: '/connections', label: 'Connections', icon: Users },
              { href: '/messages', label: 'Messages', icon: MessageSquare },
              { href: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
            ]
          : [],
      },
      { title: 'Account', items: [{ href: '/profile', label: 'Profile', icon: UserIcon }] }
    );
  }

  // Bottom call-to-action, like the reference's dark pill
  const cta = !isAuthed
    ? { href: '/register', label: 'Create free account', icon: UserPlus }
    : isBloodBank
      ? { href: '/dashboard/blood-bank', label: 'Update stock', icon: Droplets }
      : !isDonor
        ? { href: '/register/donor', label: 'Become a donor', icon: Heart }
        : { href: '/dashboard/donor', label: 'Find a donor', icon: Search };
  const CtaIcon = cta.icon;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);

  // Rendered twice (desktop rail + mobile drawer); `variant` keeps their
  // active-pill animations independent.
  const renderRail = (variant: 'desktop' | 'mobile') => (
    <div className="flex h-full flex-col px-3 py-5">
      {/* Account block */}
      <div className="px-2 pb-6">
        {isAuthed && user ? (
          <Link href="/profile" className="flex items-center gap-3 rounded-xl p-1 -m-1 hover:bg-sidebar-accent/70">
            <Avatar name={getDisplayName(user)} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{getDisplayName(user)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {isBloodBank ? 'Blood bank' : isDonor ? 'Active donor' : 'Member'}
              </p>
            </div>
          </Link>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin" aria-label="Main">
        {sections
          .filter((s) => s.items.length > 0)
          .map((section, i) => (
            <div key={section.title ?? i}>
              {section.title && <p className="mb-1.5 px-2.5 text-xs font-medium text-muted-foreground">{section.title}</p>}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm',
                          active ? 'text-foreground font-medium' : 'text-sidebar-foreground hover:text-foreground'
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId={`sidebar-active-${variant}`}
                            className="absolute inset-0 rounded-lg bg-sidebar-accent shadow-card"
                            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                          />
                        )}
                        <Icon className={cn('relative h-4 w-4 shrink-0', active ? 'text-brand' : 'text-muted-foreground')} />
                        <span className="relative flex-1 truncate">{item.label}</span>
                        {item.badge ? <CountBadge count={item.badge} pulse className="relative" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
      </nav>

      <div className="space-y-1 pt-4">
        <ThemeToggle showLabel className="px-2.5" />
        {isAuthed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-brand cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )}
        <Link
          href={cta.href}
          className="btn-ink mt-3 flex h-10 items-center justify-between gap-2 rounded-full pl-4 pr-3 text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <CtaIcon className="h-4 w-4" />
            {cta.label}
          </span>
          <ChevronRight className="h-4 w-4 opacity-70" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface text-foreground">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 md:block">{renderRail('desktop')}</aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md md:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          {showSocialLinks && (
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              <CountBadge count={unreadCount} pulse className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px]" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 40 }}
              // Close the drawer whenever one of its links is followed
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest('a')) setDrawerOpen(false);
              }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] bg-surface shadow-float md:hidden"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              {renderRail('mobile')}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content panel */}
      <div className="md:pl-60">
        <div className="md:py-2 md:pr-2">
          <div
            className={cn(
              'bg-background md:rounded-2xl md:shadow-card',
              bleed ? 'h-[calc(100dvh-3.5rem)] overflow-hidden md:h-[calc(100dvh-1rem)]' : 'min-h-[calc(100dvh-3.5rem)] md:min-h-[calc(100dvh-1rem)]'
            )}
          >
            {bleed ? (
              children
            ) : (
              <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 md:px-12 md:py-16">{children}</main>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
