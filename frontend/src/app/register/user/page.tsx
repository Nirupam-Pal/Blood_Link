'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, EyeOff, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/app-shell';
import { FieldLabel, PageHeader, Panel, SectionHeading } from '@/components/ui/state-views';
import { API_ROUTES } from '@/lib/api-routes';
import { useAuthStore } from '@/stores/auth.store';

export default function RegisterUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registerUser = useAuthStore((state) => state.registerUser);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gender: 'MALE',
    bloodGroup: 'A+',
    state: '',
    district: '',
    subDivision: '',
    city: '',
    pinCode: '',
    isDonor: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_ROUTES.USERS.REGISTER_USER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join('\n')
          : data.message || 'Registration failed';
        alert(errorMsg);
      }
    } catch {
      alert('Could not connect to backend server at' + API_ROUTES.USERS.REGISTER_USER);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          icon={User}
          title="Individual registration"
          description="Create your BloodLink donor & patient profile."
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Panel className="p-6 sm:p-8">
            <SectionHeading>Personal information</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input id="fullName" name="fullName" placeholder="John Doe" required value={formData.fullName} onChange={handleChange} />
              </div>
              <div>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input id="email" type="email" name="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="SecureP@ss123"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>Gender</FieldLabel>
                <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val ?? formData.gender })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Blood group</FieldLabel>
                <Select value={formData.bloodGroup} onValueChange={(val) => setFormData({ ...formData, bloodGroup: val ?? formData.bloodGroup })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Panel>

          <Panel className="p-6 sm:p-8">
            <SectionHeading>Location details</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FieldLabel htmlFor="state">State</FieldLabel>
                <Input id="state" name="state" placeholder="Tripura" required value={formData.state} onChange={handleChange} />
              </div>
              <div className="sm:col-span-3">
                <FieldLabel htmlFor="district">District</FieldLabel>
                <Input id="district" name="district" placeholder="West Tripura" required value={formData.district} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="subDivision">Sub-division</FieldLabel>
                <Input id="subDivision" name="subDivision" placeholder="Sadar" required value={formData.subDivision} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input id="city" name="city" placeholder="Agartala" required value={formData.city} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="pinCode">PIN code</FieldLabel>
                <Input id="pinCode" name="pinCode" placeholder="799001" required value={formData.pinCode} onChange={handleChange} />
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
            <Button type="submit" disabled={loading} size="lg" className="sm:min-w-52">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Complete registration
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
