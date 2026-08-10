'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Building2, ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function RegisterSelectionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <HeartHandshake className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Blood<span className="text-red-600">Link</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Selection Card Container */}
      <main className="max-w-4xl w-full mx-auto my-12">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-red-600 dark:text-red-400 mb-4"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Choose Account Type
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight"
          >
            How will you be using BloodLink?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-muted-foreground text-base sm:text-lg"
          >
            Select the category that best describes you to continue setup.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Individual User / Donor Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 h-full bg-card border-border hover:border-red-600/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Individual Donor / Patient</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Register as a blood donor or request blood during emergencies. Manage your eligibility status and donation history.
                </p>
              </div>

              <Link href="/register/user">
                <Button className="w-full h-11 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white font-medium gap-2">
                  Continue as Individual
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>

          {/* Blood Bank Organization Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 h-full bg-card border-border hover:border-red-600/50 transition-all duration-300 hover:shadow-xl flex flex-col justify-between group">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Blood Bank Organization</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Register your certified medical institution. Manage blood stock inventories, verify donor requests, and update unit availability in real time.
                </p>
              </div>

              <Link href="/register/blood-bank">
                <Button variant="outline" className="w-full h-11 border-border hover:bg-muted text-foreground font-medium gap-2">
                  Continue as Blood Bank
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-4">
        © 2026 BloodLink Ecosystem. All rights reserved.
      </footer>
    </div>
  );
}