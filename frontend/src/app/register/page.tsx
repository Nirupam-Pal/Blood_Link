'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Check, User, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/state-views';
import { cn } from '@/lib/utils';

const OPTIONS = [
  {
    href: '/register/user',
    icon: User,
    title: 'Individual Donor / Patient',
    desc: 'Register as a blood donor or request blood during emergencies. Manage your eligibility status and requests.',
    points: ['Search donors near you', 'Send connection requests', 'Become a verified donor'],
    cta: 'Continue as Individual',
    featured: true,
  },
  {
    href: '/register/blood-bank',
    icon: Building2,
    title: 'Blood Bank Organization',
    desc: 'Register your certified medical institution. Manage blood stock and update unit availability in real time.',
    points: ['Licence-verified listing', 'Live inventory console', 'Appear in directory searches'],
    cta: 'Continue as Blood Bank',
  },
];

export default function RegisterSelectionPage() {
  return (
    <AppShell>
      <PageHeader
        icon={UserPlus}
        title={<>How will you be using <span className="text-gradient-brand">BloodLink</span>?</>}
        description="Select the account type that best describes you to continue setup."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.div
              key={opt.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
            >
              <Link
                href={opt.href}
                className={cn(
                  'group block h-full rounded-3xl p-2 transition-transform hover:-translate-y-1',
                  opt.featured ? 'bg-linear-to-b from-red-600 to-red-800 shadow-xl shadow-red-500/15' : 'bg-surface shadow-card'
                )}
              >
                <div className="flex h-full flex-col rounded-[1.25rem] bg-background p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">{opt.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{opt.desc}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {opt.points.map((p) => (
                      <li key={p} className="flex items-center gap-2.5 text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span
                    className={cn(
                      'mt-6 flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium',
                      opt.featured ? 'btn-brand' : 'btn-ink'
                    )}
                  >
                    {opt.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-foreground hover:text-brand">
          Sign in
        </Link>
      </p>
    </AppShell>
  );
}
