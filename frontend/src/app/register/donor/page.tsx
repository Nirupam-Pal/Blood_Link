'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Activity,
  FileText,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { RegisterDonorDto, DonorAssessmentResult } from '@/types/auth.types';
import { Navbar } from '@/components/layout/navbar';

export default function RegisterDonorPage() {
  const router = useRouter();
  const { user, status, isInitializing, isSubmitting, registerAsDonor, error: storeError, clearError } = useAuthStore();

  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const [medicalAnswers, setMedicalAnswers] = useState({
    takingMedication: false,
    recentTattoo: false,
    recentSurgery: false,
    hepatitis: false,
    hiv: false,
    diabetes: false,
    highBloodPressure: false,
    chronicDisease: false,
  });

  const [consents, setConsents] = useState({
    consentInformation: false,
    consentContact: false,
    consentPrivacy: false,
  });

  const [assessmentResult, setAssessmentResult] = useState<DonorAssessmentResult | null>(null);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  const handleMedicalToggle = (key: keyof typeof medicalAnswers, value: boolean) => {
    setMedicalAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleConsentToggle = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (weight === '' || Number(weight) <= 0) {
      setLocalError('Please enter a valid body weight in kilograms.');
      return;
    }

    if (!consents.consentInformation || !consents.consentContact || !consents.consentPrivacy) {
      setLocalError('Please accept all 3 legal consent declarations before submitting.');
      return;
    }

    const payload: RegisterDonorDto = {
      weight: Number(weight),
      ...medicalAnswers,
      ...consents,
    };

    try {
      const res = await registerAsDonor(payload);
      if (res && res.data) {
        setAssessmentResult(res.data);
        setAssessmentCompleted(true);
      } else {
        // Fallback for direct assessment response formats
        setAssessmentResult({ eligible: true, reasons: [] });
        setAssessmentCompleted(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration request failed. Please check your connection.';
      setLocalError(errorMsg);
    }
  };

  if (isInitializing || status === 'idle') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 text-crimson-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  // Already Registered Donor State
  if (user?.donor && !assessmentCompleted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-2xl w-full mx-auto mt-24 px-4 py-8">
          <Card className="p-8 bg-card border-border shadow-xl rounded-2xl text-center">
            <div className="h-16 w-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <UserCheck className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black mb-2">Active Donor Clearance Verified</h1>
            <p className="text-sm text-muted-foreground mb-6">
              You are already registered and marked as an active, eligible blood donor in the BloodLink ecosystem.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => router.push('/dashboard/donor')} className="bg-crimson-600 hover:bg-crimson-700 text-white">
                Go to Donor Portal
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const activeError = localError || storeError;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto mt-20 px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/donor"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Assessment Evaluation Modal / View */}
        <AnimatePresence>
          {assessmentCompleted && assessmentResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className={`p-6 sm:p-8 border shadow-2xl rounded-2xl ${
                assessmentResult.eligible 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}>
                <div className="flex items-start gap-4">
                  {assessmentResult.eligible ? (
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                      <XCircle className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="text-xl font-bold">
                      {assessmentResult.eligible ? 'Clearance Granted: Eligible Donor' : 'Eligibility Requirements Not Met'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessmentResult.eligible
                        ? 'Your profile has been updated. You are now registered as an active blood donor in BloodLink.'
                        : 'Based on your medical assessment responses, you are currently ineligible to donate blood:'}
                    </p>

                    {!assessmentResult.eligible && assessmentResult.reasons && assessmentResult.reasons.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {assessmentResult.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-6 flex gap-3">
                      {assessmentResult.eligible ? (
                        <Button
                          onClick={() => router.push('/dashboard/donor')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          View Donor Dashboard
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setAssessmentCompleted(false)}
                          className="text-xs"
                        >
                          Retake Assessment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!assessmentCompleted && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-2xl bg-crimson-600/10 text-crimson-600 border border-crimson-600/20 flex items-center justify-center font-bold">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Donor Medical Eligibility Clearance</h1>
                <p className="text-xs text-muted-foreground">Complete this quick screening questionnaire to register as an active donor.</p>
              </div>
            </div>

            {/* Error Banner */}
            {activeError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{activeError}</span>
              </motion.div>
            )}

            <Card className="p-6 sm:p-8 bg-card border-border shadow-xl rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section 1: Physical Assessment */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-crimson-600 flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4" />
                    1. Physical Metrics
                  </h2>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Body Weight (kg) <span className="text-crimson-600">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 25"
                      required
                      min={45}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="h-11 bg-background max-w-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Minimum safe donation weight requirement is usually 18 kg.</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Age <span className="text-crimson-600">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 25"
                      required
                      min={18}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                      className="h-11 bg-background max-w-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Minimum safe donation age requirement is usually 18.</p>
                  </div>
                </div>

                {/* Section 2: Medical History Questions */}
                <div className="pt-6 border-t border-border">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-crimson-600 flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-4 w-4" />
                    2. Medical History & Health Status
                  </h2>

                  <div className="space-y-3">
                    {[
                      { key: 'takingMedication', label: 'Are you currently taking any prescription medication or antibiotics?' },
                      { key: 'recentTattoo', label: 'Have you gotten a tattoo or body piercing in the last 6 months?' },
                      { key: 'recentSurgery', label: 'Have you undergone major surgical procedures in the last 6 months?' },
                      { key: 'hepatitis', label: 'Have you ever tested positive for Hepatitis B or Hepatitis C?' },
                      { key: 'hiv', label: 'Have you ever tested positive for HIV / AIDS?' },
                      { key: 'diabetes', label: 'Do you have insulin-dependent diabetes?' },
                      { key: 'highBloodPressure', label: 'Do you currently suffer from uncontrolled high blood pressure?' },
                      { key: 'chronicDisease', label: 'Do you have any chronic cardiovascular, renal, or respiratory diseases?' },
                    ].map(({ key, label }) => {
                      const typedKey = key as keyof typeof medicalAnswers;
                      const isYes = medicalAnswers[typedKey];

                      return (
                        <div key={key} className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs font-medium text-foreground">{label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMedicalToggle(typedKey, false)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                !isYes 
                                  ? 'bg-emerald-600 text-white shadow-xs' 
                                  : 'bg-background text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMedicalToggle(typedKey, true)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                isYes 
                                  ? 'bg-rose-600 text-white shadow-xs' 
                                  : 'bg-background text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Yes
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Legal & Privacy Consents */}
                <div className="pt-6 border-t border-border">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-crimson-600 flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4" />
                    3. Legal Acknowledgement & Consent
                  </h2>

                  <div className="space-y-3">
                    {[
                      { key: 'consentInformation', label: 'I declare that all personal and medical information submitted above is accurate and truthful.' },
                      { key: 'consentContact', label: 'I consent to being contacted by patients or certified blood banks in cases of emergency blood needs.' },
                      { key: 'consentPrivacy', label: 'I agree to the BloodLink Donor Privacy Policy & Terms of Service regarding blood health records.' },
                    ].map(({ key, label }) => {
                      const typedKey = key as keyof typeof consents;
                      return (
                        <label key={key} className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={consents[typedKey]}
                            onChange={() => handleConsentToggle(typedKey)}
                            className="mt-0.5 h-4 w-4 rounded-sm border-border text-crimson-600 focus:ring-crimson-500 accent-crimson-600"
                          />
                          <span className="text-xs text-muted-foreground leading-relaxed">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-linear-to-r from-red-700 via-rose-600 to-red-600 hover:from-red-800 hover:to-rose-700 text-white font-semibold text-sm shadow-lg shadow-crimson-600/25 border-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating Clearance...
                    </span>
                  ) : (
                    'Submit Assessment & Activate Donor Profile'
                  )}
                </Button>
              </form>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}