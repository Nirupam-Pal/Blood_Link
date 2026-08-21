'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HeartHandshake, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gender: 'MALE',
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData
      }),
    });

    if (res.ok) {
      router.push('/login?registered=true');
    } else {
      const error = await res.json();
      alert(error.message || 'Registration failed');
    }
  } catch {
    alert('Could not connect to backend server.');
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
                  <Input type="password" name="password" placeholder="••••••••" required value={formData.password} onChange={handleChange} />
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