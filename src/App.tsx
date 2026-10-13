import React, { useEffect, useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ReceiveStockScreen } from './components/screens/ReceiveStockScreen';
import { DispenseScreen } from './components/screens/DispenseScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { BinCardScreen } from './components/screens/BinCardScreen';
import { OperationsScreen } from './components/screens/OperationsScreen';
import { ManagementHubScreen } from './components/screens/ManagementHubScreen';
import { AboutPoliciesScreen } from './components/screens/AboutPoliciesScreen';
import type { HubTab } from './components/screens/ManagementHubScreen';
import type { ActiveScreen } from './types/pharmacy';
import { SupabaseModal } from './components/SupabaseModal';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MANAGEMENT_TAB_BY_SCREEN: Partial<Record<ActiveScreen, HubTab>> = {
  'management-insights': 'insights',
  'management-safety': 'safety',
  'management-suppliers': 'suppliers',
  'management-access': 'access',
  'management-patients': 'patients',
  'management-locations': 'locations',
  'management-barcode': 'barcode',
};

const MainLayout: React.FC = () => {
  const { activeScreen, notification, clearNotification } = usePharmacy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!notification || notification.type === 'error') return;

    const timeout = window.setTimeout(clearNotification, 2000);
    return () => window.clearTimeout(timeout);
  }, [notification, clearNotification]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Responsive Left Navigation */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header mobileMenuOpen={mobileMenuOpen} onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Global Notification Banner */}
        {notification && (
          <div className="px-4 sm:px-6 pt-3">
            <div role={notification.type === 'error' ? 'alert' : 'status'} aria-live={notification.type === 'error' ? 'assertive' : 'polite'} className={`p-3 rounded-xl flex items-center justify-between shadow-2xs text-xs sm:text-sm ${
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              notification.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
              'bg-teal-50 text-teal-800 border border-teal-200'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' && <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-emerald-600 shrink-0" />}
                {notification.type === 'error' && <AlertCircle aria-hidden="true" className="w-4 h-4 text-rose-600 shrink-0" />}
                {notification.type === 'info' && <Info aria-hidden="true" className="w-4 h-4 text-teal-600 shrink-0" />}
                <span>{notification.message}</span>
              </div>
              <button type="button" onClick={clearNotification} aria-label="Dismiss notification" className="text-slate-400 hover:text-slate-700 p-1">
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Viewport View Switcher */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-brand-700 focus:shadow-lg">
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto px-4 py-5 focus:outline-none sm:px-6">
          {activeScreen === 'dashboard' && <DashboardScreen />}
          {activeScreen === 'receive' && <ReceiveStockScreen />}
          {activeScreen === 'dispense' && <DispenseScreen />}
          {activeScreen === 'inventory' && <InventoryScreen />}
          {activeScreen === 'bincard' && <BinCardScreen />}
          {activeScreen === 'controlled-register' && <BinCardScreen controlledRegister />}
          {activeScreen === 'sales' && <OperationsScreen view="sales" />}
          {activeScreen === 'finance' && <OperationsScreen view="finance" />}
          {activeScreen === 'reconciliation' && <OperationsScreen view="reconciliation" />}
          {(activeScreen === 'management' || MANAGEMENT_TAB_BY_SCREEN[activeScreen]) && (
            <ManagementHubScreen initialTab={MANAGEMENT_TAB_BY_SCREEN[activeScreen] ?? 'insights'} />
          )}
          {activeScreen === 'about-policies' && <AboutPoliciesScreen />}
        </main>
      </div>

      {/* Supabase SQL Migration & Setup Hub Modal */}
      <SupabaseModal />
    </div>
  );
};

export default function App() {
  return (
    <PharmacyProvider>
      <MainLayout />
    </PharmacyProvider>
  );
}
