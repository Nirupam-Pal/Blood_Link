'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Building2,
  Mail,
  MapPin,
  Phone,
  Droplet,
  Pencil,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Hash,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/navbar';
import { AmbientOrbs } from '@/components/ui/ambient-orbs';
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
    return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="h-10 w-10 text-red-600 animate-bounce" />
          <p className="text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const displayName = isBloodBank ? bank?.bloodBankName : user.fullName;

  return (
    <div className="relative min-h-screen bg-cosmic text-foreground flex flex-col overflow-hidden">
      <AmbientOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto mt-18 px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError} className="text-xs h-7 px-2">
              Dismiss
            </Button>
          </div>
        )}

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
        <Card className="p-6 bg-card border-border shadow-sm rounded-2xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="h-16 w-16 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-600/20 shrink-0"
              >
                {isBloodBank ? <Building2 className="h-8 w-8" /> : <UserIcon className="h-8 w-8" />}
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className="bg-muted text-muted-foreground border-border text-[10px]">
                    {isBloodBank ? 'Blood Bank' : 'User'}
                  </Badge>
                  {isBloodBank && (
                    <Badge
                      className={
                        bank?.emailVerified
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] flex items-center gap-1'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] flex items-center gap-1'
                      }
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {bank?.emailVerified ? 'Verified' : 'Pending Approval'}
                    </Badge>
                  )}
                  {!isBloodBank && (
                    <Badge
                      className={
                        user.donor
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] flex items-center gap-1'
                          : 'bg-muted text-muted-foreground border-border text-[10px] flex items-center gap-1'
                      }
                    >
                      <Heart className="h-3 w-3" />
                      {user.donor ? 'Active Donor' : 'Not a Donor'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-red-600 hover:bg-red-700 text-white gap-2 text-sm cursor-pointer shrink-0"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="gap-2 text-sm cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700 text-white gap-2 text-sm cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {savedSuccess && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold overflow-hidden"
              >
                ✓ Profile updated successfully
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
        <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5">
            {isBloodBank ? 'Facility Information' : 'Personal Information'}
          </h2>

          <motion.div
            key={isEditing ? 'edit' : 'view'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {isBloodBank ? (
              <>
                <Field label="Blood Bank Name" icon={Building2}>
                  {isEditing ? (
                    <Input value={form.bloodBankName} onChange={(e) => handleChange('bloodBankName', e.target.value)} className="h-11 bg-background" />
                  ) : (
                    <ReadOnlyValue>{bank?.bloodBankName}</ReadOnlyValue>
                  )}
                </Field>

                <Field label="License Number" icon={Hash}>
                  {isEditing ? (
                    <Input value={form.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} className="h-11 bg-background" />
                  ) : (
                    <ReadOnlyValue>{bank?.licenseNumber}</ReadOnlyValue>
                  )}
                </Field>

                <Field label="Phone Number" icon={Phone}>
                  {isEditing ? (
                    <Input value={form.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} className="h-11 bg-background" />
                  ) : (
                    <ReadOnlyValue>{bank?.phoneNumber}</ReadOnlyValue>
                  )}
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <ReadOnlyValue muted>{user.email}</ReadOnlyValue>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Address" icon={MapPin}>
                    {isEditing ? (
                      <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} className="h-11 bg-background" />
                    ) : (
                      <ReadOnlyValue>{bank?.address}</ReadOnlyValue>
                    )}
                  </Field>
                </div>
              </>
            ) : (
              <>
                <Field label="Full Name" icon={UserIcon}>
                  {isEditing ? (
                    <Input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="h-11 bg-background" />
                  ) : (
                    <ReadOnlyValue>{user.fullName}</ReadOnlyValue>
                  )}
                </Field>

                <Field label="Email Address" icon={Mail}>
                  <ReadOnlyValue muted>{user.email}</ReadOnlyValue>
                </Field>

                <Field label="Gender" icon={UserIcon}>
                  {isEditing ? (
                    <Select value={form.gender} onValueChange={(val) => handleChange('gender', val ?? '')}>
                      <SelectTrigger className="h-11 bg-background w-full">
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
                    <ReadOnlyValue>{user.gender ? user.gender.charAt(0) + user.gender.slice(1).toLowerCase() : '—'}</ReadOnlyValue>
                  )}
                </Field>

                <Field label="Blood Group" icon={Droplet}>
                  {isEditing ? (
                    <Select value={form.bloodGroup} onValueChange={(val) => handleChange('bloodGroup', val ?? '')}>
                      <SelectTrigger className="h-11 bg-background w-full">
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
                    <ReadOnlyValue>{user.bloodGroup || '—'}</ReadOnlyValue>
                  )}
                </Field>
              </>
            )}

            <Field label="State" icon={MapPin}>
              {isEditing ? (
                <Input value={form.state} onChange={(e) => handleChange('state', e.target.value)} className="h-11 bg-background" />
              ) : (
                <ReadOnlyValue>{isBloodBank ? bank?.state : user.state}</ReadOnlyValue>
              )}
            </Field>

            <Field label="District" icon={MapPin}>
              {isEditing ? (
                <Input value={form.district} onChange={(e) => handleChange('district', e.target.value)} className="h-11 bg-background" />
              ) : (
                <ReadOnlyValue>{isBloodBank ? bank?.district : user.district}</ReadOnlyValue>
              )}
            </Field>

            <Field label="Sub-Division" icon={MapPin}>
              {isEditing ? (
                <Input value={form.subDivision} onChange={(e) => handleChange('subDivision', e.target.value)} className="h-11 bg-background" />
              ) : (
                <ReadOnlyValue>{isBloodBank ? bank?.subDivision : user.subDivision}</ReadOnlyValue>
              )}
            </Field>

            <Field label="City" icon={MapPin}>
              {isEditing ? (
                <Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} className="h-11 bg-background" />
              ) : (
                <ReadOnlyValue>{isBloodBank ? bank?.city : user.city}</ReadOnlyValue>
              )}
            </Field>

            <Field label="Pin Code" icon={Hash}>
              {isEditing ? (
                <Input value={form.pinCode} onChange={(e) => handleChange('pinCode', e.target.value)} className="h-11 bg-background" />
              ) : (
                <ReadOnlyValue>{isBloodBank ? bank?.pinCode : user.pinCode}</ReadOnlyValue>
              )}
            </Field>
          </motion.div>
        </Card>
        </motion.div>
      </main>
    </div>
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
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      {children}
    </div>
  );
}

function ReadOnlyValue({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className={`h-11 flex items-center px-3 rounded-lg bg-muted/50 text-sm font-medium ${muted ? 'text-muted-foreground' : 'text-foreground'}`}>
      {children || '—'}
    </p>
  );
}
