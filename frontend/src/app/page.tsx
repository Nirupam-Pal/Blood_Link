'use client';

import { motion, Variants } from 'framer-motion';
import {
  Heart,
  Search,
  ShieldCheck,
  Activity,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Bell,
  Smartphone,
  UserCheck,
  Droplet,
  HeartHandshake
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Navbar } from '@/components/layout/navbar';
import { useAuthStore } from '@/stores/auth.store';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export default function LandingPage() {

  const user = useAuthStore((state) => state.user)
  const isDonor = Boolean(user?.donor);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-crimson-500 selection:text-white transition-colors duration-300">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-crimson-600/10 dark:bg-crimson-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <motion.div
              className="lg:col-span-7 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/80 border border-border text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-6 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-crimson-500 animate-ping" />
                Real-Time Emergency Blood Ecosystem
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[0.02em] text-foreground leading-[1.05] text-balance">
                Every Drop Counts. <br />
                <span className="bg-linear-to-r from-red-950 via-rose-500 to-rose-400 bg-clip-text text-transparent">
                  Connecting Lives
                </span> In Seconds.
              </motion.h1>

              <motion.p variants={fadeInUp} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed tracking-[0.01em]">
                BloodLink bridges the critical gap between donors, patients, and blood banks using intelligent real-time matching. Reliable, fast, and accessible 24/7.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!isDonor && user?.role === 'USER' && (
                  <Link href='/register/donor'>
                    <Button size="lg" className="h-13 px-8 rounded-xl bg-linear-to-r from-red-950 via-rose-800 to-rose-700 text-white font-semibold shadow-xl shadow-crimson-600/20 hover:scale-[1.02] transition-transform text-base">
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

              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-foreground"><AnimatedCounter value={15000} suffix="+" /></div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Active Donors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground"><AnimatedCounter value={250} suffix="+" /></div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Blood Banks</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground"><AnimatedCounter value={10000} suffix="+" /></div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Lives Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Emergency Service</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Interactive Mockup Card */}
            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-3xl p-6 bg-card/80 border border-border backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-sm font-semibold text-foreground">Live Emergency Match</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Agartala, Tripura</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-crimson-600/20 text-crimson-600 dark:text-crimson-400 font-bold flex items-center justify-center">
                        O+
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Agartala Medical College</div>
                        <div className="text-xs text-muted-foreground">2 Units Needed Urgently</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      In Progress
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-crimson-600/20 text-crimson-600 dark:text-crimson-400 font-bold flex items-center justify-center">
                        B-
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Central Blood Bank</div>
                        <div className="text-xs text-muted-foreground">Donor Matched • 1.2 km away</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Matched
                    </span>
                  </div>
                </div>

                <motion.div
                  className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-card border border-border shadow-xl flex items-center gap-3 animate-float"
                >
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">Security Verified</div>
                    <div className="text-sm font-bold text-foreground">100% HIPAA Compliant</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* TRUSTED PARTNERS */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Trusted By Leading Healthcare Networks & NGOs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
            <span className="text-lg font-bold text-muted-foreground tracking-wider">APEX HEALTHCARE</span>
            <span className="text-lg font-bold text-muted-foreground tracking-wider">RED CROSS INDIA</span>
            <span className="text-lg font-bold text-muted-foreground tracking-wider">METRO HOSPITALS</span>
            <span className="text-lg font-bold text-muted-foreground tracking-wider">CARE BLOOD NETWORK</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-crimson-600 dark:text-crimson-400 mb-3">Seamless Workflow</h2>
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">How BloodLink Saves Lives</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Sign up as a donor or healthcare partner in under 2 minutes.', icon: UserCheck },
              { step: '02', title: 'Search', desc: 'Filter blood availability by state, district, or rare blood group.', icon: Search },
              { step: '03', title: 'Connect', desc: 'Instant real-time match notifications sent to nearest eligible donors.', icon: Bell },
              { step: '04', title: 'Save Lives', desc: 'Direct blood handoff coordinated safely with hospital verified logs.', icon: Heart },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 bg-card border-border hover:border-crimson-500/40 transition-all rounded-2xl">
                <div className="text-4xl font-extrabold text-muted-foreground/30 mb-4">{item.step}</div>
                <item.icon className="h-8 w-8 text-crimson-500 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-muted/20 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-crimson-600 dark:text-crimson-400 mb-3">Enterprise Capability</h2>
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">Built For Speed & Reliability</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Geographic Location Querying', desc: 'Search donors and inventories precisely mapped across States, Districts, Sub-Divisions, and Cities.' },
              { icon: Activity, title: 'Live Inventory Tracker', desc: 'Blood banks keep active real-time units updated down to specific blood components.' },
              { icon: ShieldCheck, title: 'Role-Based Access Control', desc: 'Strict JWT protected segregation between Donors, Patients, and Certified Blood Bank Admins.' },
              { icon: Clock, title: 'Fast Emergency Requests', desc: 'Post urgent blood requirements that broadcast directly to verified eligible donors in range.' },
              { icon: Smartphone, title: 'Mobile-Optimized PWA', desc: 'Accessible instantly on low-bandwidth mobile networks during critical emergency scenarios.' },
              { icon: Droplet, title: 'Donor Eligibility Tracking', desc: 'Automated 90-day cooldown calculations ensuring donor health safety and medical compliance.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-card border border-border hover:border-crimson-500/40 transition-all group">
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
            <p className="text-3xl sm:text-5xl font-semibold text-foreground tracking-[0.01em] text-balance">Traditional Methods vs BloodLink</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-rose-500/20">
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-6 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-rose-500" /> Traditional Phone Calls & WhatsApp Groups
              </h3>
              <ul className="space-y-4 text-muted-foreground text-sm">
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> High latency during critical emergency hours.</li>
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Outdated donor contacts and unverified availability.</li>
                <li className="flex items-start gap-3"><XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> No central visibility of hospital blood bank stock.</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-card border border-emerald-500/30 shadow-xl">
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" /> The BloodLink Platform
              </h3>
              <ul className="space-y-4 text-foreground text-sm">
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> Instant automated matching under 30 seconds.</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> Real-time active inventory tracking across certified banks.</li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> Verified donor eligibility & privacy protection.</li>
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
            {[
              {
                q: 'Is BloodLink completely free to use?',
                a: 'Yes. BloodLink is a healthcare initiative aimed at connecting blood donors and patients without any cost or middleman fees.',
              },
              {
                q: 'How is donor data privacy protected?',
                a: 'Donor phone numbers and personal identity details are hidden until a verified patient issues an active emergency request.',
              },
              {
                q: 'How do blood banks register on BloodLink?',
                a: 'Blood banks register using their official license numbers and undergo administrative verification before listing inventory.',
              },
            ].map((faq, idx) => (
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
            Join thousands of registered donors and health organizations on BloodLink today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            {/* Fixed Register as Donor Button */}
            {!isDonor && user?.role === 'USER' && (
              <Link href='/register/donor'>
                <Button
                  size="lg"
                  className="h-13 px-8 rounded-xl bg-linear-to-r from-red-700 via-crimson-600 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white font-semibold shadow-xl shadow-crimson-600/25 active:scale-[0.98] transition-all text-base border-none"
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
          <p>© 2026 BloodLink Ecosystem. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}