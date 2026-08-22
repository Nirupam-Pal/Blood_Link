'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { HeartHandshake, LogIn, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/stores/auth.store';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isJustRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Zustand Selective Subscriptions
  const login = useAuthStore((state) => state.login);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      const user = await login({ email, password });

      if (user.role === 'BLOOD_BANK') {
        router.push('/dashboard/blood-bank');
      } else if (user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/donor');
      }
    } catch {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 bg-card border-border shadow-2xl rounded-2xl">
      {isJustRegistered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Account registered successfully! Please sign in with your credentials.</span>
        </motion.div>
      )}

      {storeError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{storeError}</span>
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-background"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-crimson-600 dark:text-rose-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-background"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-linear-to-r from-red-700 via-crimson-600 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white font-semibold shadow-lg shadow-crimson-600/25 transition-all border-none"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-crimson-600 dark:text-rose-400 font-semibold hover:underline">
          Register now
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-crimson-600 to-rose-500 flex items-center justify-center shadow-lg shadow-crimson-600/30 group-hover:scale-105 transition-transform">
            <HeartHandshake className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Blood<span className="text-crimson-500">Link</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="max-w-md w-full mx-auto my-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing page
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Sign in to manage emergency blood requests & donations
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading form...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-4">
        © 2026 BloodLink Ecosystem. All rights reserved.
      </footer>
    </div>
  );
}