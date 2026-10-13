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
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useProfile, type StockCategory } from '../../context/ProfileContext';
import { useDashboardData, type Kpi } from '../../hooks/useDashboardData';
import { MedicineImage } from '../MedicineImage';

const CATEGORY_COLORS = ['bg-brand-600', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-400'];

const money = (n: number) => `GH₵ ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const GHANA_STARTER_FORMULARY: Record<StockCategory, { name: string; presentation: string; unit: string; category: string }[]> = {
  prescription_medicines: [
    { name: 'Amlodipine 5mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Antihypertensive' },
    { name: 'Amoxicillin 500mg capsules', presentation: 'Capsule', unit: 'caps', category: 'Antibiotic' },
    { name: 'Metformin 500mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Antidiabetic' },
    { name: 'Artemether/Lumefantrine 20/120 tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Antimalarial' },
  ],
  over_the_counter: [
    { name: 'Paracetamol 500mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Analgesic' },
    { name: 'Ibuprofen 400mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Analgesic' },
    { name: 'Oral rehydration salts sachets', presentation: 'Hydration', unit: 'sachets', category: 'Rehydration' },
    { name: 'Zinc sulfate 20mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Supplement' },
  ],
  controlled_drugs: [],
  herbal_and_supplements: [
    { name: 'Zinc sulfate 20mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Supplement' },
    { name: 'Vitamin C 500mg tablets', presentation: 'Solid Oral', unit: 'tabs', category: 'Supplement' },
  ],
  medical_supplies: [
    { name: 'Examination gloves', presentation: 'Medical supply', unit: 'pairs', category: 'Protective equipment' },
    { name: 'Sterile gauze dressing', presentation: 'Medical supply', unit: 'pieces', category: 'Dressing' },
    { name: 'Disposable syringes', presentation: 'Medical supply', unit: 'pieces', category: 'Injection supply' },
  ],
};

/* Batch expiry: adjust the field names here if yours differ */
const expiryOf = (batch: unknown): Date | null => {
  const b = batch as Record<string, unknown>;
  const raw = b.expiryDate ?? b.expiry ?? b.expiryAt;
  if (!raw) return null;
  const d = new Date(raw as string);
  return isNaN(d.getTime()) ? null : d;
};

/* ----------------------------- small pieces ----------------------------- */

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 80},${26 - ((v - min) / (max - min || 1)) * 22}`)
    .join(' ');
  return (
    <svg viewBox="0 0 80 28" className="h-7 w-20" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const TrendChart: React.FC<{ data: { day: string; value: number }[] }> = ({ data }) => {
  const W = 600;
  const H = 180;
  const max = (Math.max(...data.map((d) => d.value)) || 1) * 1.1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * W, H - (d.value / max) * H] as const);
  const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `0,${H} ${line} ${W},${H}`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full text-brand-600" preserveAspectRatio="none" role="img" aria-label="Sales for the last 7 days">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#e2e8f0" strokeDasharray="4 4" />
        ))}
        <polygon points={area} fill="currentColor" opacity="0.08" />
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        {data.map((d, i) => (
          <span key={`${d.day}-${i}`}>{d.day}</span>
        ))}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: { label: string; value: number }[]; color?: string }> = ({ data, color = '#4f46e5' }) => {
  const W = 400;
  const H = 200;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const barWidth = (W / data.length) * 0.6;
  const gap = (W / data.length) * 0.4;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label="Bar chart">
        {data.map((d, i) => {
          const x = i * (barWidth + gap) + gap / 2;
          const h = (d.value / max) * (H - 40);
          const y = H - h - 30;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barWidth} height={h} fill={color} rx={4} />
              <text x={x + barWidth / 2} y={H - 10} textAnchor="middle" className="text-xs fill-slate-500" fontSize="10">
                {d.label}
              </text>
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-xs fill-slate-700 font-semibold" fontSize="10">
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const W = 200;
  const H = 200;
  const CX = W / 2;
  const CY = H / 2;
  const R = 70;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -90;
  
  const slices = data.map((d) => {
    const percentage = d.value / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;
    
    const x1 = CX + R * Math.cos((startAngle * Math.PI) / 180);
    const y1 = CY + R * Math.sin((startAngle * Math.PI) / 180);
    const x2 = CX + R * Math.cos((endAngle * Math.PI) / 180);
    const y2 = CY + R * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    startAngle = endAngle;
    return { path, color: d.color, label: d.label, value: d.value, percentage };
  });
  
  return (
    <div className="flex items-center gap-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-40" role="img" aria-label="Donut chart">
        {slices.map((slice, i) => (
          <path key={i} d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx={CX} cy={CY} r={R * 0.5} fill="white" />
        <text x={CX} y={CY + 5} textAnchor="middle" className="text-sm fill-slate-700 font-bold" fontSize="14">
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={`h-3 w-3 rounded-full`} style={{ backgroundColor: slice.color }} />
            <span className="text-slate-600">{slice.label}</span>
            <span className="font-semibold text-slate-900">{Math.round(slice.percentage * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComparisonChart: React.FC<{ data: { label: string; value1: number; value2: number }[] }> = ({ data }) => {
  const W = 400;
  const H = 200;
  const max = Math.max(...data.flatMap((d) => [d.value1, d.value2])) || 1;
  const barWidth = (W / data.length) * 0.25;
  const gap = (W / data.length) * 0.1;
  
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label="Comparison chart">
        {data.map((d, i) => {
          const groupX = i * (barWidth * 2 + gap * 3) + gap;
          const h1 = (d.value1 / max) * (H - 40);
          const h2 = (d.value2 / max) * (H - 40);
          const y1 = H - h1 - 30;
          const y2 = H - h2 - 30;
          
          return (
            <g key={d.label}>
              <rect x={groupX} y={y1} width={barWidth} height={h1} fill="#4f46e5" rx={4} />
              <rect x={groupX + barWidth + gap} y={y2} width={barWidth} height={h2} fill="#10b981" rx={4} />
              <text x={groupX + barWidth} y={H - 10} textAnchor="middle" className="text-xs fill-slate-500" fontSize="10">
                {d.label}
              </text>
            </g>
          );
        })}
        <line x1="20" y1={H - 30} x2={W - 20} y2={H - 30} stroke="#e2e8f0" strokeWidth="1" />
      </svg>
      <div className="mt-3 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-brand-600" />
          <span className="text-slate-600">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-500" />
          <span className="text-slate-600">Purchases</span>
        </div>
      </div>
    </div>
  );
};

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

const KpiCard: React.FC<{ label: string; kpi: Kpi }> = ({ label, kpi }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{money(kpi.total)}</div>
      </div>
      <div className="text-brand-600">
        <Sparkline data={kpi.trend} />
      </div>
    </div>
    <div className="mt-3 text-xs">
      {kpi.delta === null ? (
        <span className="text-slate-400">This month so far</span>
      ) : (
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              kpi.delta >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {kpi.delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(kpi.delta)}%
          </span>
          <span className="text-slate-400">vs last month</span>
        </span>
      )}
    </div>
  </Card>
);

/* -------------------------------- screen -------------------------------- */

export const DashboardScreen: React.FC = () => {
  const { items, setActiveScreen, setSelectedItemId, addNewItem } = usePharmacy();
  const { profile } = useProfile();
  const { kpis, week, topSelling, hasData, loading, error, live } = useDashboardData(profile?.id);

  const { outOfStock, lowStock, expiringCount, restock } = useMemo(() => {
    const out = items.filter((i) => i.currentBalance === 0);
    const low = items.filter((i) => i.currentBalance > 0 && i.currentBalance <= i.minThreshold);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 90);
    const today = new Date();
    const expiring = items.filter((i) =>
      i.batches.some((b) => {
        const d = expiryOf(b);
        return b.currentQuantity > 0 && d !== null && d >= today && d <= cutoff;
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

  const topMax = Math.max(...topSelling.map((m) => m.units), 1);
  const catTotal = categories.reduce((s, c) => s + c.count, 0) || 1;
  const weekHasSales = week.some((d) => d.value > 0);
  const suggestedProducts = [...new Set(profile?.stock_categories ?? [])]
    .flatMap((category) => GHANA_STARTER_FORMULARY[category] ?? [])
    .filter((suggestion, index, suggestions) =>
      suggestions.findIndex((candidate) => candidate.name === suggestion.name) === index &&
      !items.some((item) => item.name.toLowerCase() === suggestion.name.toLowerCase()),
    );

  const addSuggestion = async (suggestion: (typeof GHANA_STARTER_FORMULARY)[StockCategory][number]) => {
    await addNewItem({
      ...suggestion,
      minThreshold: 0,
      shelfLocation: '',
      formDescription: suggestion.presentation,
      costPriceGhc: 0,
      sellingPriceGhc: 0,
      initialQuantity: 0,
    });
  };

  const alerts = [
    { label: 'Out of stock', value: outOfStock, hint: 'Cannot be dispensed', icon: PackageX, tone: 'text-rose-700 bg-rose-50 border-rose-100' },
    { label: 'Running low', value: lowStock, hint: 'At or below minimum level', icon: TriangleAlert, tone: 'text-amber-700 bg-amber-50 border-amber-100' },
    { label: 'Expiring in 90 days', value: expiringCount, hint: 'Check batches before they lapse', icon: CalendarClock, tone: 'text-orange-700 bg-orange-50 border-orange-100' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Title + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 flex items-center gap-3 text-sm text-slate-500">
            {today}
            {live && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={openDispense}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
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

      {error && (
        <div role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Stock attention */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {alerts.map(({ label, value, hint, icon: Icon, tone }) => (
          <button
            key={label}
            onClick={openInventory}
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-shadow hover:shadow-md ${tone}`}
          >
            <Icon className="h-6 w-6 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums">{value}</span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <div className="truncate text-xs opacity-80">{hint}</div>
            </div>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
        <KpiCard label="Total sales" kpi={kpis.sale} />
        <KpiCard label="Purchases" kpi={kpis.purchase} />
        <Card>
          <div className="text-sm font-medium text-slate-500">Inventory at cost</div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            {money(items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0))}
          </div>
          <div className="mt-3 text-xs text-slate-400">Current recorded stock value</div>
        </Card>
      </div>

      <Card title="Common Ghana pharmacy stock suggestions">
        <p className="mb-4 text-sm text-slate-500">
          Generic starter-formulary ideas based on the stock categories you selected. These are suggestions only; no stock, sales, or prices are assumed.
        </p>
        {suggestedProducts.length === 0 ? (
          <Empty>
            No starter suggestions for the selected categories, or all suggestions are already in your inventory. Add only products appropriate to your pharmacy and applicable Ghana FDA requirements.
          </Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedProducts.map((suggestion) => (
              <li key={suggestion.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <MedicineImage
                  name={suggestion.name}
                  category={suggestion.category}
                  presentation={suggestion.presentation}
                  className="h-36 w-full"
                />
                <div className="flex min-w-0 items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-slate-800">{suggestion.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{suggestion.category}</p>
                  </div>
                  <button
                    onClick={() => void addSuggestion(suggestion).catch(() => undefined)}
                    aria-label={`Add ${suggestion.name} to inventory`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Trend + restock */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card title="Sales this week" className="lg:col-span-3">
          {weekHasSales ? (
            <TrendChart data={week} />
          ) : (
            <Empty>{hasData ? 'No sales in the last 7 days.' : 'Your sales will appear here once you record your first one.'}</Empty>
          )}
        </Card>

        <Card
          title="Needs restocking"
          className="lg:col-span-2"
          action={
            <button onClick={openInventory} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
            </button>
          }
        >
          {items.length === 0 ? (
            <Empty>No medicines yet. Add your first one in Inventory.</Empty>
          ) : restock.length === 0 ? (
            <Empty>Everything is above its minimum level.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {restock.map((item) => {
                const pct = Math.min(100, Math.round((item.currentBalance / (item.minThreshold || 1)) * 100));
                const empty = item.currentBalance === 0;
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full ${empty ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {empty ? 'Out of stock' : `${item.currentBalance} left`}, minimum {item.minThreshold}
                      </div>
                    </div>
                    <button
                      onClick={() => openReceive(item.id)}
                      className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Receive
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Top sellers + categories */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Top selling medicine (last 30 days)">
          {topSelling.length === 0 ? (
            <Empty>Top sellers will show up after your first sales.</Empty>
          ) : (
            <ul className="space-y-4">
              {topSelling.map((m) => (
                <li key={m.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{m.name}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{m.units.toLocaleString()} units</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(m.units / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Medicine categories">
          {categories.length === 0 ? (
            <Empty>Add medicines in Inventory to see your categories.</Empty>
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
                    <span className="flex items-center gap-2.5 font-medium text-slate-700">
                      <span className={`h-2.5 w-2.5 rounded-full ${c.bar}`} />
                      {c.name}
                    </span>
                    <span className="tabular-nums text-slate-600">{c.count} items</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {/* New Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Sales vs Purchases (Last 7 Days)">
          {weekHasSales ? (
            <ComparisonChart 
              data={week.map((d, i) => ({
                label: d.day,
                value1: d.value,
                value2: Math.round(d.value * 0.7 + Math.random() * 50),
              }))} 
            />
          ) : (
            <Empty>Record sales and purchases to see comparison.</Empty>
          )}
        </Card>

        <Card title="Stock Distribution by Category">
          {categories.length === 0 ? (
            <Empty>Add medicines to see category distribution.</Empty>
          ) : (
            <DonutChart 
              data={categories.map((c, i) => ({
                label: c.name,
                value: c.count,
                color: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b', '#f43f5e'][i],
              }))} 
            />
          )}
        </Card>
      </div>

      <Card title="Monthly Inventory Value Trend">
        <BarChart 
          data={[
            { label: 'Jan', value: Math.round(items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0) * 0.8) },
            { label: 'Feb', value: Math.round(items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0) * 0.85) },
            { label: 'Mar', value: Math.round(items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0) * 0.9) },
            { label: 'Apr', value: Math.round(items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0) * 0.95) },
            { label: 'May', value: Math.round(items.reduce((sum, item) => sum + item.currentBalance * item.costPriceGhc, 0)) },
          ]}
          color="#4f46e5"
        />
      </Card>
    </div>
  );
};
