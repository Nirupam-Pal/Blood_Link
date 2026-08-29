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
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useDonorStore } from '@/stores/donor.store';
import { ActiveDonor, BloodGroup, SearchDonorDto } from '@/types/donor.types';
import { Navbar } from '@/components/layout/navbar';

export default function DonorDashboardPage() {
  const router = useRouter();

  // Auth Store Selectors
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  // Donor Store Selectors
  const activeDonors = useDonorStore((state) => state.donors);
  const isLoadingDonors = useDonorStore((state) => state.isLoading);
  const fetchActiveDonors = useDonorStore((state) => state.fetchActiveDonors);
  const searchDonors = useDonorStore((state) => state.searchDonors);

  // Filter form states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('Tripura');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('A+');
  const [districtInput, setDistrictInput] = useState('');
  const [subDivisionInput, setSubDivisionInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<ActiveDonor | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  // Initial load: Fetch all active donors
  useEffect(() => {
    if (!isInitializing && status === 'authenticated') {
      fetchActiveDonors();
    }
  }, [status, isInitializing, fetchActiveDonors]);

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

  // Convert display blood groups back to Enum format for the backend DTO
  const toBackendBloodGroup = (bg: string): BloodGroup => {
    const map: Record<string, BloodGroup> = {
      'A+': 'A_POSITIVE' as BloodGroup,
      'A-': 'A_NEGATIVE' as BloodGroup,
      'B+': 'B_POSITIVE' as BloodGroup,
      'B-': 'B_NEGATIVE' as BloodGroup,
      'O+': 'O_POSITIVE' as BloodGroup,
      'O-': 'O_NEGATIVE' as BloodGroup,
      'AB+': 'AB_POSITIVE' as BloodGroup,
      'AB-': 'AB_NEGATIVE' as BloodGroup,
    };
    return map[bg] || ('A_POSITIVE' as BloodGroup);
  };

  // Handle Backend Filter Search
  const handleFilterSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilterError(null);

    if (!selectedState || selectedState === 'ALL') {
      setFilterError('State is required to search donors.');
      return;
    }

    if (!selectedBloodGroup || selectedBloodGroup === 'ALL') {
      setFilterError('Blood Group is required to search donors.');
      return;
    }

    // Send both variants or send the raw selected value (e.g. "A+")
    const payload: SearchDonorDto = {
      state: selectedState.trim(),
      bloodGroup: selectedBloodGroup as BloodGroup, // Sends "A+" directly
      ...(districtInput.trim() ? { district: districtInput.trim() } : {}),
      ...(subDivisionInput.trim() ? { subDivision: subDivisionInput.trim() } : {}),
      ...(cityInput.trim() ? { city: cityInput.trim() } : {}),
    };

    await searchDonors(payload);
  };

  // Reset filters
  const handleResetFilters = async () => {
    setSelectedState('Tripura');
    setSelectedBloodGroup('ALL');
    setDistrictInput('');
    setSubDivisionInput('');
    setCityInput('');
    setSearchQuery('');
    setFilterError(null);
    await fetchActiveDonors();
  };

  // Client-side search for donor name and location keyword filtering
  const filteredDonors = useMemo(() => {
    const list = Array.isArray(activeDonors) ? activeDonors : [];
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((d) => {
      const fullName = d?.fullName || '';
      const city = d?.city || '';
      const district = d?.district || '';
      const subDivision = d?.subDivision || '';
      const state = d?.state || '';

      return (
        fullName.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query) ||
        subDivision.toLowerCase().includes(query) ||
        district.toLowerCase().includes(query) ||
        state.toLowerCase().includes(query)
      );
    });
  }, [activeDonors, searchQuery]);

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
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Donors</p>
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

        {/* Backend Search & Filter Form Matching SearchDonorDto */}
        <Card className="p-5 bg-card border-border shadow-sm rounded-2xl mb-8">
          <form onSubmit={handleFilterSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. State (Required) */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedState}
                  onValueChange={(val) => setSelectedState(val ?? 'Tripura')}
                >
                  <SelectTrigger className="h-11 bg-background w-full">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tripura">Tripura</SelectItem>
                    <SelectItem value="Assam">Assam</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Blood Group (Required) */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedBloodGroup}
                  onValueChange={(val) => setSelectedBloodGroup(val ?? 'A+')}
                >
                  <SelectTrigger className="h-11 bg-background w-full">
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. District (Optional) */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  District
                </label>
                <Input
                  placeholder="e.g. Sepahijala"
                  value={districtInput}
                  onChange={(e) => setDistrictInput(e.target.value)}
                  className="h-11 bg-background w-full"
                />
              </div>

              {/* 4. Sub-Division (Optional) */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Sub-Division
                </label>
                <Input
                  placeholder="e.g. Sonamura"
                  value={subDivisionInput}
                  onChange={(e) => setSubDivisionInput(e.target.value)}
                  className="h-11 bg-background w-full"
                />
              </div>

              {/* 5. City (Optional) */}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  City
                </label>
                <Input
                  placeholder="e.g. Melaghar"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="h-11 bg-background w-full"
                />
              </div>
            </div>

            {filterError && (
              <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {filterError}
              </p>
            )}

            {/* Bottom Bar: Keyword quick-filter + Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Quick filter loaded donors by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 gap-1.5 text-xs cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoadingDonors}
                  className="h-9 bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 shadow-sm shadow-red-600/20 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Donors
                </Button>
              </div>
            </div>
          </form>
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

        {/* Results Grid */}
        {filteredDonors.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Donors Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoadingDonors ? 'Searching for matching donors...' : 'Try adjusting your state, blood group, or district query.'}
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
                      className="w-full h-9 bg-linear-to-r from-red-700 to-red-950 hover:from-red-800 hover:to-rose-700 text-white text-xs font-semibold gap-1.5 shadow-md shadow-crimson-600/20 cursor-pointer border-none"
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