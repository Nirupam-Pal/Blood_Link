'use client';

import { motion, Variants } from 'framer-motion';
import {
  Heart,
  Search,
  ShieldCheck,
  Clock,
  MapPin,
  Bell,
  Building2,
  MessageSquare,
  Send,
  Smartphone,
  Hourglass,
  Users,
  ClipboardCheck,
  Mail,
  ArrowRight,
  Check,
  X,
  Droplet,
  Paperclip,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SiteNavbar } from '@/components/layout/site-navbar';
import { BrandMark, Logo, StatCard } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const inView = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' } } as const;

// Pain points of the way blood donors are usually found today
const PROBLEMS = [
  {
    icon: Smartphone,
    title: 'Posted on a status, then waiting',
    desc: 'Families share "Urgent: B+ blood needed" on WhatsApp statuses and Facebook stories, and then wait for the right person to see it.',
  },
  {
    icon: Users,
    title: 'Depends on who sees it',
    desc: 'A post only reaches your own contacts. If none of them have the right blood group, the message has to be forwarded again and again.',
  },
  {
    icon: Hourglass,
    title: 'Stories disappear',
    desc: 'Statuses and stories vanish after 24 hours and get buried under other posts, so the request has to be posted again and again.',
  },
  {
    icon: Clock,
    title: 'No way to know who can donate',
    desc: "You can't tell who has the right blood group, who is nearby, or who is medically fit to donate, until after a long round of calls.",
  },
];

// The real end-to-end workflow of the app
const WORKFLOW = [
  {
    step: '01',
    who: 'Everyone',
    title: 'Create an Account',
    desc: 'Sign up with your blood group and location, then verify your email with a one-time password (OTP).',
    icon: Mail,
  },
  {
    step: '02',
    who: 'Donors',
    title: 'Pass the Eligibility Check',
    desc: 'Willing donors answer a short medical questionnaire (age, weight, medication, recent surgery, tattoos and more). Only eligible donors are listed.',
    icon: ClipboardCheck,
  },
  {
    step: '03',
    who: 'Patients & Families',
    title: 'Search Donors Nearby',
    desc: 'Pick the blood group and state, and narrow down by district, sub-division or city to find active donors close to the hospital.',
    icon: Search,
  },
  {
    step: '04',
    who: 'Patients & Families',
    title: 'Send a Connection Request',
    desc: 'Send the donor a request with a short note: patient details, hospital name and how urgent it is.',
    icon: Send,
  },
  {
    step: '05',
    who: 'Donors',
    title: 'Get Notified & Respond',
    desc: 'The donor sees the request in their notifications and can accept or decline. You can see the status of every request you sent.',
    icon: Bell,
  },
  {
    step: '06',
    who: 'Both',
    title: 'Chat & Coordinate',
    desc: 'Once accepted, a private real-time chat opens between you and the donor to arrange the time and place of donation.',
    icon: MessageSquare,
  },
];

const FAQS = [
  {
    q: 'Is BloodLink free to use?',
    a: 'Yes. BloodLink is completely free for patients, families, donors and blood banks.',
  },
  {
    q: 'Who can register as a donor?',
    a: 'Anyone between 18 and 65 years old, weighing at least 45 kg, who passes the medical questionnaire: no current medication, no recent tattoo or surgery, and no history of hepatitis, HIV, diabetes, high blood pressure or chronic disease.',
  },
  {
    q: 'What happens after I send a connection request?',
    a: 'The donor gets a notification and can accept or decline it. If they accept, a private chat opens between you two so you can coordinate the donation directly.',
  },
  {
    q: 'What information about donors is visible?',
    a: "Signed-in users can see a donor's name, blood group, general location and email so they can be reached in an emergency. Chatting is only possible after the donor accepts a request.",
  },
  {
    q: 'Can blood banks use BloodLink?',
    a: 'Yes. Blood banks register with their license number, verify their email and keep their blood stock updated so people can find them in the blood bank search.',
  },
];

