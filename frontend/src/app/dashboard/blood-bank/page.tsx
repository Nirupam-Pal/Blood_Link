'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Save, RefreshCw, CheckCircle2, Droplets, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { BloodBadge, Notice, PageHeader, PageLoader, StatCard, StatusBadge } from '@/components/ui/state-views';
import { BloodGroup } from '@/types/blood-bank.types';
import { cn } from '@/lib/utils';

interface InventoryStock {
  bloodGroup: BloodGroup;
  units: number;
}

const DEFAULT_INVENTORY: InventoryStock[] = [
  { bloodGroup: 'A+' as BloodGroup, units: 0 },
  { bloodGroup: 'A-' as BloodGroup, units: 0 },
  { bloodGroup: 'B+' as BloodGroup, units: 0 },
  { bloodGroup: 'B-' as BloodGroup, units: 0 },
  { bloodGroup: 'O+' as BloodGroup, units: 0 },
  { bloodGroup: 'O-' as BloodGroup, units: 0 },
  { bloodGroup: 'AB+' as BloodGroup, units: 0 },
  { bloodGroup: 'AB-' as BloodGroup, units: 0 },
];

const mapToInventoryStock = (
  inventory: Record<string, number | { units: number }>
): InventoryStock[] =>
  DEFAULT_INVENTORY.map((defaultItem) => {
    const existing = inventory[defaultItem.bloodGroup];
    return {
      bloodGroup: defaultItem.bloodGroup,
      units: typeof existing === 'number' ? existing : existing?.units ?? 0,
    };
  });

// Visual scale for the stock gauge — a group at or above this reads as "full".
const GAUGE_MAX = 40;

