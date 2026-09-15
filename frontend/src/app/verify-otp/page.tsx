'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Mail, 
  AlertCircle, 
  Loader2, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';

export default function VerifyOtpPage() {
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
    <div className="relative min-h-screen bg-cosmic text-foreground flex flex-col overflow-hidden">
      <AmbientOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 max-w-md w-full mx-auto mt-24 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
        <Card className="p-6 sm:p-8 bg-card border-border shadow-2xl rounded-3xl">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-3"
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold">Registration Complete!</h3>
              <p className="text-xs text-muted-foreground">
                Your email has been verified and your Blood Bank account is registered. Redirecting to login...
              </p>
              <div className="pt-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs w-full cursor-pointer"
                >
                  Proceed to Login <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 rounded-2xl bg-red-600/10 text-red-600 items-center justify-center mb-3 border border-red-600/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Verify & Register</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code sent to:
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-foreground">
                  <Mail className="h-3.5 w-3.5 text-red-600" />
                  <span>{email || 'your email address'}</span>
                </div>
              </div>

              {(localError || storeError) && (
                <div className="p-3.5 mb-5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{localError || storeError}</span>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-between gap-2 sm:gap-2.5">
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-background border border-border rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:scale-110 outline-none transition-all duration-200"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || otpValues.join('').length !== 6}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {actionStage === 'CREATING' ? 'Creating Blood Bank Account...' : 'Validating OTP...'}
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the OTP?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="text-red-600 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </div>
          )}
        </Card>
        </motion.div>
      </main>
    </div>
  );
}