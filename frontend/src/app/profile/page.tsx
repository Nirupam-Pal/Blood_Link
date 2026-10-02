'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Building2, Mail, MapPin, Phone, Droplet, Pencil, X, Save, RefreshCw, Hash, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppShell } from '@/components/layout/app-shell';
import { Avatar, Notice, PageLoader, Panel, StatusBadge } from '@/components/ui/state-views';
import { useAuthStore } from '@/stores/auth.store';
import { useBloodBankStore } from '@/stores/blood-bank.store';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

interface ProfileForm {
  // Shared
  state: string;
  district: string;
  subDivision: string;
  city: string;
  pinCode: string;
  // User-only
  fullName: string;
  gender: string;
  bloodGroup: string;
  // Blood-bank-only
  bloodBankName: string;
  licenseNumber: string;
  phoneNumber: string;
  address: string;
}

const EMPTY_FORM: ProfileForm = {
  state: '',
  district: '',
  subDivision: '',
  city: '',
  pinCode: '',
  fullName: '',
  gender: '',
  bloodGroup: '',
  bloodBankName: '',
  licenseNumber: '',
  phoneNumber: '',
  address: '',
};

export default function ProfilePage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isUpdatingUserProfile = useAuthStore((state) => state.isUpdatingProfile);
  const updateUserProfile = useAuthStore((state) => state.updateProfile);
  const authError = useAuthStore((state) => state.error);
  const clearAuthError = useAuthStore((state) => state.clearError);

  const isUpdatingBankProfile = useBloodBankStore((state) => state.isUpdatingProfile);
  const updateBankProfile = useBloodBankStore((state) => state.updateProfile);
  const bankError = useBloodBankStore((state) => state.error);
  const clearBankError = useBloodBankStore((state) => state.clearError);

  const isBloodBank = user?.role === 'BLOOD_BANK';
  // When role is BLOOD_BANK, `user` also carries bloodBankName/phoneNumber/
  // address/licenseNumber/inventory (auth.store's initialize() merges the
  // full blood-bank profile in for that role).
  const bank = user as unknown as Record<string, any> | null;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isInitializing && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, isInitializing, router]);

  const buildFormFromSource = () => {
    if (!user) return EMPTY_FORM;
    if (isBloodBank && bank) {
      return {
        ...EMPTY_FORM,
        bloodBankName: bank.bloodBankName || '',
        licenseNumber: bank.licenseNumber || '',
        phoneNumber: bank.phoneNumber || '',
        address: bank.address || '',
        state: bank.state || '',
        district: bank.district || '',
        subDivision: bank.subDivision || '',
        city: bank.city || '',
        pinCode: bank.pinCode || '',
      };
    }
    return {
      ...EMPTY_FORM,
      fullName: user.fullName || '',
      gender: user.gender || '',
      bloodGroup: user.bloodGroup || '',
      state: user.state || '',
      district: user.district || '',
      subDivision: user.subDivision || '',
      city: user.city || '',
      pinCode: user.pinCode || '',
    };
  };

  // Hydrate the editable form whenever the source profile changes (e.g.
  // after a successful save), but never mid-edit — that would blow away
  // whatever the user is currently typing.
  useEffect(() => {
    if (isEditing) return;
    setForm(buildFormFromSource());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isBloodBank, isEditing]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(buildFormFromSource());
    setIsEditing(false);
    clearAuthError();
    clearBankError();
  };

  const handleSave = async () => {
    setSavedSuccess(false);
    try {
      if (isBloodBank) {
        await updateBankProfile({
          bloodBankName: form.bloodBankName.trim(),
          licenseNumber: form.licenseNumber.trim(),
          phoneNumber: form.phoneNumber.trim(),
          address: form.address.trim(),
          state: form.state.trim(),
          district: form.district.trim(),
          subDivision: form.subDivision.trim(),
          city: form.city.trim(),
          pinCode: form.pinCode.trim(),
        });
      } else {
        await updateUserProfile({
          fullName: form.fullName.trim(),
          gender: form.gender as ProfileForm['gender'] as any,
          bloodGroup: form.bloodGroup as any,
          state: form.state.trim(),
          district: form.district.trim(),
          subDivision: form.subDivision.trim(),
          city: form.city.trim(),
          pinCode: form.pinCode.trim(),
        });
      }
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Error is already surfaced via the store's `error` state below.
    }
  };

  const isSaving = isBloodBank ? isUpdatingBankProfile : isUpdatingUserProfile;
  const error = isBloodBank ? bankError : authError;
  const clearError = isBloodBank ? clearBankError : clearAuthError;

  if (isInitializing || status === 'idle' || !user) {
    return <PageLoader label="Loading your profile" />;
  }

  const displayName = isBloodBank ? bank?.bloodBankName : user.fullName;
  const titleCase = (v?: string) => (v ? v.charAt(0) + v.slice(1).toLowerCase() : '—');

  const textField = (field: keyof ProfileForm, value: React.ReactNode) =>
    isEditing ? (
      <Input value={form[field]} onChange={(e) => handleChange(field, e.target.value)} />
    ) : (
      <ReadOnlyValue>{value}</ReadOnlyValue>
    );

  return (
    <AppShell>
      {error && (
        <Notice tone="brand" onDismiss={clearError} className="mb-6">
          {error}
        </Notice>
      )}

      {/* Profile hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-surface p-1.5 shadow-card">
        <div className="relative h-28 overflow-hidden rounded-[1.25rem] bg-linear-to-r from-red-700 via-red-800 to-red-950">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/25" />
          <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border border-white/25" />
        </div>
        <div className="flex flex-col gap-5 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative z-10 flex items-end gap-4 min-w-0">
            <motion.div
              whileHover={{ scale: 1.04, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="-mt-10 shrink-0"
            >
              {isBloodBank ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background shadow-card">
                  <Building2 className="h-8 w-8" />
                </div>
              ) : (
                <Avatar name={displayName} size="lg" className="h-20 w-20 text-xl ring-4" />
              )}
            </motion.div>
            <div className="min-w-0 pt-3 pb-1">
              <h1 className="truncate text-2xl font-bold tracking-tight">{displayName}</h1>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="neutral">{isBloodBank ? 'Blood Bank' : 'User'}</StatusBadge>
            {isBloodBank && (
              <StatusBadge tone={bank?.emailVerified ? 'success' : 'warning'}>
                {bank?.emailVerified ? 'Verified' : 'Pending Approval'}
              </StatusBadge>
            )}
            {!isBloodBank && (
              <StatusBadge tone={user.donor ? 'success' : 'neutral'} live={Boolean(user.donor)}>
                {user.donor ? 'Active Donor' : 'Not a Donor'}
              </StatusBadge>
            )}
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{isBloodBank ? 'Facility information' : 'Personal information'}</h2>
          <p className="text-sm text-muted-foreground">{isEditing ? 'Make your changes, then save.' : 'Details other people see when they find you.'}</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {savedSuccess && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <StatusBadge tone="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Profile updated
                </StatusBadge>
              </motion.span>
            )}
          </AnimatePresence>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button variant="brand" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </Button>
            </>
          )}
        </div>
      </div>

      <motion.div key={isEditing ? 'edit' : 'view'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <Panel className="p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {isBloodBank ? (
              <>
                <Field label="Blood bank name" icon={Building2}>{textField('bloodBankName', bank?.bloodBankName)}</Field>
                <Field label="License number" icon={Hash}>{textField('licenseNumber', bank?.licenseNumber)}</Field>
                <Field label="Phone number" icon={Phone}>{textField('phoneNumber', bank?.phoneNumber)}</Field>
                <Field label="Email address" icon={Mail}>
                  <ReadOnlyValue muted>{user.email}</ReadOnlyValue>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Address" icon={MapPin}>{textField('address', bank?.address)}</Field>
                </div>
              </>
            ) : (
              <>
                <Field label="Full name" icon={UserIcon}>{textField('fullName', user.fullName)}</Field>
                <Field label="Email address" icon={Mail}>
                  <ReadOnlyValue muted>{user.email}</ReadOnlyValue>
                </Field>
                <Field label="Gender" icon={UserIcon}>
                  {isEditing ? (
                    <Select value={form.gender} onValueChange={(val) => handleChange('gender', val ?? '')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g.charAt(0) + g.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ReadOnlyValue>{titleCase(user.gender)}</ReadOnlyValue>
                  )}
                </Field>
                <Field label="Blood group" icon={Droplet}>
                  {isEditing ? (
                    <Select value={form.bloodGroup} onValueChange={(val) => handleChange('bloodGroup', val ?? '')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ReadOnlyValue>
                      <span className="font-semibold text-brand">{user.bloodGroup || '—'}</span>
                    </ReadOnlyValue>
                  )}
                </Field>
              </>
            )}

            <Field label="State" icon={MapPin}>{textField('state', isBloodBank ? bank?.state : user.state)}</Field>
            <Field label="District" icon={MapPin}>{textField('district', isBloodBank ? bank?.district : user.district)}</Field>
            <Field label="Sub-division" icon={MapPin}>{textField('subDivision', isBloodBank ? bank?.subDivision : user.subDivision)}</Field>
            <Field label="City" icon={MapPin}>{textField('city', isBloodBank ? bank?.city : user.city)}</Field>
            <Field label="Pin code" icon={Hash}>{textField('pinCode', isBloodBank ? bank?.pinCode : user.pinCode)}</Field>
          </div>
        </Panel>
      </motion.div>
    </AppShell>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

function ReadOnlyValue({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`flex h-10 items-center rounded-lg bg-surface px-3 text-sm font-medium ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
      {children || '—'}
    </p>
  );
}
