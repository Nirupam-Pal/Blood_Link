'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartHandshake, ArrowLeft, Loader2, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Back Link */}
        <Link href="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to portal selection
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Individual Registration</h1>
            <p className="text-sm text-muted-foreground">Create your BloodLink donor & patient profile</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 bg-card border-border shadow-xl rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Personal Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                1. Personal Information
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                  <Input name="fullName" placeholder="John Doe" required value={formData.fullName} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email Address</label>
                  <Input type="email" name="email" placeholder="john@example.com" required value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Password Field with Eye Toggle */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                  <div className="relative">
                    <Input
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
                  <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val ?? formData.gender })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Blood Group</label>
                  <Select value={formData.bloodGroup} onValueChange={(val) => setFormData({ ...formData, bloodGroup: val ?? formData.bloodGroup })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
            </div>

            {/* Address Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                2. Location Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">State</label>
                  <Input name="state" placeholder="Tripura" required value={formData.state} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">District</label>
                  <Input name="district" placeholder="West Tripura" required value={formData.district} onChange={handleChange} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Sub-Division</label>
                  <Input name="subDivision" placeholder="Sadar" required value={formData.subDivision} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                  <Input name="city" placeholder="Agartala" required value={formData.city} onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">PIN Code</label>
                  <Input name="pinCode" placeholder="799001" required value={formData.pinCode} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-red-700 via-crimson-600 to-rose-600 hover:from-red-800 hover:to-rose-700 text-white font-semibold text-base shadow-lg shadow-red-600/25"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Complete Registration'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}