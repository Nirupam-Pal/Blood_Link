'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Plus,
  Minus,
  Save,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';
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
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-red-600/30 blur-xl animate-pulse" />
            <div className="relative h-16 w-16 rounded-full border border-red-500/30 bg-card backdrop-blur-xl flex items-center justify-center">
              <Droplet className="h-7 w-7 text-red-500 animate-bounce" />
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Initializing Dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground overflow-hidden">
      <AmbientOrbs />

      <Navbar />

      {/* HUD scan-line that sweeps across the top while a save is in flight */}
      <AnimatePresence>
        {isUpdatingInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 h-[2px] overflow-hidden"
          >
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_2px_rgba(255,30,64,0.8)]"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex-1 max-w-7xl w-full mt-18 mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Eyebrow / System status */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-4"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live Inventory Feed — Online
        </motion.div>

        <AnimatePresence>
          {(localError || storeError) && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl text-red-600 dark:text-red-300 text-sm flex items-center justify-between dark:shadow-[0_0_25px_rgba(255,30,64,0.15)] overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{localError || storeError}</span>
              </div>
              <button
                onClick={() => {
                  setLocalError(null);
                  clearError();
                }}
                className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-red-500/70 hover:text-red-600 dark:text-red-300/70 dark:hover:text-red-200 hover:bg-red-500/10 transition-colors cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stat metrics */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <StatCard
            icon={Layers}
            label="Total Units Available"
            value={`${totalUnits} Bags`}
            hue="red"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical Shortages (<5 units)"
            value={`${criticalShortages} Groups`}
            hue={criticalShortages > 0 ? 'amber' : 'emerald'}
          />
          <StatCard
            icon={ShieldCheck}
            label="Verification Status"
            value={isVerified ? 'Verified' : 'Pending Approval'}
            hue="emerald"
          />
        </motion.div>

        {/* Section header + Save CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Live Blood Inventory Management
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update real-time stock units so patients and emergency donors can discover available reserves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {savedSuccess && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Inventory Synced
                </motion.span>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleSaveInventory}
              disabled={isUpdatingInventory}
              whileHover={!isUpdatingInventory ? { scale: 1.03 } : undefined}
              whileTap={!isUpdatingInventory ? { scale: 0.96 } : undefined}
              className={cn(
                'relative overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white',
                'bg-gradient-to-r from-red-700 via-red-600 to-rose-600',
                'disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors duration-300'
              )}
            >
              {!isUpdatingInventory && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  initial={{ x: '-120%' }}
                  animate={{ x: '120%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                {isUpdatingInventory ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Syncing Inventory...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Inventory grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          style={{ perspective: 1200 }}
        >
          {inventory.map((item) => {
            const isLow = item.units < 5;

            return (
              <motion.div
                key={item.bloodGroup}
                layout
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ y: -6, rotateX: 4, rotateY: -4, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
                className={cn(
                  'group relative rounded-2xl border backdrop-blur-xl p-6 flex flex-col justify-between',
                  'bg-card shadow-sm dark:shadow-2xl transition-colors duration-300',
                  isLow
                    ? 'border-red-500/20 hover:border-red-500/50 dark:hover:shadow-[0_0_30px_rgba(255,30,64,0.25)]'
                    : 'border-border hover:border-emerald-400/40 dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.18)]'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative h-12 w-12 shrink-0">
                      <div className="absolute inset-0 rounded-2xl bg-red-600/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-12 w-12 rounded-2xl bg-red-600/10 border border-red-500/30 text-red-600 dark:text-red-400 font-black text-xl flex items-center justify-center">
                        {item.bloodGroup}
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border',
                        isLow
                          ? 'text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10 dark:shadow-[0_0_12px_rgba(255,30,64,0.25)]'
                          : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      )}
                    >
                      {isLow ? 'Critical Low' : 'In Stock'}
                    </span>
                  </div>

                  <div className="text-center my-4">
                    <motion.span
                      key={item.units}
                      initial={{ scale: 1.35, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="text-4xl font-black inline-block bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent"
                    >
                      {item.units}
                    </motion.span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mt-1">
                      Available Units
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleStockChange(item.bloodGroup, -1)}
                    disabled={item.units === 0}
                    className="h-9 w-9 rounded-lg border border-border bg-muted/50 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleStockChange(item.bloodGroup, 1)}
                    className="h-9 w-9 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Presentational helpers — purely visual, no state or business logic.    */
/* ---------------------------------------------------------------------- */

const HUE_STYLES: Record<
  'red' | 'amber' | 'emerald' | 'cyan',
  { glow: string; ring: string; bg: string; text: string; hover: string }
> = {
  red: {
    glow: 'bg-red-600/40',
    ring: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
    hover: 'hover:border-red-500/40 dark:hover:shadow-[0_0_30px_rgba(255,30,64,0.15)]',
  },
  amber: {
    glow: 'bg-amber-500/40',
    ring: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:border-amber-500/40 dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  },
  emerald: {
    glow: 'bg-emerald-500/40',
    ring: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:border-emerald-500/40 dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  },
  cyan: {
    glow: 'bg-cyan-500/40',
    ring: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    hover: 'hover:border-cyan-500/40 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  hue,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hue: keyof typeof HUE_STYLES;
}) {
  const styles = HUE_STYLES[hue];

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
      <div
        className={cn(
          'relative rounded-2xl border border-border bg-card backdrop-blur-xl shadow-sm dark:shadow-2xl p-5',
          'transition-all duration-300',
          styles.hover
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-black mt-1.5 tracking-tight">{value}</h3>
          </div>

          <div className="relative h-12 w-12 shrink-0">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={cn('absolute inset-0 rounded-full blur-md', styles.glow)}
            />
            <div
              className={cn(
                'relative h-12 w-12 rounded-full border flex items-center justify-center',
                styles.ring,
                styles.bg,
                styles.text
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
