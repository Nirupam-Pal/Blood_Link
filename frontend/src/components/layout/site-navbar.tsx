'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#problem', label: 'Problem' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#mission', label: 'Mission' },
  { href: '#faq', label: 'FAQ' },
];

/**
 * Landing-page navbar. Full width at the top of the page; once the visitor
 * scrolls it contracts into a floating, blurred pill (shape.ai style).
 */
export function SiteNavbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isAuthed = status === 'authenticated' && !!user;
  const dashboardHref = user?.role === 'BLOOD_BANK' ? '/dashboard/blood-bank' : '/dashboard/donor';

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 60));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4">
      <motion.nav
        animate={{
          maxWidth: scrolled ? 840 : 1200,
          y: scrolled ? 12 : 0,
          paddingLeft: scrolled ? 16 : 8,
          paddingRight: scrolled ? 8 : 8,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 32 }}
        className={cn(
          'mx-auto flex h-14 items-center justify-between gap-4 rounded-full transition-[background-color,box-shadow,backdrop-filter] duration-300',
          scrolled ? 'bg-background/80 shadow-float backdrop-blur-xl' : 'bg-transparent'
        )}
      >
        <Logo />

        <div className="hidden md:flex items-center" onMouseLeave={() => setHovered(null)}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={() => setHovered(l.href)}
              className="relative whitespace-nowrap px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground lg:px-3.5"
            >
              {hovered === l.href && (
                <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-muted" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <ThemeToggle className="rounded-full" />
          {isAuthed ? (
            <Link href={dashboardHref}>
              <Button size="sm" className="rounded-full px-4">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full text-foreground">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-4">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle className="rounded-full" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted cursor-pointer"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="md:hidden mx-auto mt-4 max-w-md rounded-2xl bg-background p-3 shadow-float"
          >
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
                {l.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              {isAuthed ? (
                <Link href={dashboardHref} className="col-span-2">
                  <Button className="w-full">Open dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
