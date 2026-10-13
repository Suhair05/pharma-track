import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiGet, apiPatch } from '../../services/api';
import { usePharmacy } from '../../context/PharmacyContext';
import { useProfile } from '../../context/ProfileContext';

interface Transfer {
  id: string;
  item_name: string;
  batch_no: string;
  source_location: string;
  destination_location: string;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export const PendingTransfersScreen: React.FC = () => {
  const { setActiveScreen, reloadInventory } = usePharmacy();
  const { profile } = useProfile();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{ transfers: Transfer[] }>('/api/management/transfers');
      setTransfers(data.transfers);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not load transfer records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransfers();
  }, [loadTransfers]);

  const completeTransfer = async (transferId: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await apiPatch(`/api/management/transfers/${transferId}`, { status: 'completed' });
      setNotice('Transfer marked as completed.');
      await loadTransfers();
      await reloadInventory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not complete the transfer.');
    } finally {
      setBusy(false);
    }
  };

  const pendingTransfers = transfers.filter((t) => t.status === 'pending');
  const completedTransfers = transfers.filter((t) => t.status === 'completed');

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="flex items-center gap-4">
        <button
          onClick={() => setActiveScreen('management-locations')}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Back to locations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pending Stock Transfers</h1>
          <p className="mt-1 text-sm text-slate-500">View and complete stock transfers between locations</p>
        </div>
        <button
          onClick={() => void loadTransfers()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading transfer records…</p>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-slate-900">Pending Transfers</h2>
            {pendingTransfers.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">No pending transfers.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {pendingTransfers.map((transfer) => (
                  <li key={transfer.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800">{transfer.item_name}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Batch {transfer.batch_no} · {transfer.quantity} units
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {transfer.source_location} → {transfer.destination_location}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {new Date(transfer.created_at).toLocaleString()}
                      </div>
                    </div>
                    {(profile?.role === 'admin' || profile?.role === 'pharmacist' || profile?.role === 'inventory_clerk') && (
                      <button
                        disabled={busy}
                        onClick={() => void completeTransfer(transfer.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Complete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-slate-900">Completed Transfers</h2>
            {completedTransfers.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">No completed transfers yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {completedTransfers.map((transfer) => (
                  <li key={transfer.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{transfer.item_name}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Batch {transfer.batch_no} · {transfer.quantity} units
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {transfer.source_location} → {transfer.destination_location}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {new Date(transfer.created_at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
