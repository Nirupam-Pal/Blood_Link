'use client';

import { motion, Variants } from 'framer-motion';
import {
  Heart,
  Search,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Bell,
  HeartHandshake,
  Building2,
  MessageSquare,
  Send,
  Smartphone,
  Hourglass,
  Users,
  ClipboardCheck,
  Mail,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';
import { useAuthStore } from '@/stores/auth.store';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

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

const FEATURES = [
  {
    icon: MapPin,
    title: 'Location-Based Donor Search',
    desc: 'Find donors by blood group across state, district, sub-division and city, instead of hoping the right person sees a post.',
  },
  {
    icon: ShieldCheck,
    title: 'Medical Eligibility Screening',
    desc: 'Donors are listed only after passing a health questionnaire, so the people you reach are fit to donate.',
  },
  {
    icon: Send,
    title: 'Connection Requests',
    desc: 'Reach a donor directly with your patient details. Track whether each request is pending, accepted or declined.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Private Chat',
    desc: 'Accepted requests open a one-to-one chat with instant messages, so there are no missed calls or forwarded numbers.',
  },
  {
    icon: Bell,
    title: 'In-App Notifications',
    desc: 'Donors are alerted when someone needs them, and requesters are alerted the moment a donor responds.',
  },
  {
    icon: Building2,
    title: 'Blood Bank Directory',
    desc: 'Blood banks list their available blood stock, so you can also check nearby banks while you look for donors.',
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

export default function LandingPage() {

  const user = useAuthStore((state) => state.user)
  const isDonor = Boolean(user?.donor);

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground font-sans antialiased selection:bg-crimson-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <AmbientOrbs />
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-crimson-600/10 dark:bg-crimson-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/80 border border-border text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-6 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-crimson-500 animate-ping" />
                Every Second Matters
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[0.02em] text-foreground leading-[1.05] text-balance">
                Find a Blood Donor <br />
                <span className="bg-linear-to-r from-red-950 via-rose-500 to-rose-400 bg-clip-text text-transparent">
                  Without the Wait
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed tracking-[0.01em]">
                Don&apos;t depend on WhatsApp statuses and Facebook stories in an emergency. BloodLink lets you search
                medically screened donors by blood group and location, send them a request, and chat with them directly.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                {!isDonor && user?.role === 'USER' && (
                  <Link href='/register/donor'>
                    <Button size="lg" className="h-13 px-8 rounded-xl bg-linear-to-r from-red-950 via-rose-800 to-rose-700 text-white font-semibold hover:scale-[1.02] transition-transform text-base">
                      <Heart className="mr-2 h-5 w-5 fill-white" />
                      Become a Donor
                    </Button>
                  </Link>
                )}

                <Link href="/dashboard/donor">
                  <Button size="lg" variant="outline" className="h-13 px-8 rounded-xl border-border bg-card/60 hover:bg-muted text-foreground font-semibold backdrop-blur-xs text-base">
                    <Search className="mr-2 h-5 w-5 text-crimson-500" />
                    Find a Donor
                  </Button>
                </Link>

                <Link href="/dashboard/blood-banks">
                  <Button size="lg" variant="outline" className="h-13 px-8 rounded-xl border-border bg-card/60 hover:bg-muted text-foreground font-semibold backdrop-blur-xs text-base">
                    <Building2 className="mr-2 h-5 w-5 text-crimson-500" />
                    Find Blood Banks
                  </Button>
                </Link>

              </motion.div>

              {/* Highlights */}
              <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center max-w-2xl mx-auto">
                {[
                  { icon: Heart, label: '100% Free' },
                  { icon: ShieldCheck, label: 'Screened Donors' },
                  { icon: MapPin, label: 'Location-Based Search' },
                  { icon: MessageSquare, label: 'Real-Time Chat' },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <item.icon className="h-6 w-6 text-crimson-500" />
                    <div className="text-xs text-muted-foreground font-medium mt-2">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* PROBLEM STATEMENT */}
      <section id="problem" className="py-24 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-crimson-600 dark:text-crimson-400 mb-3">The Problem</h2>
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">
              Finding Blood Still Depends on Social Media
            </p>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              When a patient urgently needs blood, most families post a request on WhatsApp statuses, Facebook stories
              and groups, then wait for someone with the right blood group to notice it. That search can take hours,
              and for a patient in need, every second matters.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROBLEMS.map((item) => (
              <Card key={item.title} className="p-6 bg-card border-border hover:border-rose-500/40 transition-all rounded-2xl">
                <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* The solution */}
          <Card className="mt-10 p-8 rounded-2xl bg-linear-to-r from-red-600/10 via-rose-600/5 to-transparent border-red-600/20 flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30 shrink-0">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Our Solution: BloodLink</h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                BloodLink keeps a searchable list of willing, medically screened donors in one place. Instead of
                broadcasting a status and waiting, you search by blood group and location, reach the right donors
                directly, and talk to them in real time, cutting the time it takes to find blood.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-crimson-600 dark:text-crimson-400 mb-3">How It Works</h2>
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">From Search to Donation in 6 Steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {WORKFLOW.map((item) => (
              <Card key={item.step} className="p-6 bg-card border-border hover:border-crimson-500/40 transition-all rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl font-extrabold text-muted-foreground/30">{item.step}</div>
                  <span className="px-2.5 py-1 rounded-full bg-red-600/10 text-red-600 dark:text-rose-400 text-[10px] font-semibold uppercase tracking-wider">
                    {item.who}
                  </span>
                </div>
                <item.icon className="h-8 w-8 text-crimson-500 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* Blood bank flow */}
          <Card className="mt-8 p-6 rounded-2xl bg-card border-border">
            <div className="flex items-center gap-3 mb-5">
              <Building2 className="h-6 w-6 text-crimson-500" />
              <h3 className="text-lg font-bold text-foreground">For Blood Banks</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 text-sm text-muted-foreground">
              {['Register with your license number', 'Verify your email', 'Keep your blood stock updated', 'Appear in blood bank searches'].map((text, idx, arr) => (
                <div key={text} className="flex items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                  {idx < arr.length - 1 && <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground/50 shrink-0" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-muted/20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-crimson-600 dark:text-crimson-400 mb-3">Features</h2>
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">Built for Emergencies</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="p-8 rounded-2xl bg-card border border-border hover:border-crimson-500/40 transition-all group">
                <feature.icon className="h-10 w-10 text-crimson-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE COMPARISON */}
      <section id="why-choose" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">Social Media vs BloodLink</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-rose-500/20">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-6 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-rose-500" /> WhatsApp Statuses & Facebook Stories
              </h3>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> You wait for the right person to happen to see your post.</li>
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Only reaches your own contacts and whoever they forward it to.</li>
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> No idea of a person&apos;s blood group, location or fitness to donate.</li>
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Posts expire or get buried, and have to be shared again.</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-emerald-500/30 shadow-xl">
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" /> The BloodLink Platform
              </h3>
              <ul className="space-y-4 text-foreground text-sm">
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> You search for donors yourself, right when you need them.</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> Filter by blood group, state, district, sub-division and city.</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> Every listed donor has passed a medical eligibility check.</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> Requests, notifications and chat keep everything in one place.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-muted/20 border-t border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <Accordion className="w-full space-y-4">
            {FAQS.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border border-border bg-card rounded-xl px-6"
              >
                <AccordionTrigger className="text-foreground hover:text-rose-500 font-medium text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 relative overflow-hidden bg-linear-to-br from-crimson-950/10 via-background to-background border-t border-border">
        <div className="mx-auto max-w-5xl px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight">
            Someone Needs Blood Today. <br /> You Can Make The Difference.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Register as a donor so people can find you when it matters most, or search for a donor the moment you need one.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {/* Fixed Register as Donor Button */}
            {!isDonor && user?.role === 'USER' && (
              <Link href='/register/donor'>
                <Button
                  size="lg"
                  className="h-13 px-8 rounded-xl bg-linear-to-r from-red-700 via-crimson-600 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white font-semibold active:scale-[0.98] transition-all text-base border-none"
                >
                  <Heart className="mr-2 h-5 w-5 fill-white text-white" />
                  Register as Donor
                </Button>
              </Link>

            )}


            {/* Fixed Search Blood Availability Button */}
            <Link href='/dashboard/donor'>
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 rounded-xl border-border bg-card hover:bg-muted text-foreground font-semibold backdrop-blur-xs text-base transition-all"
              >
                <Search className="mr-2 h-5 w-5 text-crimson-600 dark:text-crimson-400" />
                Search for Donor
              </Button>
            </Link>

            <Link href='/dashboard/blood-banks'>
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 rounded-xl border-border bg-card hover:bg-muted text-foreground font-semibold backdrop-blur-xs text-base transition-all"
              >
                <Building2 className="mr-2 h-5 w-5 text-crimson-600 dark:text-crimson-400" />
                Find Blood Banks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border bg-card text-muted-foreground text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-crimson-600 flex items-center justify-center">
              <HeartHandshake className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-foreground text-base">BloodLink</span>
          </div>
          <p>© 2026 BloodLink. Built to make finding blood donors faster.</p>
          <div className="flex gap-6">
            <Link href="#problem" className="hover:text-foreground">The Problem</Link>
            <Link href="#how-it-works" className="hover:text-foreground">How It Works</Link>
            <Link href="#faq" className="hover:text-foreground">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
