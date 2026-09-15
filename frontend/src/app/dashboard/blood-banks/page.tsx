'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Droplet,
  RefreshCw,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { BloodBank, BloodGroup } from '@/types/blood-bank.types';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';

const ALL_BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function getInventoryList(bank: BloodBank) {
  return ALL_BLOOD_GROUPS.map((bloodGroup) => ({
    bloodGroup,
    units: bank.inventory?.[bloodGroup]?.units ?? 0,
  }));
}

function getTotalUnits(bank: BloodBank) {
  return getInventoryList(bank).reduce((sum, item) => sum + item.units, 0);
}

export default function FindBloodBanksPage() {
  const router = useRouter();

  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const bloodBanks = useBloodBankStore((state) => state.bloodBanks);
  const isSearching = useBloodBankStore((state) => state.isSearching);
  const storeError = useBloodBankStore((state) => state.error);
  const clearError = useBloodBankStore((state) => state.clearError);
  const fetchAllBloodBanks = useBloodBankStore((state) => state.fetchAllBloodBanks);
  const searchBloodBanks = useBloodBankStore((state) => state.searchBloodBanks);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('Tripura');
  const [districtInput, setDistrictInput] = useState('');
  const [subDivisionInput, setSubDivisionInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  // Initial load: fetch every registered blood bank
  useEffect(() => {
    if (!isInitializing && status === 'authenticated') {
      fetchAllBloodBanks();
    }
  }, [status, isInitializing, fetchAllBloodBanks]);

  const handleFilterSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFilterError(null);

    if (!selectedState || selectedState === 'ALL') {
      setFilterError('State is required to search blood banks.');
      return;
    }

    await searchBloodBanks({
      state: selectedState.trim(),
      ...(districtInput.trim() ? { district: districtInput.trim() } : {}),
      ...(subDivisionInput.trim() ? { subDivision: subDivisionInput.trim() } : {}),
      ...(cityInput.trim() ? { city: cityInput.trim() } : {}),
    });
  };

  const handleResetFilters = async () => {
    setSelectedState('Tripura');
    setDistrictInput('');
    setSubDivisionInput('');
    setCityInput('');
    setSearchQuery('');
    setFilterError(null);
    await fetchAllBloodBanks();
  };

  // Client-side keyword filter on top of whatever the backend returned
  const filteredBanks = useMemo(() => {
    const list = Array.isArray(bloodBanks) ? bloodBanks : [];
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((bank) => {
      return (
        bank.bloodBankName?.toLowerCase().includes(query) ||
        bank.city?.toLowerCase().includes(query) ||
        bank.subDivision?.toLowerCase().includes(query) ||
        bank.district?.toLowerCase().includes(query) ||
        bank.state?.toLowerCase().includes(query)
      );
    });
  }, [bloodBanks, searchQuery]);

  if (isInitializing || status === 'idle') {
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="h-10 w-10 text-red-600 animate-bounce" />
          <p className="text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground flex flex-col overflow-hidden">
      <AmbientOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto mt-18 px-4 sm:px-6 lg:px-8 py-8">
        {storeError && (
          <div className="p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{storeError}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError} className="text-xs h-7 px-2">
              Dismiss
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registered Blood Banks</p>
                <h3 className="text-2xl font-black mt-1">{bloodBanks.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Filtered Matches</p>
                <h3 className="text-2xl font-black mt-1 text-crimson-600">{filteredBanks.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-crimson-600/10 text-crimson-600 flex items-center justify-center">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Units Available</p>
                <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                  {filteredBanks.reduce((sum, bank) => sum + getTotalUnits(bank), 0)}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter Form Matching SearchBloodBankDto */}
        <Card className="p-5 bg-card border-border shadow-sm rounded-2xl mb-8">
          <form onSubmit={handleFilterSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  State <span className="text-red-500">*</span>
                </label>
                <Select value={selectedState} onValueChange={(val) => setSelectedState(val ?? 'Tripura')}>
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

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Quick filter loaded blood banks by name or location..."
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
                  disabled={isSearching}
                  className="h-9 bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5 cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Blood Banks
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Blood Banks ({filteredBanks.length})</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchAllBloodBanks()}
            disabled={isSearching}
            className="gap-2 text-xs text-muted-foreground cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Results Grid */}
        {filteredBanks.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Blood Banks Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isSearching ? 'Searching for matching blood banks...' : 'Try adjusting your state, district, or city query.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBanks.map((bank) => {
              const totalUnits = getTotalUnits(bank);
              const criticalShortages = getInventoryList(bank).filter((i) => i.units < 5).length;

              return (
                <motion.div key={bank._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Card className="p-6 bg-card border-border hover:border-red-600/40 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-600/20">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-foreground leading-tight">{bank.bloodBankName}</h3>
                            <span className="text-xs text-muted-foreground">Lic. {bank.licenseNumber}</span>
                          </div>
                        </div>
                        <Badge
                          className={
                            bank.emailVerified
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] flex items-center gap-1'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] flex items-center gap-1'
                          }
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {bank.emailVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-600 shrink-0" />
                          <span>
                            {[bank.city, bank.subDivision, bank.district, bank.state].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 mb-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Available Units</p>
                          <p className="text-xl font-black">{totalUnits} Bags</p>
                        </div>
                        {criticalShortages > 0 && (
                          <Badge variant="destructive" className="text-[10px]">
                            {criticalShortages} Low
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex gap-2">
                      <Button
                        onClick={() => setSelectedBank(bank)}
                        className="w-full h-9 bg-linear-to-r from-red-700 to-red-950 hover:from-red-800 hover:to-rose-700 text-white text-xs font-semibold gap-1.5 cursor-pointer border-none"
                      >
                        <Droplet className="h-3.5 w-3.5" />
                        View Inventory & Contact
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedBank && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-lg font-bold">{selectedBank.bloodBankName}</h3>
                <button
                  onClick={() => setSelectedBank(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Contact Details */}
                <div className="space-y-2 text-sm">
                  <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Address
                    </span>
                    <span className="font-medium text-xs text-right max-w-[60%]">
                      {[selectedBank.address, selectedBank.city, selectedBank.district, selectedBank.state, selectedBank.pinCode]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </span>
                    <a href={`tel:${selectedBank.phoneNumber}`} className="font-bold text-foreground hover:underline text-xs">
                      {selectedBank.phoneNumber}
                    </a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/60 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                    <a href={`mailto:${selectedBank.email}`} className="font-medium text-foreground hover:underline text-xs truncate max-w-[60%]">
                      {selectedBank.email}
                    </a>
                  </div>
                </div>

                {/* Inventory Breakdown */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Blood Group Availability
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {getInventoryList(selectedBank).map((item) => {
                      const isLow = item.units < 5;
                      return (
                        <div
                          key={item.bloodGroup}
                          className="p-3 rounded-xl bg-muted/50 border border-border flex flex-col items-center justify-center gap-1"
                        >
                          <span className="text-xs font-bold text-red-600">{item.bloodGroup}</span>
                          <span className="text-lg font-black">{item.units}</span>
                          <Badge
                            variant={isLow ? 'destructive' : 'default'}
                            className={
                              !isLow
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0'
                                : 'text-[9px] px-1.5 py-0'
                            }
                          >
                            {isLow ? 'Low' : 'OK'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedBank(null)} className="w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer">
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
