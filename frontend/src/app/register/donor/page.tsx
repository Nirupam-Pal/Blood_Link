'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, HeartPulse, Loader2, UserCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppShell } from '@/components/layout/app-shell';
import { FieldLabel, Notice, PageHeader, PageLoader, Panel, SectionHeading } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useDonorStore } from '@/stores/donor.store';
import { RegisterDonorDto, DonorAssessmentResult } from '@/types/donor.types';
import { cn } from '@/lib/utils';

const MEDICAL_QUESTIONS = [
  { key: 'takingMedication', label: 'Are you currently taking any prescription medication or antibiotics?' },
  { key: 'recentTattoo', label: 'Have you gotten a tattoo or body piercing in the last 6 months?' },
  { key: 'recentSurgery', label: 'Have you undergone major surgical procedures in the last 6 months?' },
  { key: 'hepatitis', label: 'Have you ever tested positive for Hepatitis B or Hepatitis C?' },
  { key: 'hiv', label: 'Have you ever tested positive for HIV / AIDS?' },
  { key: 'diabetes', label: 'Do you have insulin-dependent diabetes?' },
  { key: 'highBloodPressure', label: 'Do you currently suffer from uncontrolled high blood pressure?' },
  { key: 'chronicDisease', label: 'Do you have any chronic cardiovascular, renal, or respiratory diseases?' },
];

const CONSENT_ITEMS = [
  { key: 'consentInformation', label: 'I declare that all personal and medical information submitted above is accurate and truthful.' },
  { key: 'consentContact', label: 'I consent to being contacted by patients or certified blood banks in cases of emergency blood needs.' },
  { key: 'consentPrivacy', label: 'I agree to the BloodLink Donor Privacy Policy & Terms of Service regarding blood health records.' },
];

