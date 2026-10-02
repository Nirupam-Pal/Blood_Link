'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppShell } from '@/components/layout/app-shell';
import { FieldLabel, Notice, PageHeader, Panel } from '@/components/ui/state-views';
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
    <>
      {isJustRegistered && (
        <Notice tone="success" className="mb-5">
          Account registered successfully! Please sign in with your credentials.
        </Notice>
      )}

      {storeError && (
        <Notice tone="brand" className="mb-5">
          {storeError}
        </Notice>
      )}

      <Panel className="p-6 sm:p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel
              htmlFor="password"
              hint={
                <Link href="/forgot-password" className="font-medium text-brand hover:underline">
                  Forgot password?
                </Link>
              }
            >
              Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Panel>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-foreground hover:text-brand">
          Register now
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <PageHeader
          icon={LogIn}
          title="Welcome back"
          description="Sign in to manage emergency blood requests and donations."
        />
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form…</p>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
