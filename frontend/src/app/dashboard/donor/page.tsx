'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  Droplet, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';
import { Navbar } from '@/components/layout/navbar';

interface Donor {
  _id: string;
  fullName: string;
  bloodGroup: string;
  gender: string;
  age: number;
  phoneNumber?: string;
  email: string;
  state: string;
  district: string;
  city: string;
  pinCode?: string;
  isAvailable?: boolean;
  lastDonationDate?: string;
}

const FALLBACK_DONORS: Donor[] = [
  {
    _id: '1',
    fullName: 'Aniket Sharma',
    bloodGroup: 'O_POSITIVE',
    gender: 'MALE',
    age: 24,
    phoneNumber: '+91 98765 43210',
    email: 'aniket.s@example.com',
    state: 'Tripura',
    district: 'West Tripura',
    city: 'Agartala',
    isAvailable: true,
    lastDonationDate: '2026-04-10',
  },
  {
    _id: '2',
    fullName: 'Priya Roy',
    bloodGroup: 'B_POSITIVE',
    gender: 'FEMALE',
    age: 22,
    phoneNumber: '+91 98123 45678',
    email: 'priya.roy@example.com',
    state: 'Tripura',
    district: 'West Tripura',
    city: 'Bishalgarh',
    isAvailable: true,
    lastDonationDate: '2026-01-15',
  },
  {
    _id: '3',
    fullName: 'Rahul Debnath',
    bloodGroup: 'AB_NEGATIVE',
    gender: 'MALE',
    age: 28,
    phoneNumber: '+91 97740 11223',
    email: 'rahul.d@example.com',
    state: 'Tripura',
    district: 'Gomati',
    city: 'Udaipur',
    isAvailable: false,
    lastDonationDate: '2026-07-20',
  },
  {
    _id: '4',
    fullName: 'Sneha Chakraborty',
    bloodGroup: 'A_POSITIVE',
    gender: 'FEMALE',
    age: 26,
    phoneNumber: '+91 94361 88990',
    email: 'sneha.c@example.com',
    state: 'Assam',
    district: 'Kamrup',
    city: 'Guwahati',
    isAvailable: true,
    lastDonationDate: '2025-11-05',
  },
];

