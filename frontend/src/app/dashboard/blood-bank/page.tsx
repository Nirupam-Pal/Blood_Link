'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';
import { Navbar } from '@/components/layout/navbar';
import { BloodGroup } from '@/types/blood-bank.types';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="h-10 w-10 text-red-600 animate-bounce" />
          <p className="text-sm text-muted-foreground">Loading blood bank dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mt-18 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(localError || storeError) && (
          <div className="p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError || storeError}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalError(null);
                clearError();
              }}
              className="text-xs h-7 px-2"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Total Units Available
                </p>
                <h3 className="text-2xl font-black mt-1">{totalUnits} Bags</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-red-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Critical Shortages (&lt;5 units)
                </p>
                <h3 className={`text-2xl font-black mt-1 ${criticalShortages > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                  {criticalShortages} Groups
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Verification Status
                </p>
                <h3 className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  {isVerified ? 'Verified' : 'Pending Approval'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Live Blood Inventory Management</h2>
            <p className="text-sm text-muted-foreground">
              Update real-time stock units so patients and emergency donors can discover available reserves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                ✓ Inventory Updated
              </span>
            )}
            <Button
              onClick={handleSaveInventory}
              disabled={isUpdatingInventory}
              className="bg-red-600 hover:bg-red-700 p-5 text-white gap-2 text-sm shadow-md cursor-pointer"
            >
              {isUpdatingInventory ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventory.map((item) => {
            const isLow = item.units < 5;
            const displayGroup = item.bloodGroup;

            return (
              <motion.div key={item.bloodGroup} layout>
                <Card className="p-6 bg-card border-border hover:border-red-600/40 hover:shadow-lg transition-all rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-red-600/10 text-red-600 font-black text-xl flex items-center justify-center border border-red-600/20">
                        {displayGroup}
                      </div>
                      <Badge
                        variant={isLow ? 'destructive' : 'default'}
                        className={
                          !isLow
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]'
                            : 'text-[10px]'
                        }
                      >
                        {isLow ? 'Critical Low' : 'In Stock'}
                      </Badge>
                    </div>

                    <div className="text-center my-4">
                      <span className="text-4xl font-black">{item.units}</span>
                      <span className="text-xs text-muted-foreground block mt-1">Available Units</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockChange(item.bloodGroup, -1)}
                      disabled={item.units === 0}
                      className="h-9 w-9 p-0 rounded-lg cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockChange(item.bloodGroup, 1)}
                      className="h-9 w-9 p-0 rounded-lg text-red-600 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}