export default function RegisterDonorPage() {
  const router = useRouter();
  const { user, status, isInitializing } = useAuthStore();
  const { isSubmitting, registerAsDonor, error: storeError, clearError } = useDonorStore();

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

  // Only USER accounts can register as a donor — Blood Bank accounts have
  // no donor eligibility flow and should never reach this form.
  useEffect(() => {
    if (!isInitializing && status === 'authenticated' && user && user.role !== 'USER') {
      router.push('/');
    }
  }, [status, isInitializing, user, router]);

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

    if (age === '' || !Number.isInteger(Number(age))) {
      setLocalError('Please enter your age in years.');
      return;
    }

    if (Number(age) < 18 || Number(age) > 65) {
      setLocalError('Blood donors must be between 18 and 65 years old.');
      return;
    }

    if (!consents.consentInformation || !consents.consentContact || !consents.consentPrivacy) {
      setLocalError('Please accept all 3 legal consent declarations before submitting.');
      return;
    }

    const payload: RegisterDonorDto = {
      weight: Number(weight),
      age: Number(age),
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

  if (isInitializing || status === 'idle' || (user && user.role !== 'USER')) {
    return <PageLoader label="Checking authentication status" />;
  }

  // Already Registered Donor State
  if (user?.donor && !assessmentCompleted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl">
          <Panel className="relative overflow-hidden p-10 text-center">
            <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" />
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-soft text-success">
              <UserCheck className="h-7 w-7" />
            </div>
            <h1 className="relative text-2xl font-bold">Active donor clearance verified</h1>
            <p className="relative mt-2 text-muted-foreground">
              You are already registered and marked as an active, eligible blood donor in the BloodLink ecosystem.
            </p>
            <Button onClick={() => router.push('/dashboard/donor')} size="lg" className="relative mt-6">
              Go to donor portal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const activeError = localError || storeError;
  const answeredYes = Object.values(medicalAnswers).filter(Boolean).length;
  const consentCount = Object.values(consents).filter(Boolean).length;

  return (
    <AppShell>
      <Link href="/dashboard/donor" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Assessment Evaluation */}
      <AnimatePresence>
        {assessmentCompleted && assessmentResult && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-2xl">
            <div
              className={cn(
                'rounded-3xl p-2 shadow-xl',
                assessmentResult.eligible ? 'bg-linear-to-b from-emerald-400 to-emerald-600 shadow-emerald-500/20' : 'bg-linear-to-b from-red-600 to-red-800 shadow-red-500/20'
              )}
            >
              <div className="rounded-[1.25rem] bg-background p-8">
                <div
                  className={cn(
                    'mb-5 flex h-14 w-14 items-center justify-center rounded-2xl',
                    assessmentResult.eligible ? 'bg-success-soft text-success' : 'bg-brand-soft text-brand'
                  )}
                >
                  {assessmentResult.eligible ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
                </div>
                <h2 className="text-2xl font-bold">
                  {assessmentResult.eligible ? 'Clearance granted: eligible donor' : 'Eligibility requirements not met'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {assessmentResult.eligible
                    ? 'Your profile has been updated. You are now registered as an active blood donor in BloodLink.'
                    : 'Based on your medical assessment responses, you are currently ineligible to donate blood:'}
                </p>

                {!assessmentResult.eligible && assessmentResult.reasons && assessmentResult.reasons.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {assessmentResult.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 rounded-xl bg-brand-soft px-3.5 py-2.5 text-sm text-brand">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-7">
                  {assessmentResult.eligible ? (
                    <Button size="lg" onClick={() => router.push('/dashboard/donor')}>
                      View donor dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" onClick={() => setAssessmentCompleted(false)}>
                      Retake assessment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!assessmentCompleted && (
        <>
          <PageHeader
            icon={HeartPulse}
            title={<>Donor <span className="text-gradient-brand">eligibility</span> check</>}
            description="Complete this quick screening questionnaire to register as an active donor."
          />

          {activeError && (
            <Notice tone="brand" className="mb-6">
              {activeError}
            </Notice>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_18rem]">
            <div className="space-y-6 min-w-0">
              {/* Section 1: Physical Assessment */}
              <Panel className="p-6 sm:p-8">
                <SectionHeading>1. Physical metrics</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="weight" required hint="Minimum 45 kg">Body weight (kg)</FieldLabel>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g. 60"
                      required
                      min={45}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="age" required hint="18 – 65">Age</FieldLabel>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 25"
                      required
                      min={18}
                      max={65}
                      value={age}
                      onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>
              </Panel>

              {/* Section 2: Medical History Questions */}
              <Panel className="p-6 sm:p-8">
                <SectionHeading>2. Medical history & health status</SectionHeading>
                <div className="space-y-2.5">
                  {MEDICAL_QUESTIONS.map(({ key, label }) => {
                    const typedKey = key as keyof typeof medicalAnswers;
                    const isYes = medicalAnswers[typedKey];

                    return (
                      <div key={key} className="flex flex-col gap-3 rounded-xl bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-foreground">{label}</span>
                        <div className="inline-flex shrink-0 gap-1 self-start rounded-lg bg-muted p-1 sm:self-auto" role="radiogroup" aria-label={label}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={!isYes}
                            onClick={() => handleMedicalToggle(typedKey, false)}
                            className={cn(
                              'rounded-md px-3.5 py-1 text-xs font-semibold cursor-pointer transition-all',
                              !isYes ? 'bg-card text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isYes}
                            onClick={() => handleMedicalToggle(typedKey, true)}
                            className={cn(
                              'rounded-md px-3.5 py-1 text-xs font-semibold cursor-pointer transition-all',
                              isYes ? 'bg-brand text-white shadow-card' : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>

              {/* Section 3: Legal & Privacy Consents */}
              <Panel className="p-6 sm:p-8">
                <SectionHeading>3. Legal acknowledgement & consent</SectionHeading>
                <div className="space-y-3">
                  {CONSENT_ITEMS.map(({ key, label }) => {
                    const typedKey = key as keyof typeof consents;
                    const checked = consents[typedKey];
                    return (
                      <label key={key} className="group flex cursor-pointer select-none items-start gap-3">
                        <input type="checkbox" checked={checked} onChange={() => handleConsentToggle(typedKey)} className="peer sr-only" />
                        <span
                          aria-hidden="true"
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/30',
                            checked ? 'bg-brand text-white' : 'bg-muted ring-1 ring-inset ring-border group-hover:ring-foreground/30'
                          )}
                        >
                          {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span className="text-sm leading-relaxed text-muted-foreground">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </Panel>
            </div>

            {/* Summary */}
            <aside className="self-start xl:sticky xl:top-8">
              <Panel className="p-5">
                <p className="text-sm font-semibold">Summary</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Weight</dt>
                    <dd className="font-medium">{weight === '' ? '—' : `${weight} kg`}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Age</dt>
                    <dd className="font-medium">{age === '' ? '—' : `${age} yrs`}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Health flags</dt>
                    <dd className={cn('font-medium', answeredYes > 0 ? 'text-brand' : 'text-success')}>{answeredYes} / 8</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Consents</dt>
                    <dd className={cn('font-medium', consentCount === 3 && 'text-success')}>{consentCount} / 3</dd>
                  </div>
                </dl>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-red-600 to-red-800"
                    animate={{ width: `${((weight !== '' ? 1 : 0) + (age !== '' ? 1 : 0) + consentCount) * 20}%` }}
                  />
                </div>
                {/* Submit Action */}
                <Button type="submit" variant="brand" size="lg" disabled={isSubmitting} className="mt-5 w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating clearance...
                    </>
                  ) : (
                    'Submit assessment'
                  )}
                </Button>
              </Panel>
            </aside>
          </form>
        </>
      )}
    </AppShell>
  );
}
