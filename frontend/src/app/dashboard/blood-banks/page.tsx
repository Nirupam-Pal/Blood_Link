'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, Layers, MapPin, Phone, Mail, RefreshCw, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/app-shell';
import {
  CardGridSkeleton,
  EmptyState,
  FieldLabel,
  Notice,
  PageHeader,
  PageLoader,
  Panel,
  StatCard,
  StatusBadge,
} from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { BloodBank, BloodGroup } from '@/types/blood-bank.types';
import { cn } from '@/lib/utils';

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
    return <PageLoader label="Authenticating session" />;
  }

  return (
    <AppShell>
      <PageHeader
        icon={Building2}
        title={<>Blood <span className="text-gradient-brand">banks</span></>}
        description="Check live stock at licensed facilities near you while you look for donors."
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchAllBloodBanks()} disabled={isSearching}>
            <RefreshCw className={`h-3.5 w-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {storeError && (
        <Notice tone="brand" onDismiss={clearError} className="mb-6">
          {storeError}
        </Notice>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard value={bloodBanks.length} label="Registered blood banks" icon={Building2} />
        <StatCard value={filteredBanks.length} label="Filtered matches" icon={Search} tone="text-brand" />
        <StatCard
          value={filteredBanks.reduce((sum, bank) => sum + getTotalUnits(bank), 0)}
          label="Total units available"
          icon={Layers}
          tone="text-success"
        />
      </div>

      {/* Search & Filter Form Matching SearchBloodBankDto */}
      <Panel className="mb-10 p-5 sm:p-6">
        <form onSubmit={handleFilterSearch} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <FieldLabel required>State</FieldLabel>
              <Select value={selectedState} onValueChange={(val) => setSelectedState(val ?? 'Tripura')}>
                <SelectTrigger className="w-full">
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
              <FieldLabel htmlFor="bb-district">District</FieldLabel>
              <Input id="bb-district" placeholder="e.g. Sepahijala" value={districtInput} onChange={(e) => setDistrictInput(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="bb-subdivision">Sub-division</FieldLabel>
              <Input id="bb-subdivision" placeholder="e.g. Sonamura" value={subDivisionInput} onChange={(e) => setSubDivisionInput(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="bb-city">City</FieldLabel>
              <Input id="bb-city" placeholder="e.g. Melaghar" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
            </div>
          </div>

          {filterError && <Notice tone="brand">{filterError}</Notice>}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-5">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Quick filter loaded blood banks by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Quick filter blood banks"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleResetFilters}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" variant="brand" disabled={isSearching}>
                <Search className="h-4 w-4" />
                Search blood banks
              </Button>
            </div>
          </div>
        </form>
      </Panel>

      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Blood banks</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">{filteredBanks.length}</span>
      </div>

      {filteredBanks.length === 0 ? (
        isSearching ? (
          <CardGridSkeleton count={4} className="xl:grid-cols-2" />
        ) : (
          <Panel>
            <EmptyState icon={Building2} title="No blood banks found" description="Try adjusting your state, district, or city query." />
          </Panel>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBanks.map((bank, i) => {
            const totalUnits = getTotalUnits(bank);
            const inventory = getInventoryList(bank);
            const criticalShortages = inventory.filter((item) => item.units < 5).length;

            return (
              <motion.div
                key={bank._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
                className="group rounded-3xl bg-surface p-1.5 shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="flex h-full flex-col rounded-[1.1rem] bg-background p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{bank.bloodBankName}</h3>
                        <p className="text-xs text-muted-foreground">Lic. {bank.licenseNumber}</p>
                      </div>
                    </div>
                    <StatusBadge tone={bank.emailVerified ? 'success' : 'warning'}>{bank.emailVerified ? 'Verified' : 'Pending'}</StatusBadge>
                  </div>

                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{[bank.city, bank.subDivision, bank.district, bank.state].filter(Boolean).join(', ')}</span>
                  </p>

                  {/* Mini stock strip */}
                  <div className="mt-4 grid grid-cols-8 gap-1.5">
                    {inventory.map((item) => (
                      <div
                        key={item.bloodGroup}
                        className={cn('rounded-lg py-1.5 text-center', item.units < 5 ? 'bg-brand-soft text-brand' : 'bg-muted')}
                        title={`${item.bloodGroup}: ${item.units} units`}
                      >
                        <p className="text-[10px] font-medium opacity-70">{item.bloodGroup}</p>
                        <p className="text-sm font-semibold tabular-nums">{item.units}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="text-sm">
                      <span className="text-xl font-semibold tabular-nums">{totalUnits}</span>
                      <span className="text-muted-foreground"> bags available</span>
                      {criticalShortages > 0 && <span className="ml-2 text-xs font-medium text-brand">{criticalShortages} low</span>}
                    </p>
                    <Button size="sm" onClick={() => setSelectedBank(bank)}>
                      View & contact
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details dialog */}
      <AnimatePresence>
        {selectedBank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBank(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="bank-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background shadow-float"
            >
              <div className="flex items-start justify-between gap-4 px-6 pt-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 id="bank-title" className="truncate text-lg font-bold">{selectedBank.bloodBankName}</h3>
                    <p className="text-xs text-muted-foreground">Lic. {selectedBank.licenseNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBank(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <dl className="divide-y divide-border rounded-2xl bg-surface px-4 text-sm">
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground shrink-0"><MapPin className="h-3.5 w-3.5" />Address</dt>
                    <dd className="text-right font-medium">
                      {[selectedBank.address, selectedBank.city, selectedBank.district, selectedBank.state, selectedBank.pinCode]
                        .filter(Boolean)
                        .join(', ')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-3.5 w-3.5" />Phone</dt>
                    <dd>
                      <a href={`tel:${selectedBank.phoneNumber}`} className="font-semibold hover:text-brand">{selectedBank.phoneNumber}</a>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground shrink-0"><Mail className="h-3.5 w-3.5" />Email</dt>
                    <dd className="min-w-0">
                      <a href={`mailto:${selectedBank.email}`} className="block truncate font-medium hover:text-brand">{selectedBank.email}</a>
                    </dd>
                  </div>
                </dl>

                {/* Inventory Breakdown */}
                <div>
                  <p className="mb-3 text-sm font-semibold">Blood group availability</p>
                  <div className="grid grid-cols-4 gap-2">
                    {getInventoryList(selectedBank).map((item) => {
                      const isLow = item.units < 5;
                      return (
                        <div key={item.bloodGroup} className={cn('rounded-xl p-3 text-center shadow-card', isLow ? 'bg-brand-soft' : 'bg-card')}>
                          <p className="text-xs font-medium text-muted-foreground">{item.bloodGroup}</p>
                          <p className={cn('mt-0.5 text-xl font-semibold tabular-nums', isLow && 'text-brand')}>{item.units}</p>
                          <p className={cn('text-[10px] font-medium', isLow ? 'text-brand' : 'text-success')}>{isLow ? 'Low' : 'OK'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setSelectedBank(null)}>
                    Close
                  </Button>
                  <a href={`tel:${selectedBank.phoneNumber}`}>
                    <Button variant="brand" className="w-full">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