const COMPARE = [
  {
    name: 'Social media posts',
    tagline: 'WhatsApp statuses & Facebook stories',
    points: [
      { ok: false, text: 'You wait for the right person to happen to see your post.' },
      { ok: false, text: 'Only reaches your own contacts and whoever they forward it to.' },
      { ok: false, text: "No idea of a person's blood group, location or fitness to donate." },
      { ok: false, text: 'Posts expire or get buried, and have to be shared again.' },
    ],
  },
  {
    name: 'BloodLink',
    tagline: 'Free for patients, families and donors',
    featured: true,
    points: [
      { ok: true, text: 'You search for donors yourself, right when you need them.' },
      { ok: true, text: 'Filter by blood group, state, district, sub-division and city.' },
      { ok: true, text: 'Every listed donor has passed a medical eligibility check.' },
      { ok: true, text: 'Requests, notifications and chat keep everything in one place.' },
    ],
  },
  {
    name: 'For blood banks',
    tagline: 'Licensed facilities',
    points: [
      { ok: true, text: 'Register with your license number' },
      { ok: true, text: 'Verify your email' },
      { ok: true, text: 'Keep your blood stock updated' },
      { ok: true, text: 'Appear in blood bank searches' },
    ],
  },
];

// lucide-react no longer ships brand logos, so these two are inline SVGs.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/nirupam._.pal/', label: 'Instagram', icon: InstagramIcon },
  { href: 'https://www.linkedin.com/in/nirupam-pal-22b959250/', label: 'LinkedIn', icon: LinkedinIcon },
  { href: 'mailto:nirupampal14@gmail.com', label: 'Email', icon: Mail },
];

function SectionTitle({ title, desc, className }: { title: React.ReactNode; desc?: string; className?: string }) {
  return (
    <motion.div {...inView} variants={fadeInUp} className={cn('mx-auto max-w-2xl text-center mb-14', className)}>
      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground text-balance">{title}</h2>
      {desc && <p className="mt-4 text-[15px] sm:text-base leading-relaxed text-muted-foreground">{desc}</p>}
    </motion.div>
  );
}

/** Small card wrapper used by every bento cell. */
function BentoCard({ title, desc, children, className }: { title: string; desc: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div {...inView} variants={fadeInUp} className={cn('group flex flex-col rounded-3xl bg-surface p-2 shadow-card', className)}>
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-background p-5 shadow-card min-h-56">{children}</div>
      <div className="px-4 pb-4 pt-5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );
}

/** Full-bleed brand banner that links into the app. */
function Banner({ src, alt, href, className }: { src: string; alt: string; href: string; className?: string }) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      <Link
        href={href}
        className="group block overflow-hidden rounded-3xl shadow-card transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-float focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Image
          src={src}
          alt={alt}
          width={1800}
          height={600}
          unoptimized
          className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />
      </Link>
    </motion.div>
  );
}

