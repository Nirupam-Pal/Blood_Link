'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Search,
  SearchX,
  MapPin,
  Mail,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  RotateCcw,
  X,
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Eye,
  Users,
  Droplet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BloodBadge,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/app-shell';
import { useAuthStore } from '@/stores/auth.store';
import { useDonorStore } from '@/stores/donor.store';
import { useConnectionStore } from '@/stores/connection.store';
import { getCurrentUserId, refId } from '@/lib/format';
import { ActiveDonor, BloodGroup, SearchDonorDto } from '@/types/donor.types';
import { cn } from '@/lib/utils';

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

  // Connection Store Selectors
  const sentRequests = useConnectionStore((state) => state.sentRequests);
  const connections = useConnectionStore((state) => state.connections);
  const isSendingRequest = useConnectionStore((state) => state.isSubmitting);
  const fetchSentAndConnections = useConnectionStore((state) => state.fetchSentAndConnections);
  const sendConnectionRequest = useConnectionStore((state) => state.sendRequest);

  // Filter form states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('Tripura');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('A+');
  const [districtInput, setDistrictInput] = useState('');
  const [subDivisionInput, setSubDivisionInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<ActiveDonor | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [isVerificationBannerVisible, setIsVerificationBannerVisible] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

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

  // Load existing requests/connections so the contact modal knows the current state
  useEffect(() => {
    if (!isInitializing && status === 'authenticated' && user?.role === 'USER') {
      fetchSentAndConnections();
    }
  }, [status, isInitializing, user?.role, fetchSentAndConnections]);

  // Relationship between the signed-in user and a donor
  const getConnectionState = (donorId: string): 'self' | 'connected' | 'pending' | 'none' => {
    if (donorId === getCurrentUserId()) return 'self';
    if (connections.some((c) => refId(c.donorId) === donorId || refId(c.userId) === donorId)) return 'connected';
    if (sentRequests.some((r) => r.status === 'PENDING' && refId(r.receiverId) === donorId)) return 'pending';
    return 'none';
  };

  const openContactModal = (donor: ActiveDonor) => {
    setSelectedDonor(donor);
    setRequestMessage('');
    setRequestError(null);
    setRequestSent(false);
  };

  const handleSendRequest = async () => {
    if (!selectedDonor) return;
    setRequestError(null);
    try {
      await sendConnectionRequest({
        donorId: selectedDonor._id,
        ...(requestMessage.trim() ? { message: requestMessage.trim() } : {}),
      });
      setRequestSent(true);
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : 'Failed to send request');
    }
  };

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
    return <PageLoader label="Authenticating session" />;
  }

  const isSeeker = user?.role === 'USER';
  const modalState = selectedDonor ? getConnectionState(selectedDonor._id) : 'none';

  return (
    <AppShell>
      <PageHeader
        icon={Search}
        title={<>Find a <span className="text-gradient-brand">donor</span></>}
        description="Search verified, medically screened donors near the hospital and send a connection request."
        actions={
          <Button variant="outline" size="sm" onClick={() => fetchActiveDonors()} disabled={isLoadingDonors}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDonors ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Donor Banner CTA */}
      <AnimatePresence>
        {isVerificationBannerVisible && !user?.donor && user?.role === 'USER' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8 overflow-hidden"
          >
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-red-800 p-5 pr-12 text-white shadow-lg shadow-red-500/20">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/25" />
              <div className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rounded-full border border-white/25" />
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setIsVerificationBannerVisible(false)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                    <Heart className="h-5 w-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Become a verified blood donor</h4>
                    <p className="text-sm text-white/85">Complete medical clearance to appear in emergency searches across your district.</p>
                  </div>
                </div>
                <Button onClick={() => router.push('/register/donor')} className="bg-white text-neutral-900 hover:bg-white/90 shrink-0">
                  Get verified
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={activeDonors.length} label="Total donors" icon={Users} />
        <StatCard value={activeDonors.length} label="Ready to donate" icon={ShieldCheck} tone="text-success" />
        <StatCard value={filteredDonors.length} label="Filtered matches" icon={Search} tone="text-brand" />
        <StatCard value={normalizeBG(user?.bloodGroup) || 'O+'} label="Your blood group" icon={Droplet} />
      </div>

      {/* Backend Search & Filter Form Matching SearchDonorDto */}
      <Panel className="mb-10 p-5 sm:p-6">
        <form onSubmit={handleFilterSearch} className="space-y-5">
          <div>
            <FieldLabel required>Blood group</FieldLabel>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Blood group">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => {
                const isActive = selectedBloodGroup === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelectedBloodGroup(bg)}
                    className={cn(
                      'relative h-9 min-w-12 rounded-full px-3.5 text-sm font-semibold cursor-pointer transition-colors',
                      isActive ? 'text-white' : 'bg-muted text-foreground hover:bg-muted/70'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="bg-pill"
                        className="absolute inset-0 rounded-full bg-linear-to-b from-red-500 to-red-600 shadow-md shadow-red-500/30"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative">{bg}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. State (Required) */}
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
            {/* 3. District (Optional) */}
            <div>
              <FieldLabel htmlFor="district">District</FieldLabel>
              <Input id="district" placeholder="e.g. Sepahijala" value={districtInput} onChange={(e) => setDistrictInput(e.target.value)} />
            </div>
            {/* 4. Sub-Division (Optional) */}
            <div>
              <FieldLabel htmlFor="subDivision">Sub-division</FieldLabel>
              <Input id="subDivision" placeholder="e.g. Sonamura" value={subDivisionInput} onChange={(e) => setSubDivisionInput(e.target.value)} />
            </div>
            {/* 5. City (Optional) */}
            <div>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input id="city" placeholder="e.g. Melaghar" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
            </div>
          </div>

          {filterError && <Notice tone="brand">{filterError}</Notice>}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-5">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Quick filter loaded donors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Quick filter donors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={handleResetFilters}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button type="submit" variant="brand" disabled={isLoadingDonors}>
                {isLoadingDonors ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search donors
              </Button>
            </div>
          </div>
        </form>
      </Panel>

      {/* Results */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-semibold">Active donors</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">{filteredDonors.length}</span>
      </div>

      {filteredDonors.length === 0 ? (
        isLoadingDonors ? (
          <CardGridSkeleton count={6} />
        ) : (
          <Panel>
            <EmptyState
              icon={SearchX}
              title="No donors found"
              description="Try adjusting your state, blood group, or district query."
              action={
                <Button variant="outline" onClick={handleResetFilters}>
                  <RotateCcw className="h-4 w-4" />
                  Reset filters
                </Button>
              }
            />
          </Panel>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDonors.map((donor, i) => {
            const cta = isSeeker ? CONNECTION_CTA[getConnectionState(donor._id)] : VIEW_CTA;
            const CtaIcon = cta.icon;
            return (
              <motion.div
                key={donor._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="group rounded-3xl bg-surface p-1.5 shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="flex h-full flex-col rounded-[1.1rem] bg-background p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <BloodBadge group={normalizeBG(donor.bloodGroup)} />
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-foreground">{donor.fullName}</h3>
                        <p className="text-xs capitalize text-muted-foreground">{donor.gender?.toLowerCase()}</p>
                      </div>
                    </div>
                    <StatusBadge tone="success" live>Active</StatusBadge>
                  </div>

                  <div className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{[donor.city, donor.subDivision, donor.district, donor.state].filter(Boolean).join(', ')}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{donor.email}</span>
                    </p>
                  </div>

                  <Button onClick={() => openContactModal(donor)} variant={cta.variant} className={cn('mt-5 w-full', cta.className)}>
                    <CtaIcon className="h-4 w-4" />
                    {cta.label}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Contact dialog */}
      <AnimatePresence>
        {selectedDonor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDonor(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="contact-donor-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background shadow-float"
            >
              <div className="relative overflow-hidden bg-linear-to-b from-red-50 to-background px-6 pt-6 pb-5 dark:from-red-950/30">
                <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-60" />
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-card hover:text-foreground cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative flex items-center gap-4">
                  <BloodBadge group={normalizeBG(selectedDonor.bloodGroup)} size="lg" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Contact blood donor</p>
                    <h3 id="contact-donor-title" className="truncate text-xl font-bold">{selectedDonor.fullName}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified active donor
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6">
                <dl className="divide-y divide-border rounded-2xl bg-surface px-4 text-sm">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-muted-foreground">Blood group</dt>
                    <dd className="font-semibold text-brand">{normalizeBG(selectedDonor.bloodGroup)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-muted-foreground shrink-0">Location</dt>
                    <dd className="text-right font-medium">
                      {[selectedDonor.city, selectedDonor.district, selectedDonor.state].filter(Boolean).join(', ')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-muted-foreground shrink-0">Email</dt>
                    <dd className="min-w-0">
                      <a href={`mailto:${selectedDonor.email}`} className="block truncate font-medium hover:text-brand">
                        {selectedDonor.email}
                      </a>
                    </dd>
                  </div>
                </dl>

                {/* Connection Request */}
                {user?.role === 'USER' && modalState !== 'self' && (
                  <div className="mt-5">
                    {!requestSent && modalState === 'connected' && (
                      <div className="flex items-center justify-between gap-3 rounded-2xl bg-success-soft p-4">
                        <span className="flex items-center gap-2 text-sm font-medium text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          You are connected with this donor
                        </span>
                        <Button size="sm" onClick={() => router.push('/connections?tab=connected')}>
                          <MessageSquare className="h-3.5 w-3.5" />
                          Chat
                        </Button>
                      </div>
                    )}

                    {(requestSent || modalState === 'pending') && (
                      <motion.div
                        initial={requestSent ? { opacity: 0, scale: 0.97 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-warning-soft p-4"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-warning">
                          <Clock className="h-4 w-4 shrink-0" />
                          {requestSent ? 'Request sent! Waiting for the donor to respond.' : 'Connection request pending'}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => router.push('/connections?tab=sent')}>
                          View
                        </Button>
                      </motion.div>
                    )}

                    {!requestSent && modalState === 'none' && (
                      <div className="space-y-3">
                        <FieldLabel htmlFor="request-message" hint={<span className="tabular-nums">{requestMessage.length}/500</span>}>
                          Request to connect
                        </FieldLabel>
                        <textarea
                          id="request-message"
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value.slice(0, 500))}
                          rows={3}
                          placeholder="Add a short note, e.g. patient details, hospital and urgency (optional)"
                          className="w-full resize-none rounded-lg border border-transparent bg-muted px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/15"
                        />
                        {requestError && <Notice tone="brand">{requestError}</Notice>}
                        <Button variant="brand" size="lg" onClick={handleSendRequest} disabled={isSendingRequest} className="w-full">
                          {isSendingRequest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          Send connection request
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="outline" onClick={() => setSelectedDonor(null)} className="mt-3 w-full">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

type CardCta = { label: string; icon: typeof Send; variant: 'default' | 'brand' | 'outline' | 'secondary'; className?: string };

// Accounts that can't send requests just view the donor's details.
const VIEW_CTA: CardCta = { label: 'View details', icon: Eye, variant: 'default' };

// Card call-to-action per relationship with the donor (all open the contact dialog).
const CONNECTION_CTA: Record<'self' | 'connected' | 'pending' | 'none', CardCta> = {
  none: { label: 'Send request', icon: Send, variant: 'default' },
  pending: { label: 'Request pending', icon: Clock, variant: 'secondary', className: 'bg-warning-soft text-warning hover:bg-warning-soft/70' },
  connected: { label: 'Connected · Message', icon: CheckCircle2, variant: 'secondary', className: 'bg-success-soft text-success hover:bg-success-soft/70' },
  self: { label: 'This is you', icon: UserCheck, variant: 'secondary' },
};
