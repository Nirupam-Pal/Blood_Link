'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, HeartHandshake, Info, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

/* ─────────────────────────────────────────────────────────────────────────
   Shared UI kit used by every page.
   ───────────────────────────────────────────────────────────────────────── */

/** Brand mark: the BloodLink heart-handshake tile + wordmark. */
export function Logo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-600/30 transition-transform group-hover:scale-105 group-hover:rotate-6 dark:shadow-red-600/50">
        <HeartHandshake className="h-[18px] w-[18px] text-white" />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Blood<span className="text-red-600">Link</span>
      </span>
    </Link>
  );
}

/** Full-screen splash while the auth session initialises. */
export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inset-0 rounded-2xl bg-linear-to-tr from-red-600 to-rose-500 animate-ping opacity-25" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-600/30">
            <HeartHandshake className="h-6 w-6 text-white" />
          </span>
        </span>
        <p className="text-sm text-muted-foreground">{label}…</p>
      </div>
    </div>
  );
}

/** Page masthead: small tinted icon, bold title, supporting line, actions. */
export function PageHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('mb-10', className)}>
      {Icon && (
        <motion.div
          initial={{ opacity: 0, y: 6, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand"
        >
          <Icon className="h-[18px] w-[18px]" />
        </motion.div>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

/** In-page section title. */
export function SectionHeading({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-4', className)}>
      <h2 className="text-base font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

/** Bordered white surface. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl bg-card shadow-card', className)}>{children}</div>;
}

/** Stat tile with a faint grid backdrop (shape.ai style). */
export function StatCard({ value, label, tone, icon: Icon }: { value: ReactNode; label: string; tone?: string; icon?: LucideIcon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-card">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-70" />
      <div className="relative flex items-start justify-between gap-3">
        <p className={cn('text-3xl font-semibold tracking-tight tabular-nums', tone)}>{value}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="relative mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/** Nothing-to-show state. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6 py-14', className)}>
      <div className="relative mb-5">
        <div className="absolute -inset-6 rounded-full bg-dots mask-radial" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-card">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn('shimmer rounded-md', className)} style={style} aria-hidden="true" />;
}

export function ListSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="hidden sm:block h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Round count pill; `pulse` adds a ping ring for unread items. */
export function CountBadge({ count, pulse = false, muted = false, className }: { count: number; pulse?: boolean; muted?: boolean; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums leading-none',
        muted ? 'bg-muted text-muted-foreground' : 'bg-brand text-white',
        pulse && !muted && 'badge-ping',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

type Tone = 'brand' | 'success' | 'warning' | 'neutral';

const TONE: Record<Tone, { pill: string; dot: string }> = {
  brand: { pill: 'bg-brand-soft text-brand', dot: 'bg-brand' },
  success: { pill: 'bg-success-soft text-success', dot: 'bg-success' },
  warning: { pill: 'bg-warning-soft text-warning', dot: 'bg-warning' },
  neutral: { pill: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
};

/** Status pill with a leading dot. */
export function StatusBadge({ tone = 'neutral', children, live = false, className }: { tone?: Tone; children: ReactNode; live?: boolean; className?: string }) {
  const t = TONE[tone];
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap', t.pill, className)}>
      <span className="relative flex h-1.5 w-1.5">
        {live && <span className={cn('absolute inset-0 rounded-full animate-ping opacity-60', t.dot)} />}
        <span className={cn('relative h-1.5 w-1.5 rounded-full', t.dot)} />
      </span>
      {children}
    </span>
  );
}

/** Inline alert strip. */
export function Notice({
  tone = 'brand',
  children,
  onDismiss,
  action,
  className,
}: {
  tone?: 'brand' | 'success' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'info' ? Info : AlertCircle;
  const styles = tone === 'success' ? 'bg-success-soft text-success' : tone === 'info' ? 'bg-muted text-foreground' : 'bg-brand-soft text-brand';
  return (
    <div role={tone === 'brand' ? 'alert' : 'status'} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm', styles, className)}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0 leading-relaxed">{children}</div>
      {action}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="h-6 w-6 -mr-1 flex items-center justify-center rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Blood-group tile. */
export function BloodBadge({ group, size = 'md', className }: { group?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = size === 'lg' ? 'h-16 w-16 text-xl rounded-2xl' : size === 'sm' ? 'h-9 w-9 text-xs rounded-lg' : 'h-12 w-12 text-base rounded-xl';
  return (
    <div
      className={cn(
        'relative shrink-0 flex items-center justify-center bg-linear-to-br from-red-600 to-red-800 font-bold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_12px_-4px_rgba(239,68,68,0.6)]',
        dims,
        className
      )}
    >
      {group || '—'}
    </div>
  );
}

/** Round initials avatar. */
export function Avatar({ name, size = 'md', className }: { name?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = size === 'lg' ? 'h-16 w-16 text-lg' : size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-xs';
  return (
    <div
      className={cn(
        'shrink-0 flex items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-900 font-semibold text-white ring-2 ring-background dark:from-neutral-200 dark:to-neutral-400 dark:text-neutral-900',
        dims,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

/** Form field label. */
export function FieldLabel({ htmlFor, children, required, hint }: { htmlFor?: string; children: ReactNode; required?: boolean; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-sm font-medium text-foreground">
        {children}
        {required && <span className="text-brand"> *</span>}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** Segmented control with a sliding white thumb. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  className,
}: {
  options: { id: T; label: string; count?: number; pulse?: boolean; icon?: LucideIcon }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  layoutId: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-muted p-1 scrollbar-thin', className)}>
      {options.map((opt) => {
        const isActive = opt.id === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={cn(
              'relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium cursor-pointer',
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-card shadow-card"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            {Icon && <Icon className="relative h-4 w-4" />}
            <span className="relative">{opt.label}</span>
            {typeof opt.count === 'number' && opt.count > 0 && (
              <CountBadge count={opt.count} pulse={opt.pulse} muted={!opt.pulse} className="relative" />
            )}
          </button>
        );
      })}
    </div>
  );
}
