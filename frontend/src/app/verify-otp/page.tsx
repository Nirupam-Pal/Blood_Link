'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, RotateCcw, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { Notice, PageHeader, PageLoader, Panel } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
// useSearchParams() needs a Suspense boundary so the page can be prerendered at build time
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading verification" />}>
      <VerifyOtpContent />
    </Suspense>
  );
}

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get('email');

  // Auth Store Hooks
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const isAuthSubmitting = useAuthStore((state) => state.isSubmitting);
  const authError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearError);

  // Blood Bank Store Hooks
  const pendingData = useBloodBankStore((state) => state.pendingRegistrationData);
  const registerBloodBank = useBloodBankStore((state) => state.registerBloodBank);
  const isBloodBankSubmitting = useBloodBankStore((state) => state.isSubmitting);
  const bloodBankError = useBloodBankStore((state) => state.error);
  const clearBloodBankError = useBloodBankStore((state) => state.clearError);

  const isSubmitting = isAuthSubmitting || isBloodBankSubmitting;
  const storeError = authError || bloodBankError;

  const email = queryEmail || pendingData?.email || '';

  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [actionStage, setActionStage] = useState<'IDLE' | 'VERIFYING' | 'CREATING'>('IDLE');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, val: string) => {
    if (localError || storeError) {
      setLocalError(null);
      clearAuthError();
      clearBloodBankError();
    }

    const digit = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpValues];
    updated[index] = digit;
    setOtpValues(updated);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const updated = [...otpValues];
    for (let i = 0; i < pasteData.length; i++) {
      updated[i] = pasteData[i];
    }
    setOtpValues(updated);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    clearBloodBankError();

    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setLocalError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (!email) {
      setLocalError('No target email found. Please return to registration.');
      return;
    }

    try {
      // Step A: Verify OTP with Backend
      setActionStage('VERIFYING');
      const otpRes = await verifyOtp({ email, otp });

      if (otpRes.verified) {
        // Step B: If registration data is present in useBloodBankStore, create the Blood Bank record
        if (pendingData) {
          setActionStage('CREATING');
          await registerBloodBank(pendingData);
        }

        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2200);
      }
    } catch {
      setActionStage('IDLE');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setLocalError(null);
    clearAuthError();
    clearBloodBankError();

    try {
      await sendOtp({ email });
      setResendCooldown(60);
    } catch {}
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        {isSuccess ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Panel className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold">Registration complete!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your email has been verified and your Blood Bank account is registered. Redirecting to login...
              </p>
              <Button onClick={() => router.push('/login')} size="lg" className="mt-6 w-full">
                Proceed to login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Panel>
          </motion.div>
        ) : (
          <>
            <PageHeader
              icon={ShieldCheck}
              title="Verify & register"
              description={
                <>
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-foreground">{email || 'your email address'}</span>
                </>
              }
            />

            {(localError || storeError) && (
              <Notice tone="brand" className="mb-5">
                {localError || storeError}
              </Notice>
            )}

            <Panel className="p-6 sm:p-8">
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      value={val}
                      aria-label={`Digit ${idx + 1}`}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="h-14 w-full min-w-0 rounded-xl border border-transparent bg-muted text-center text-2xl font-semibold text-foreground outline-none caret-brand transition-all focus:border-ring focus:bg-background focus:ring-3 focus:ring-ring/15 focus:-translate-y-0.5"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || otpValues.join('').length !== 6}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {actionStage === 'CREATING' ? 'Creating Blood Bank Account...' : 'Validating OTP...'}
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </Button>
              </form>
            </Panel>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              Didn&apos;t receive the code?
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isSubmitting}
                className="inline-flex items-center gap-1 font-medium text-foreground hover:text-brand disabled:text-muted-foreground disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {resendCooldown > 0 ? (
                  <span className="tabular-nums">Resend in {resendCooldown}s</span>
                ) : (
                  'Resend OTP'
                )}
              </button>
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