export default function LandingPage() {

  const user = useAuthStore((state) => state.user)
  const isDonor = Boolean(user?.donor);

  return (
    <div className="min-h-dvh bg-background text-foreground overflow-x-hidden">
      <SiteNavbar />

      {/* ───────────── HERO ───────────── */}
      <section className="px-3 pt-20 sm:px-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-linear-to-b from-background via-red-100/70 via-55% to-red-800 dark:from-background dark:via-red-950/20 dark:to-red-900/40">
          {/* concentric rings */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center" aria-hidden="true">
            {[1100, 820, 560].map((s) => (
              <div
                key={s}
                className="absolute rounded-full border border-white/60 dark:border-white/10"
                style={{ width: s, height: s, bottom: -s / 2 }}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-40" aria-hidden="true" />

          <motion.div
            className="relative px-5 pt-20 sm:pt-28 text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-card backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-brand" />
              </span>
              Every second matters
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mx-auto max-w-4xl text-[40px] sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-foreground text-balance"
            >
              Find a Blood <span className="text-gradient-brand">Donor</span> Without the <span className="text-gradient-brand">Wait</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mx-auto mt-6 max-w-2xl text-[15px] sm:text-lg leading-relaxed text-muted-foreground">
              Don&apos;t depend on WhatsApp statuses and Facebook stories in an emergency. Search medically screened donors by
              blood group and location, send them a request, and chat with them directly.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/dashboard/donor">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="h-4 w-4" />
                  Find a Donor
                </Button>
              </Link>
              <Link href="/dashboard/blood-banks">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Building2 className="h-4 w-4" />
                  Find Blood Banks
                </Button>
              </Link>
              {!isDonor && user?.role === 'USER' && (
                <Link href="/register/donor">
                  <Button size="lg" variant="brand" className="w-full sm:w-auto">
                    <Heart className="h-4 w-4 fill-current" />
                    Become a Donor
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Phone mock-up peeking from the bottom */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto mt-16 w-[290px] sm:w-[320px] h-100 sm:h-[340px] overflow-hidden"
            >
              <div className="absolute inset-0 overflow-hidden rounded-t-[2.6rem] border-10 border-b-0 border-neutral-900 bg-background px-4 pt-3 pb-0 dark:border-neutral-700">
                <div className="mx-auto mb-3 h-6 w-24 rounded-full bg-neutral-900 dark:bg-neutral-700" />
                <div className="flex items-center justify-between text-left">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Search className="h-3.5 w-3.5" /> Donors nearby
                  </span>
                  <span className="text-xs text-muted-foreground">See all</span>
                </div>
                <div className="mt-3 space-y-2.5 text-left">
                  {[
                    { g: 'O−', n: 'Riya Das', l: 'Agartala · 2 km', c: 'bg-red-50 dark:bg-red-950/40' },
                    { g: 'B+', n: 'Arjun Paul', l: 'Udaipur · 5 km', c: 'bg-red-100/70 dark:bg-red-950/40' },
                    { g: 'A+', n: 'Meera Sen', l: 'Sonamura · 8 km', c: 'bg-neutral-100 dark:bg-neutral-800' },
                  ].map((d) => (
                    <div key={d.n} className={cn('flex items-center gap-3 rounded-2xl p-3', d.c)}>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-red-600 to-red-800 text-xs font-bold text-white">
                        {d.g}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{d.n}</p>
                        <p className="text-[11px] text-muted-foreground">{d.l}</p>
                      </div>
                      <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium shadow-card">Request</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Coverage strip */}
      <section className="py-14">
        <p className="text-center text-sm font-medium text-muted-foreground">Helping families find blood across</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6">
          {['Tripura', 'Assam', 'West Bengal'].map((s) => (
            <span key={s} className="flex items-center gap-2 text-lg font-semibold text-foreground/70">
              <MapPin className="h-4 w-4 text-brand" />
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ───────────── STATS + PROBLEM ───────────── */}
      <section id="problem" className="scroll-mt-24 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div {...inView} variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-24">
            {[
              { value: '₹0', label: 'Free for everyone, always' },
              { value: '8', label: 'Blood groups you can search' },
              { value: '18–65', label: 'Age range for eligible donors' },
              { value: '1:1', label: 'Private chat after acceptance' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeInUp}>
                <StatCard value={s.value} label={s.label} />
              </motion.div>
            ))}
          </motion.div>

          <SectionTitle
            title={<>Finding Blood Still Depends on <span className="text-gradient-brand">Social Media</span></>}
            desc="When a patient urgently needs blood, most families post a request on WhatsApp statuses, Facebook stories and groups, then wait for someone with the right blood group to notice it. That search can take hours."
          />

          <motion.div {...inView} variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEMS.map((item) => (
              <motion.div key={item.title} variants={fadeInUp} className="rounded-2xl bg-card p-6 shadow-card">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── FEATURES BENTO ───────────── */}
      <section id="features" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title={<>Features Built for <span className="text-gradient-brand">Emergencies</span></>}
            desc="Everything you need to go from 'we need blood' to 'a donor is on the way' — in one place."
          />

          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <BentoCard
              className="md:col-span-2"
              title="Location-Based Donor Search"
              desc="Find donors by blood group across state, district, sub-division and city, instead of hoping the right person sees a post."
            >
              <div className="flex flex-wrap gap-2">
                {['O−', 'Tripura', 'West Tripura', 'Agartala'].map((c, i) => (
                  <span key={c} className={cn('rounded-full px-3 py-1 text-xs font-medium', i === 0 ? 'bg-brand text-white' : 'bg-muted text-foreground')}>
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {[
                  { n: 'Riya Das', l: 'Agartala, West Tripura' },
                  { n: 'Sourav Nath', l: 'Agartala, West Tripura' },
                ].map((d) => (
                  <div key={d.n} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-transform group-hover:translate-x-1">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-red-600 to-red-800 text-[11px] font-bold text-white">O−</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{d.n}</p>
                      <p className="text-xs text-muted-foreground">{d.l}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />Active</span>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Screening */}
            <BentoCard
              title="Medical Eligibility Screening"
              desc="Donors are listed only after passing a health questionnaire, so the people you reach are fit to donate."
            >
              <div className="space-y-2.5">
                {['Age 18–65', 'Weight ≥ 45 kg', 'No recent tattoo', 'No chronic disease'].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 * i }}
                    className="flex items-center gap-2.5 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
                    {t}
                  </motion.div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                <ShieldCheck className="h-3.5 w-3.5" /> Cleared
              </div>
            </BentoCard>

            {/* Chat */}
            <BentoCard
              title="Real-Time Private Chat"
              desc="Accepted requests open a one-to-one chat with instant messages, so there are no missed calls or forwarded numbers."
            >
              <div className="space-y-2">
                <div className="w-fit rounded-xl rounded-bl-sm border border-border px-3 py-1.5 text-xs">Hi, I can donate today.</div>
                <div className="w-fit max-w-[85%] rounded-xl rounded-bl-sm border border-border px-3 py-1.5 text-xs">Which hospital should I come to?</div>
                <div className="ml-auto w-fit rounded-xl rounded-br-sm bg-linear-to-b from-red-600 to-red-800 px-3 py-1.5 text-xs text-white">GB Pant Hospital, 4 pm 🙏</div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
                <span className="flex-1">Write a message</span>
                <Paperclip className="h-3.5 w-3.5" />
                <Send className="h-3.5 w-3.5" />
              </div>
            </BentoCard>

            {/* Requests */}
            <BentoCard
              title="Connection Requests"
              desc="Reach a donor directly with your patient details. Track whether each request is pending, accepted or declined."
            >
              <div className="relative h-40">
                <div className="absolute inset-x-2 top-3 rotate-3 rounded-xl border border-border bg-background p-3 shadow-card transition-transform group-hover:rotate-6">
                  <span className="rounded-md bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">Pending</span>
                </div>
                <div className="absolute inset-x-0 top-0 -rotate-1 rounded-xl border border-border bg-background p-3 shadow-card transition-transform group-hover:-rotate-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-brand px-2 py-0.5 text-[11px] font-medium text-white">Urgent</span>
                    <span className="rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">Accepted</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">B+ needed at GB Pant</p>
                  <p className="text-xs text-muted-foreground">Patient in surgery tomorrow morning. 2 units required.</p>
                </div>
              </div>
            </BentoCard>

            {/* Notifications */}
            <BentoCard
              title="In-App Notifications"
              desc="Donors are alerted when someone needs them, and requesters are alerted the moment a donor responds."
            >
              <div className="space-y-2">
                {[
                  { i: UserCheck, t: 'Request accepted', c: 'text-success bg-success-soft' },
                  { i: MessageSquare, t: 'New message from Riya', c: 'text-foreground bg-muted' },
                  { i: Bell, t: 'Someone needs O− blood', c: 'text-brand bg-brand-soft' },
                ].map(({ i: Icon, t, c }, idx) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 * idx }}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
                  >
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', c)}><Icon className="h-3.5 w-3.5" /></span>
                    <span className="text-xs font-medium">{t}</span>
                  </motion.div>
                ))}
              </div>
            </BentoCard>

            {/* Blood bank directory */}
            <BentoCard
              className="md:col-span-3"
              title="Blood Bank Directory"
              desc="Blood banks list their available blood stock, so you can also check nearby banks while you look for donors."
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 sm:w-64">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted"><Building2 className="h-5 w-5" /></span>
                  <div>
                    <p className="text-sm font-semibold">City Blood Bank</p>
                    <p className="text-xs text-muted-foreground">Example stock view</p>
                  </div>
                </div>
                <div className="grid flex-1 grid-cols-4 sm:grid-cols-8 gap-2">
                  {[['A+', 24], ['A−', 6], ['B+', 31], ['B−', 3], ['O+', 40], ['O−', 2], ['AB+', 12], ['AB−', 4]].map(([g, u]) => (
                    <div key={g as string} className="rounded-xl border border-border p-2 text-center">
                      <p className="text-[11px] text-muted-foreground">{g}</p>
                      <p className={cn('text-lg font-semibold tabular-nums', (u as number) < 5 && 'text-brand')}>{u}</p>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.2fr]">
          <motion.div {...inView} variants={fadeInUp} className="lg:sticky lg:top-28 self-start">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
              From Search to Donation in <span className="text-gradient-brand">6 Steps</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
              BloodLink keeps a searchable list of willing, medically screened donors in one place — so you reach the right
              people directly and talk to them in real time.
            </p>
            <ul className="mt-6 space-y-3">
              {['Search instead of broadcasting', 'Reach screened, nearby donors', 'Coordinate privately in real time'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand"><Check className="h-3 w-3" strokeWidth={3} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 inline-block">
              <Button size="lg" className="rounded-full">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.ol {...inView} variants={staggerContainer} className="relative space-y-4">
            <span className="absolute left-9 top-6 bottom-6 w-px bg-border" aria-hidden="true" />
            {WORKFLOW.map((item) => (
              <motion.li key={item.step} variants={fadeInUp} className="relative flex gap-4">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card shadow-card">
                  <item.icon className="h-5 w-5 text-brand" />
                </span>
                <div className="flex-1 rounded-2xl bg-card p-5 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-muted-foreground">Step {item.step}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{item.who}</span>
                  </div>
                  <h3 className="mt-1.5 font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ───────────── COMPARISON (pricing-card layout) ───────────── */}
      <section id="why-choose" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title={<><span className="text-gradient-brand">Social Media</span> vs BloodLink</>}
            desc="Here's why searching beats broadcasting when every hour counts."
          />
          <motion.div {...inView} variants={staggerContainer} className="grid items-center gap-5 lg:grid-cols-3">
            {COMPARE.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                className={cn(
                  'rounded-3xl p-2',
                  plan.featured ? 'bg-linear-to-b from-red-600 to-red-800 shadow-2xl shadow-red-500/20 lg:-my-4' : 'bg-surface shadow-card'
                )}
              >
                <div className="rounded-[1.25rem] bg-background p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.featured && <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">Recommended</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                  {plan.featured ? (
                    <Link href="/dashboard/donor" className="mt-6 block">
                      <Button size="lg" variant="brand" className="w-full">Find a Donor</Button>
                    </Link>
                  ) : plan.name === 'For blood banks' ? (
                    <Link href="/register/blood-bank" className="mt-6 block">
                      <Button size="lg" className="w-full">Register Facility</Button>
                    </Link>
                  ) : (
                    <Button size="lg" variant="secondary" disabled className="mt-6 w-full">Hours of waiting</Button>
                  )}
                  <ul className="mt-6 space-y-3">
                    {plan.points.map((p) => (
                      <li key={p.text} className="flex items-start gap-3 text-sm">
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                            p.ok ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {p.ok ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className={p.ok ? 'text-foreground' : 'text-muted-foreground'}>{p.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── MISSION (brand banners) ───────────── */}
      <section id="mission" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionTitle
            title={<>Be the <span className="text-gradient-brand">Link</span>.</>}
            desc="The right donor is often just a few kilometres away. BloodLink makes sure they can be found."
          />

          <motion.div {...inView} variants={staggerContainer} className="space-y-5">
            <Banner
              src="/brand/hoarding-crimson.svg"
              alt="Someone near you needs blood today. Find verified donors nearby and connect in minutes."
              href="/dashboard/donor"
            />

            <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
              <Banner
                src="/brand/hoarding-light.svg"
                alt="Every drop finds its way. Verified blood donors near you, connected in minutes."
                href="/register/donor"
              />

              {/* The meaning behind the symbol */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col justify-center gap-4 rounded-3xl bg-surface p-7 shadow-card"
              >
                <BrandMark className="h-12 w-12" />
                <h3 className="text-xl font-semibold tracking-tight text-balance">Blood, found where it&apos;s needed.</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A blood drop and a location pin are the same shape, facing opposite ways — the donor and the person in
                  need. BloodLink is where the two meet.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section id="faq" className="scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionTitle title={<>Frequently Asked <span className="text-gradient-brand">Questions</span></>} />
          <Accordion className="space-y-3">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="rounded-2xl bg-card px-5 shadow-card not-last:border-b-0">
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ───────────── CTA with floating icons ───────────── */}
      <section className="px-5 pt-20 pb-10 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12 flex items-center justify-center gap-5 sm:gap-10">
            {[Heart, Droplet, MessageSquare, Bell, ShieldCheck].map((Icon, i) => (
              <span
                key={i}
                className={cn(
                  'float-slow flex items-center justify-center rounded-full bg-card shadow-card',
                  i === 2 ? 'h-16 w-16 sm:h-20 sm:w-20' : i % 2 ? 'h-12 w-12 sm:h-16 sm:w-16' : 'h-10 w-10 sm:h-12 sm:w-12'
                )}
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                <Icon className={cn('h-5 w-5', i === 2 ? 'text-brand sm:h-7 sm:w-7' : 'text-foreground')} />
              </span>
            ))}
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-balance">
            Someone Needs Blood Today. <span className="text-gradient-brand">You</span> Can Make the Difference.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground leading-relaxed">
            Register as a donor so people can find you when it matters most, or search for a donor the moment you need one.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            {!isDonor && user?.role === 'USER' && (
              <Link href="/register/donor">
                <Button size="lg" variant="brand" className="w-full sm:w-auto rounded-full">
                  <Heart className="h-4 w-4 fill-current" />
                  Register as Donor
                </Button>
              </Link>
            )}
            <Link href="/dashboard/donor">
              <Button size="lg" className="w-full sm:w-auto rounded-full">
                <Search className="h-4 w-4" />
                Search for Donor
              </Button>
            </Link>
            <Link href="/dashboard/blood-banks">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full">
                <Building2 className="h-4 w-4" />
                Find Blood Banks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="px-3 pb-3 pt-16 sm:px-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-surface px-6 py-12 sm:px-12">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-lg font-medium leading-snug">Search donors. Send requests. Save lives.</p>
            </div>
            {[
              {
                t: 'Directory',
                l: [
                  { h: '/dashboard/donor', n: 'Find donors' },
                  { h: '/dashboard/blood-banks', n: 'Blood banks' },
                  { h: '/register/donor', n: 'Become a donor' },
                ],
              },
              {
                t: 'Learn',
                l: [
                  { h: '#problem', n: 'The problem' },
                  { h: '#how-it-works', n: 'How it works' },
                  { h: '#mission', n: 'Mission' },
                  { h: '#faq', n: 'FAQ' },
                ],
              },
            ].map((col) => (
              <div key={col.t}>
                <p className="text-sm font-semibold">{col.t}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.l.map((link) => (
                    <li key={link.n}>
                      <Link href={link.h} className="text-sm text-muted-foreground hover:text-foreground">
                        {link.n}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Creator's social links */}
            <div>
              <p className="text-sm font-semibold">Connect</p>
              <ul className="mt-4 space-y-2.5">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-background shadow-card transition-colors group-hover:bg-red-900 group-hover:text-white">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 grid gap-4 border-t border-border pt-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <p className="text-sm text-muted-foreground">© 2026 BloodLink. Built to make finding blood donors faster.</p>
            <a
              href="https://www.linkedin.com/in/nirupam-pal-22b959250/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-fit items-center gap-2 rounded-full bg-background px-4 py-2 text-sm shadow-card transition-transform hover:-translate-y-0.5 md:justify-self-center"
            >
              Designed & crafted with love by <span className="font-semibold text-gradient-brand">Nirupam Pal</span>
            </a>
            <p className="text-sm text-muted-foreground md:text-right">Free for patients, donors and blood banks.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
