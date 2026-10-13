import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { OnboardingScreen } from '../components/screens/OnboardingScreen';
import { apiGet, apiPost } from '../services/api';

export type InventorySize = 'small' | 'medium' | 'large';
export type StockCategory =
  | 'prescription_medicines'
  | 'over_the_counter'
  | 'controlled_drugs'
  | 'herbal_and_supplements'
  | 'medical_supplies';

export interface PharmacyProfile {
  id: string;
  name: string;
  manager_name: string;
  inventory_size: InventorySize;
  stock_categories: StockCategory[];
  role?: 'admin' | 'pharmacist' | 'cashier' | 'inventory_clerk';
}

export type NewProfile = Omit<PharmacyProfile, 'id'>;

interface ProfileContextValue {
  profile: PharmacyProfile | null;
  pharmacies: PharmacyProfile[];
  loading: boolean;
  error: string;
  saveProfile: (input: NewProfile) => Promise<void>;
  createPharmacy: (input: NewProfile) => Promise<void>;
  selectPharmacy: (pharmacyId: string) => Promise<void>;
  reload: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
};

export const ProfileProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({ userId, children }) => {
  const [profile, setProfile] = useState<PharmacyProfile | null>(null);
  const [pharmacies, setPharmacies] = useState<PharmacyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { pharmacies: data } = await apiGet<{ pharmacies: PharmacyProfile[] }>('/api/pharmacies');
      setPharmacies(data);
      if (data.length === 0) {
        window.localStorage.removeItem('pharmatrack_pharmacy_id');
        setProfile(null);
      } else {
        const savedId = window.localStorage.getItem('pharmatrack_pharmacy_id');
        const selected = data.find((pharmacy) => pharmacy.id === savedId) ?? data[0];
        window.localStorage.setItem('pharmatrack_pharmacy_id', selected.id);
        const { profile: selectedProfile } = await apiGet<{ profile: PharmacyProfile }>('/api/pharmacy');
        setProfile(selectedProfile);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not load your pharmacy. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = async (input: NewProfile) => {
    const { profile: data } = await apiPost<{ profile: PharmacyProfile }>('/api/pharmacy', input);
    const newProfile = { ...data, role: data.role ?? 'admin' };
    window.localStorage.setItem('pharmatrack_pharmacy_id', newProfile.id);
    setPharmacies((current) => [...current.filter((pharmacy) => pharmacy.id !== newProfile.id), newProfile]);
    setProfile(newProfile);
  };

  const createPharmacy = async (input: NewProfile) => {
    const { profile: data } = await apiPost<{ profile: PharmacyProfile }>('/api/pharmacy', input);
    const newProfile = { ...data, role: data.role ?? 'admin' };
    window.localStorage.setItem('pharmatrack_pharmacy_id', newProfile.id);
    setPharmacies((current) => [...current.filter((pharmacy) => pharmacy.id !== newProfile.id), newProfile]);
    setProfile(newProfile);
  };

  const selectPharmacy = async (pharmacyId: string) => {
    const selected = pharmacies.find((pharmacy) => pharmacy.id === pharmacyId);
    if (!selected) throw new Error('That pharmacy is not available to your account.');
    const previousId = window.localStorage.getItem('pharmatrack_pharmacy_id');
    window.localStorage.setItem('pharmatrack_pharmacy_id', selected.id);
    setLoading(true);
    setError('');
    try {
      const { profile: selectedProfile } = await apiGet<{ profile: PharmacyProfile }>('/api/pharmacy');
      setProfile(selectedProfile);
    } catch (cause) {
      if (previousId) window.localStorage.setItem('pharmatrack_pharmacy_id', previousId);
      else window.localStorage.removeItem('pharmatrack_pharmacy_id');
      setError(cause instanceof Error ? cause.message : 'We could not open that pharmacy. Please try again.');
      throw cause;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      pharmacies,
      loading,
      error,
      saveProfile,
      createPharmacy,
      selectPharmacy,
      reload: load,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

/** Shows onboarding until the pharmacy exists, then renders the app. */
export const ProfileGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading, error, saveProfile, reload } = useProfile();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-slate-500">
        Loading your pharmacy
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
        <p className="text-sm text-slate-600">{error}</p>
        <button
          onClick={reload}
          className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) return <OnboardingScreen onSubmit={saveProfile} />;

  return <>{children}</>;
};