export default function BloodBankDashboardPage() {
  const router = useRouter();
  const { user, status, isInitializing } = useAuthStore();

  const {
    currentBloodBank,
    setCurrentBloodBank,
    updateInventoryBatch,
    isUpdatingInventory,
    error: storeError,
    clearError
  } = useBloodBankStore();

  const [inventory, setInventory] = useState<InventoryStock[]>(DEFAULT_INVENTORY);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const hasHydratedRef = useRef(false);

  // Auth Guard
  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  // Keep Store state synced with Auth user if available
  useEffect(() => {
    if (user && !currentBloodBank) {
      setCurrentBloodBank(user as any);
    }
  }, [user, currentBloodBank, setCurrentBloodBank]);

  // Hydrate local editable state from server data ONCE. After that, saves
  // update local state directly (see handleSaveInventory) — re-running this
  // on every currentBloodBank/user change would clobber in-progress edits
  // whenever those objects update for unrelated reasons (token refresh, etc).
  useEffect(() => {
    if (hasHydratedRef.current) return;
    const activeBank = currentBloodBank || (user as any);
    if (activeBank?.inventory) {
      setInventory(mapToInventoryStock(activeBank.inventory));
      hasHydratedRef.current = true;
    }
  }, [currentBloodBank, user]);

  const handleStockChange = (bloodGroup: BloodGroup, delta: number) => {
    if (localError || storeError) {
      setLocalError(null);
      clearError();
    }

    setInventory((prev) =>
      prev.map((item) =>
        item.bloodGroup === bloodGroup
          ? { ...item, units: Math.max(0, item.units + delta) }
          : item
      )
    );
    setSavedSuccess(false);
  };

  const handleSaveInventory = async () => {
  setLocalError(null);
  clearError();

  try {
    // Map array to match UpdateInventoryItemDto
    const items = inventory.map((item) => ({
      bloodGroup: item.bloodGroup,
      units: Number(item.units),
    }));

    // Send payload matching BatchUpdateInventoryDto: { items: [...] }
    // (updateInventoryBatch already writes the returned bank into the store)
    const response = await updateInventoryBatch({ items });

    if (response?.data?.inventory) {
      setInventory(mapToInventoryStock(response.data.inventory));
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  } catch (err: any) {
    setLocalError(err?.message || 'Failed to save inventory update.');
  }
};

  const totalUnits = inventory.reduce((acc, curr) => acc + curr.units, 0);
  const criticalShortages = inventory.filter((item) => item.units < 5).length;
  const isVerified = (user as any)?.isVerified ?? (currentBloodBank as any)?.isVerified ?? false;

  if (isInitializing || status === 'idle') {
    return <PageLoader label="Initializing dashboard" />;
  }

  const saveButton = (
    <Button variant="brand" onClick={handleSaveInventory} disabled={isUpdatingInventory}>
      {isUpdatingInventory ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          Syncing inventory...
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          Save all changes
        </>
      )}
    </Button>
  );

  return (
    <AppShell>
      {/* Progress bar while a save is in flight */}
      <AnimatePresence>
        {isUpdatingInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden bg-brand-soft"
          >
            <div className="absolute inset-y-0 w-1/3 rounded-full bg-brand loader-slide" />
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        icon={Droplets}
        title={<>Live blood <span className="text-gradient-brand">inventory</span></>}
        description="Update real-time stock units so patients and emergency donors can discover available reserves."
        actions={
          <>
            <AnimatePresence>
              {savedSuccess && (
                <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <StatusBadge tone="success">
                    <CheckCircle2 className="h-3 w-3" />
                    Inventory synced
                  </StatusBadge>
                </motion.span>
              )}
            </AnimatePresence>
            {saveButton}
          </>
        }
      />

      {(localError || storeError) && (
        <Notice
          tone="brand"
          className="mb-6"
          onDismiss={() => {
            setLocalError(null);
            clearError();
          }}
        >
          {localError || storeError}
        </Notice>
      )}

      <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard value={`${totalUnits} bags`} label="Total units available" icon={Layers} />
        <StatCard
          value={`${criticalShortages} groups`}
          label="Critical shortages (< 5 units)"
          icon={AlertTriangle}
          tone={criticalShortages > 0 ? 'text-brand' : 'text-success'}
        />
        <div className="relative overflow-hidden rounded-2xl bg-card p-5 shadow-card">
          <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-70" />
          <div className="relative flex items-start justify-between">
            <StatusBadge tone={isVerified ? 'success' : 'warning'} live={!isVerified} className="h-8 px-3 text-sm">
              {isVerified ? 'Verified' : 'Pending approval'}
            </StatusBadge>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="relative mt-2 text-sm text-muted-foreground">Verification status</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Stock by blood group</h2>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-brand" /> Below 5 units
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item, i) => {
          const isLow = item.units < 5;
          const fill = Math.min(100, (item.units / GAUGE_MAX) * 100);

          return (
            <motion.div
              key={item.bloodGroup}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-3xl bg-surface p-1.5 shadow-card"
            >
              <div className="flex h-full flex-col rounded-[1.1rem] bg-background p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <BloodBadge group={item.bloodGroup} size="sm" />
                  <StatusBadge tone={isLow ? 'brand' : 'success'}>{isLow ? 'Low' : 'In stock'}</StatusBadge>
                </div>

                <div className="my-5 text-center">
                  <motion.p
                    key={item.units}
                    initial={{ scale: 1.25, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className={cn('text-4xl font-bold tabular-nums', isLow && 'text-brand')}
                  >
                    {item.units}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">Available units</p>
                </div>

                {/* Level bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <motion.div
                    className={cn('h-full rounded-full', isLow ? 'bg-brand' : 'bg-linear-to-r from-emerald-500 to-emerald-400')}
                    initial={false}
                    animate={{ width: `${fill}%` }}
                    transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockChange(item.bloodGroup, -1)}
                    disabled={item.units === 0}
                    aria-label={`Remove one unit of ${item.bloodGroup}`}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStockChange(item.bloodGroup, 1)}
                    aria-label={`Add one unit of ${item.bloodGroup}`}
                    className="bg-brand-soft text-brand hover:bg-brand hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-surface p-4">
        <p className="text-sm text-muted-foreground">Changes stay local until you save them.</p>
        {saveButton}
      </div>
    </AppShell>
  );
}
