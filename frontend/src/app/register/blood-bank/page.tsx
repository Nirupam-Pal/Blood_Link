'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/app-shell';
import { FieldLabel, Notice, PageHeader, Panel, SectionHeading } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { RegisterBloodBankDto } from '@/types/blood-bank.types';

export default function RegisterBloodBankPage() {
  const router = useRouter();

  // Auth Store Hooks
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const isAuthSubmitting = useAuthStore((state) => state.isSubmitting);
  const authError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearError);

  // Blood Bank Store Hooks
  const setPendingBloodBankData = useBloodBankStore((state) => state.setPendingRegistrationData);
  const isBloodBankSubmitting = useBloodBankStore((state) => state.isSubmitting);
  const bloodBankError = useBloodBankStore((state) => state.error);
  const clearBloodBankError = useBloodBankStore((state) => state.clearError);

  const isSubmitting = isAuthSubmitting || isBloodBankSubmitting;
  const storeError = authError || bloodBankError;

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<RegisterBloodBankDto>({
    bloodBankName: '',
    email: '',
    password: '',
    licenseNumber: '',
    phoneNumber: '',
    address: '',
    state: 'Tripura',
    district: '',
    subDivision: '',
    city: '',
    pinCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (localError || storeError) {
      setLocalError(null);
      clearAuthError();
      clearBloodBankError();
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (formData.phoneNumber.length !== 10 || !/^\d{10}$/.test(formData.phoneNumber)) {
      return 'Phone number must be exactly 10 digits.';
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      return 'Pincode must be exactly 6 numeric digits.';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    clearBloodBankError();

    const clientValidationError = validate();
    if (clientValidationError) {
      setLocalError(clientValidationError);
      return;
    }

    try {
      setPendingBloodBankData(formData);
      await sendOtp({ email: formData.email });
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch {
      // Handled by stores
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        {success ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Panel className="py-16 px-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-5" />
              <h1 className="text-2xl font-bold">Registration successful</h1>
              <p className="mt-2 text-muted-foreground">Your blood bank facility has been registered. Redirecting to login...</p>
            </Panel>
          </motion.div>
        ) : (
          <>
            <PageHeader
              icon={Building2}
              title="Register blood bank"
              description="Register your licensed organization to manage emergency stock. We'll email a one-time code to verify the address."
            />

            {(localError || storeError) && (
              <Notice tone="brand" className="mb-6">
                {localError || storeError}
              </Notice>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Panel className="p-6 sm:p-8">
                <SectionHeading>Facility information</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="bloodBankName">Facility name</FieldLabel>
                    <Input
                      id="bloodBankName"
                      name="bloodBankName"
                      value={formData.bloodBankName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Agartala Govt Blood Bank"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="licenseNumber">License / accreditation number</FieldLabel>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. TR-BB-2026-001"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="email">Official contact email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="bloodbank@facility.org"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="phoneNumber" hint="10 digits">Emergency phone</FieldLabel>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="password">Portal access password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Min 8 chars: 1 upper, 1 lower, 1 digit, 1 symbol"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel className="p-6 sm:p-8">
                <SectionHeading>Location & address</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <FieldLabel htmlFor="address">Street / campus address</FieldLabel>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="e.g. GB Pant Hospital Road, Kunjaban"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>State</FieldLabel>
                    <Select
                      value={formData.state}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, state: val || 'Tripura' }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tripura">Tripura</SelectItem>
                        <SelectItem value="Assam">Assam</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="district">District</FieldLabel>
                    <Input id="district" name="district" value={formData.district} onChange={handleChange} required placeholder="e.g. West Tripura" />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="subDivision">Sub-division</FieldLabel>
                    <Input id="subDivision" name="subDivision" value={formData.subDivision} onChange={handleChange} required placeholder="e.g. Sadar" />
                  </div>
                  <div className="sm:col-span-3">
                    <FieldLabel htmlFor="city">City / town</FieldLabel>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. Agartala" />
                  </div>
                  <div className="sm:col-span-3">
                    <FieldLabel htmlFor="pinCode" hint="6 digits">Postal PIN code</FieldLabel>
                    <Input
                      id="pinCode"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      placeholder="799006"
                    />
                  </div>
                </div>
              </Panel>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Already registered?{' '}
                  <Link href="/login" className="font-medium text-foreground hover:text-brand">
                    Sign in
                  </Link>
                </p>
                <Button type="submit" disabled={isSubmitting} size="lg" className="sm:min-w-52">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Register blood bank
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
