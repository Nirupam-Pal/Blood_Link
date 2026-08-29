'use client';

import { useState, useEffect, useMemo } from 'react';
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
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { ActiveDonor } from '@/types/auth.types';
import { Navbar } from '@/components/layout/navbar';

export default function DonorDashboardPage() {
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const activeDonors = useAuthStore((state) => state.activeDonors);
  const isLoadingDonors = useAuthStore((state) => state.isLoadingDonors);
  const fetchActiveDonors = useAuthStore((state) => state.fetchActiveDonors);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDonor, setSelectedDonor] = useState<ActiveDonor | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  // Fetch active donors once auth is resolved
  useEffect(() => {
    if (!isInitializing && status === 'authenticated') {
      fetchActiveDonors();
    }
  }, [status, isInitializing, fetchActiveDonors]);

  // Extract unique states for filter dropdown
  const availableStates = useMemo(() => {
    const statesSet = new Set<string>();
    (activeDonors || []).forEach((d) => {
      if (d.state) statesSet.add(d.state);
    });
    return Array.from(statesSet);
  }, [activeDonors]);

  // Normalize Blood Groups
  const normalizeBG = (bg?: string) => {
    if (!bg) return '';
    return bg
      .replace('_POSITIVE', '+')
      .replace('_NEGATIVE', '-')
      .replace('POSITIVE', '+')
      .replace('NEGATIVE', '-')
      .trim()
      .toUpperCase();
  };

  // Safe filtered donors list
  const filteredDonors = useMemo(() => {
    const list = Array.isArray(activeDonors) ? activeDonors : [];
    return list.filter((d) => {
      const fullName = d?.fullName || '';
      const city = d?.city || '';
      const district = d?.district || '';
      const subDivision = d?.subDivision || '';
      const state = d?.state || '';
      const bg = normalizeBG(d?.bloodGroup);

      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subDivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
        district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBlood =
        selectedBloodGroup === 'ALL' || bg === normalizeBG(selectedBloodGroup);

      const matchesState =
        selectedState === 'ALL' || state.toLowerCase() === selectedState.toLowerCase();

      return matchesSearch && matchesBlood && matchesState;
    });
  }, [activeDonors, searchQuery, selectedBloodGroup, selectedState]);

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
        {/* Donor Banner CTA */}
        {!user?.donor && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-5 bg-linear-to-r from-red-600/10 via-rose-600/10 to-transparent border-red-600/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
                  <Heart className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Become a Verified Blood Donor</h4>
                  <p className="text-xs text-muted-foreground">Complete medical clearance to appear in emergency searches across your district.</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/register/donor')}
                className="bg-red-600 hover:bg-red-700 text-white text-xs shrink-0 cursor-pointer"
              >
                Get Verified
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Donors</p>
                <h3 className="text-2xl font-black mt-1">{activeDonors.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-crimson-600 flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ready to Donate</p>
                <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                  {activeDonors.length}
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
                  {normalizeBG(user?.bloodGroup) || 'O+'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Droplet className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-5 bg-card border-border shadow-sm rounded-2xl mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, sub-division, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background"
              />
            </div>

            <div className="sm:col-span-3">
              <Select value={selectedBloodGroup} onValueChange={(val) => setSelectedBloodGroup(val ?? 'ALL')}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="All Blood Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Blood Groups</SelectItem>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Select value={selectedState} onValueChange={(val) => setSelectedState(val ?? 'ALL')}>
                <SelectTrigger className="h-11 bg-background">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All States</SelectItem>
                  {availableStates.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Donors List Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Active Donors ({filteredDonors.length})</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchActiveDonors()} 
            disabled={isLoadingDonors} 
            className="gap-2 text-xs text-muted-foreground cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDonors ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {filteredDonors.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Active Donors Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoadingDonors ? 'Loading live donors...' : 'Try changing your search keywords or resetting the blood group filter.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <motion.div key={donor._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="p-6 bg-card border-border hover:border-red-600/40 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-red-600/10 text-red-600 font-extrabold flex items-center justify-center text-lg border border-red-600/20">
                          {normalizeBG(donor.bloodGroup)}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-tight">{donor.fullName}</h3>
                          <span className="text-xs text-muted-foreground capitalize">{donor.gender?.toLowerCase()}</span>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        <span>
                          {[donor.city, donor.subDivision, donor.district, donor.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{donor.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex gap-2">
                    <Button
                      onClick={() => setSelectedDonor(donor)}
                      className="w-full h-9 bg-linear-to-r from-red-700 to-crimson-600 hover:from-red-800 hover:to-rose-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-crimson-600/20 cursor-pointer border-none"
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

      {/* Modal */}
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
                <h3 className="text-lg font-bold">Contact Blood Donor</h3>
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 cursor-pointer"
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
                  <span className="font-bold text-red-600">{normalizeBG(selectedDonor.bloodGroup)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">Location:</span>
                  <span className="font-medium text-xs text-right">
                    {[selectedDonor.city, selectedDonor.district, selectedDonor.state].filter(Boolean).join(', ')}
                  </span>
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
                <Button onClick={() => setSelectedDonor(null)} className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}