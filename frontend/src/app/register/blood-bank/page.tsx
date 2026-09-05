'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileBadge,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { Navbar } from '@/components/layout/navbar';
import { RegisterBloodBankDto } from '@/types/blood-bank.types';

export default function RegisterBloodBankPage() {
  const router = useRouter();
  const registerBloodBank = useAuthStore((state) => state.registerBloodBank);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

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
      clearError();
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

  const sendOtp = useAuthStore((state) => state.sendOtp);
  const setPendingBloodBankData = useAuthStore((state) => state.setPendingBloodBankData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

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
      // Handled by store
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <Link href="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to portal selection
        </Link>


        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Register Blood Bank</h1>
            <p className="text-sm text-muted-foreground">
              Register your licensed organization to manage emergency stock and donor requests
            </p>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-card border-border shadow-xl rounded-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-3"
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold">Registration Successful</h3>
              <p className="text-sm text-muted-foreground">
                Your blood bank facility has been registered. Redirecting to login...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {(localError || storeError) && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{localError || storeError}</span>
                </div>
              )}

              {/* Organization Identification */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Facility Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Facility Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="bloodBankName"
                        value={formData.bloodBankName}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Agartala Govt Blood Bank"
                        className="pl-9 h-11 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">License / Accreditation Number</label>
                    <div className="relative">
                      <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g. TR-BB-2026-001"
                        className="pl-9 h-11 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Official Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="bloodbank@facility.org"
                        className="pl-9 h-11 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Emergency Phone (10 digits)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        className="pl-9 h-11 bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Portal Access Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Min 8 chars: 1 upper, 1 lower, 1 digit, 1 symbol"
                      className="pl-9 pr-10 h-11 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Geographic Address */}
              <div className="space-y-4 pt-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Location & Address
                </h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Street / Campus Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="e.g. GB Pant Hospital Road, Kunjaban"
                      className="pl-9 h-11 bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">State</label>
                    <Select
                      value={formData.state}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, state: val || 'Tripura' }))}
                    >
                      <SelectTrigger className="h-11 bg-background w-full">
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tripura">Tripura</SelectItem>
                        <SelectItem value="Assam">Assam</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">District</label>
                    <Input
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      placeholder="e.g. West Tripura"
                      className="h-11 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Sub-Division</label>
                    <Input
                      name="subDivision"
                      value={formData.subDivision}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Sadar"
                      className="h-11 bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">City / Town</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Agartala"
                      className="h-11 bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Postal Pin Code</label>
                    <Input
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      placeholder="799006"
                      className="h-11 bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Already registered?{' '}
                  <Link href="/login" className="text-red-600 hover:underline font-medium">
                    Sign In
                  </Link>
                </p>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-8 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering Facility...
                    </>
                  ) : (
                    'Register Blood Bank'
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}