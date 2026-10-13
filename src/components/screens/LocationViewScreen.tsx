import React, { useMemo } from 'react';
import {
  ShoppingCart,
  Package,
  Pill,
  ArrowUpRight,
  ArrowDownRight,
  PackageX,
  TriangleAlert,
  CalendarClock,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useProfile } from '../../context/ProfileContext';
import { MedicineImage } from '../MedicineImage';
import { apiGet } from '../../services/api';

const CATEGORY_COLORS = ['bg-brand-600', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-400'];

const money = (n: number) => `GH₵ ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const Card: React.FC<{ title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title,
  action,
  children,
  className = '',
}) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${className}`}>
    {title && (
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </section>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="py-6 text-center text-sm text-slate-500">{children}</p>
);

export const LocationViewScreen: React.FC = () => {
  const { items, setActiveScreen, setSelectedItemId, addNewItem, selectedLocationId, setSelectedLocationId } = usePharmacy();
  const { profile } = useProfile();
  const [locationName, setLocationName] = React.useState<string>('');

  React.useEffect(() => {
    if (selectedLocationId) {
      apiGet<{ locations: { id: string; name: string }[] }>('/api/locations')
        .then(({ locations }) => {
          const loc = locations.find((l) => l.id === selectedLocationId);
          if (loc) setLocationName(loc.name);
        })
        .catch(() => setLocationName('Unknown Location'));
    }
  }, [selectedLocationId]);

  const { outOfStock, lowStock, expiringCount, restock } = useMemo(() => {
    const out = items.filter((i) => i.currentBalance === 0);
    const low = items.filter((i) => i.currentBalance > 0 && i.currentBalance <= i.minThreshold);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 90);
    const today = new Date();
    const expiring = items.filter((i) =>
      i.batches.some((b) => {
        const d = new Date(b.expiryDate);
        return b.currentQuantity > 0 && d >= today && d <= cutoff;
      }),
    ).length;
    const list = [...out, ...low]
      .sort((a, b) => a.currentBalance / (a.minThreshold || 1) - b.currentBalance / (b.minThreshold || 1))
      .slice(0, 6);
    return { outOfStock: out.length, lowStock: low.length, expiringCount: expiring, restock: list };
  }, [items]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => {
      const c = (i as unknown as { category?: string }).category?.trim() || 'Uncategorised';
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], idx) => ({ name, count, bar: CATEGORY_COLORS[idx] }));
  }, [items]);

  const openReceive = (itemId?: string) => {
    if (itemId) setSelectedItemId(itemId);
    setActiveScreen('receive');
  };
  const openDispense = () => setActiveScreen('dispense');
  const openInventory = () => setActiveScreen('inventory');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.manager_name.split(' ')[0] ?? '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const inventoryValue = items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0);
  const catTotal = categories.reduce((s, c) => s + c.count, 0) || 1;

  const alerts = [
    { label: 'Out of stock', value: outOfStock, hint: 'Cannot be dispensed', icon: PackageX, tone: 'text-rose-700 bg-rose-50 border-rose-100' },
    { label: 'Running low', value: lowStock, hint: 'At or below minimum level', icon: TriangleAlert, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
    { label: 'Expiring in 90 days', value: expiringCount, hint: 'Check batches before they lapse', icon: CalendarClock, tone: 'text-orange-700 bg-orange-50 border-orange-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Location Banner */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center">
              <Package className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">Location View</h2>
              <p className="text-xs text-amber-700">Viewing inventory and operations for: {locationName || 'Unknown Location'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedLocationId(null);
              setActiveScreen('management-locations');
            }}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900"
          >
            Back to all locations
          </button>
        </div>
      </div>

      {/* Title + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedLocationId(null);
              setActiveScreen('management-locations');
            }}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Back to locations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {locationName || 'Location View'}
            </h1>
            <p className="mt-1 flex items-center gap-3 text-sm text-slate-500">
              {today}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                <Package className="h-3 w-3" />
                Location Mode
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openDispense}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            <ShoppingCart className="h-4 w-4" />
            New sale
          </button>
          <button
            onClick={() => openReceive()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Package className="h-4 w-4 text-slate-500" />
            New purchase
          </button>
          <button
            onClick={openInventory}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Pill className="h-4 w-4 text-slate-500" />
            Add medicine
          </button>
        </div>
      </div>

      {/* Stock attention */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {alerts.map(({ label, value, hint, icon: Icon, tone }) => (
          <button
            key={label}
            onClick={openInventory}
            className={`flex items-center gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-left transition-shadow hover:shadow-md hover:border-amber-300`}
          >
            <Icon className="h-6 w-6 shrink-0 text-amber-700" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-amber-900">{value}</span>
                <span className="text-sm font-semibold text-amber-800">{label}</span>
              </div>
              <div className="truncate text-xs text-amber-700">{hint}</div>
            </div>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50">
          <div className="text-sm font-medium text-amber-700">Total items</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-900">{items.length}</div>
          <div className="mt-3 text-xs text-amber-600">Items in this location</div>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <div className="text-sm font-medium text-amber-700">Inventory at cost</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-900">{money(inventoryValue)}</div>
          <div className="mt-3 text-xs text-amber-600">Current stock value</div>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <div className="text-sm font-medium text-amber-700">Total units</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-900">{items.reduce((sum, item) => sum + item.currentBalance, 0)}</div>
          <div className="mt-3 text-xs text-amber-600">All items combined</div>
        </Card>
      </div>

      {/* Restock needed */}
      <Card title="Needs restocking" className="border-amber-200 bg-amber-50">
        {items.length === 0 ? (
          <Empty>No items at this location yet.</Empty>
        ) : restock.length === 0 ? (
          <Empty>Everything is above its minimum level.</Empty>
        ) : (
          <ul className="divide-y divide-amber-100">
            {restock.map((item) => {
              const pct = Math.min(100, Math.round((item.currentBalance / (item.minThreshold || 1)) * 100));
              const empty = item.currentBalance === 0;
              return (
                <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-amber-900">{item.name}</div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-amber-200">
                      <div
                        className={`h-1.5 rounded-full ${empty ? 'bg-rose-500' : 'bg-amber-600'}`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-amber-700">
                      {empty ? 'Out of stock' : `${item.currentBalance} left`}, minimum {item.minThreshold}
                    </div>
                  </div>
                  <button
                    onClick={() => openReceive(item.id)}
                    className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                  >
                    Receive
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Inventory */}
      <Card title="Inventory at this location" className="border-amber-200 bg-amber-50">
        {items.length === 0 ? (
          <Empty>No items at this location yet.</Empty>
        ) : (
          <ul className="divide-y divide-amber-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-amber-900">{item.name}</div>
                  <div className="mt-1 text-xs text-amber-700">{item.presentation} · SKU {item.sku}</div>
                  <div className="mt-1 text-xs text-amber-700">{item.currentBalance} {item.unit}</div>
                </div>
                <button
                  onClick={() => openReceive(item.id)}
                  className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                >
                  Receive
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Categories */}
      <Card title="Medicine categories" className="border-amber-200 bg-amber-50">
        {categories.length === 0 ? (
          <Empty>Add medicines to see your categories.</Empty>
        ) : (
          <>
            <div className="mb-5 flex h-3 overflow-hidden rounded-full">
              {categories.map((c) => (
                <div key={c.name} className={c.bar} style={{ width: `${(c.count / catTotal) * 100}%` }} title={c.name} />
              ))}
            </div>
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2.5 font-medium text-amber-900">
                    <span className={`h-2.5 w-2.5 rounded-full ${c.bar}`} />
                    {c.name}
                  </span>
                  <span className="tabular-nums text-amber-700">{c.count} items</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
};