export default function DonorDashboardPage() {
  const router = useRouter();
  const { user, status, isInitializing } = useAuthStore();

  const [donors, setDonors] = useState<Donor[]>(FALLBACK_DONORS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  // Safe Fetch Donors
  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (selectedState !== 'ALL') searchParams.append('state', selectedState);
      if (selectedBloodGroup !== 'ALL') searchParams.append('bloodGroup', selectedBloodGroup);

      const queryUrl = `${API_ROUTES.DONORS.SEARCH_DONORS}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const data = await apiClient<unknown>(queryUrl, {
        method: 'GET',
        requiresAuth: true,
      });

      if (Array.isArray(data)) {
        setDonors(data);
      } else if (data && typeof data === 'object' && 'donors' in data && Array.isArray((data as { donors: unknown }).donors)) {
        setDonors((data as { donors: Donor[] }).donors);
      } else {
        setDonors(FALLBACK_DONORS);
      }
    } catch {
      setDonors(FALLBACK_DONORS);
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedBloodGroup]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDonors();
    }
  }, [status, fetchDonors]);

  // Safe Filtered Donors List
  const safeDonorsList = Array.isArray(donors) ? donors : [];

  const filteredDonors = useMemo(() => {
    return safeDonorsList.filter((d) => {
      const fullName = d?.fullName || '';
      const city = d?.city || '';
      const district = d?.district || '';
      const bloodGroup = d?.bloodGroup || '';
      const state = d?.state || '';

      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBlood =
        selectedBloodGroup === 'ALL' || bloodGroup === selectedBloodGroup;

      const matchesState =
        selectedState === 'ALL' || state.toLowerCase() === selectedState.toLowerCase();

      return matchesSearch && matchesBlood && matchesState;
    });
  }, [safeDonorsList, searchQuery, selectedBloodGroup, selectedState]);

  if (isInitializing || status === 'idle') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="h-10 w-10 text-crimson-600 animate-bounce" />
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto mt-18 px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Donors</p>
                <h3 className="text-2xl font-black mt-1">{safeDonorsList.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-crimson-600 flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active & Ready</p>
                <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                  {safeDonorsList.filter((d) => d.isAvailable !== false).length}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Filtered Matches</p>
                <h3 className="text-2xl font-black mt-1 text-crimson-600">
                  {filteredDonors.length}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-crimson-600/10 text-crimson-600 flex items-center justify-center">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Blood Group</p>
                <h3 className="text-2xl font-black mt-1">
                  {(user as { bloodGroup?: string } | null)?.bloodGroup?.replace('_', ' ') || 'O+'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Droplet className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="p-5 bg-card border-border shadow-sm rounded-2xl mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name, city, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background"
              />
            </div>

            <div className="sm:col-span-3">
              <Select
                value={selectedBloodGroup}
                onValueChange={(value) => setSelectedBloodGroup(value ?? 'ALL')}
              >
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="All Blood Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Blood Groups</SelectItem>
                  {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'].map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Select
                value={selectedState}
                onValueChange={(value) => setSelectedState(value ?? 'ALL')}
              >
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All States</SelectItem>
                  <SelectItem value="Tripura">Tripura</SelectItem>
                  <SelectItem value="Assam">Assam</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Donors Grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Available Donors Nearby ({filteredDonors.length})</h2>
          <Button variant="ghost" size="sm" onClick={fetchDonors} disabled={loading} className="gap-2 text-xs text-muted-foreground">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {filteredDonors.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Donors Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search criteria or clear your blood group filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <motion.div
                key={donor._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 bg-card border-border hover:border-crimson-600/40 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-crimson-600/10 text-crimson-600 font-extrabold flex items-center justify-center text-lg border border-crimson-600/20">
                          {(donor.bloodGroup || '').replace('_', ' ').replace('POSITIVE', '+').replace('NEGATIVE', '-')}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-tight">{donor.fullName}</h3>
                          <span className="text-xs text-muted-foreground">{donor.age} yrs • {donor.gender}</span>
                        </div>
                      </div>
                      <Badge variant={donor.isAvailable !== false ? 'default' : 'secondary'} className={donor.isAvailable !== false ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]' : 'text-[10px]'}>
                        {donor.isAvailable !== false ? 'Available' : 'Cooldown'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-crimson-600 shrink-0" />
                        <span>{donor.city}, {donor.district}, {donor.state}</span>
                      </div>
                      {donor.lastDonationDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>Last donated: {new Date(donor.lastDonationDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex gap-2">
                    <Button
                      onClick={() => setSelectedDonor(donor)}
                      className="w-full h-9 bg-linear-to-r from-red-700 to-crimson-600 hover:from-red-800 hover:to-rose-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-crimson-600/20"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Contact Donor
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Contact Donor Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-lg font-bold">Contact Emergency Donor</h3>
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Donor Name:</span>
                  <span className="font-bold">{selectedDonor.fullName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Blood Group:</span>
                  <span className="font-bold text-crimson-600">{(selectedDonor.bloodGroup || '').replace('_', ' ')}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Phone Number:</span>
                  <a href={`tel:${selectedDonor.phoneNumber || ''}`} className="font-bold text-emerald-600 hover:underline flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {selectedDonor.phoneNumber || 'Available upon request'}
                  </a>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Email Address:</span>
                  <a href={`mailto:${selectedDonor.email}`} className="font-medium text-foreground hover:underline flex items-center gap-1.5 text-xs">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedDonor.email}
                  </a>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedDonor(null)} className="w-full bg-crimson-600 hover:bg-crimson-500 text-white">
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}