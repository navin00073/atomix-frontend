import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Medicine } from '../types';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  RotateCw,
  ShoppingCart,
  Zap,
  Calendar,
  Layers,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export const InventoryAndAi: React.FC = () => {
  const { medicines, restockMedicine, addAuditLog } = useHospital();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW' | 'EXPIRING' | 'EXPIRED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [poSuccess, setPoSuccess] = useState<string | null>(null);

  const categories = Array.from(new Set((medicines || []).map((m) => m.category || 'General')));

  const filteredMeds = (medicines || []).filter((m) => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.brandName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.batchNumber || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;

    let matchesFilter = true;
    if (filterMode === 'LOW') matchesFilter = m.quantity <= m.minStock;
    if (filterMode === 'EXPIRING') matchesFilter = !!m.isExpiringSoon;
    if (filterMode === 'EXPIRED') matchesFilter = !!m.isExpired;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleApprovePo = (med: Medicine) => {
    soundEffects.playSuccessChirp();
    const qtyToAdd = med.aiRecommendation?.recommendedOrderQty || med.reorderQuantity;
    restockMedicine(med.id, qtyToAdd);
    setPoSuccess(`Purchase Order PO-AI-${Math.floor(1000 + Math.random() * 9000)} approved for ${qtyToAdd} units of ${med.name}. Stock replenished.`);
    setTimeout(() => setPoSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" />
            Central Medicine Inventory & AI Expiry Intelligence
          </h2>
          <p className="text-xs text-slate-400">
            30-medication repository with batch-level traceability, automatic expired lockout, and burn-rate forecasting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech px-3 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">
            Catalog: {medicines.length} Medicines
          </span>
        </div>
      </div>

      {/* AI Forecasting Top Highlight Cards (Section 31 & 32) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-purple-500/40 rounded-xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold font-tech text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Stockout Risk Alert
            </span>
            <span className="text-[10px] font-mono-tech text-slate-400">Predicted Burn</span>
          </div>
          <div className="text-xs text-slate-300">
            <strong>Paracetamol 650mg & Pantoprazole:</strong> Current burn rate is 14.2 units/day. Predicted stockout in <span className="text-amber-400 font-bold font-mono-tech">3.2 days</span>.
          </div>
          <div className="mt-3 text-[11px] text-purple-300 font-mono-tech">
            Recommendation: Generate bulk order for 200 units.
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-500/40 rounded-xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold font-tech text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Automatic Expiry Lockout
            </span>
            <span className="text-[10px] font-mono-tech text-rose-300 font-bold">LOCKED</span>
          </div>
          <div className="text-xs text-slate-300">
            <strong>Tetanus Toxoid 0.5ml:</strong> Batch BATCH-2025-T01 expired on 2026-08-15.
          </div>
          <div className="mt-3 text-[11px] text-rose-300 font-mono-tech">
            System Action: Dispensing motor locked in Vending Machine and flagged for quarantine.
          </div>
        </div>

        <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold font-tech text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Patient Inflow Predictor
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-300">Today</span>
          </div>
          <div className="text-xs text-slate-300">
            Expected afternoon surge: <strong>+35% patients</strong> between 04:00 PM and 06:30 PM based on historical Monday patterns.
          </div>
          <div className="mt-3 text-[11px] text-cyan-300 font-mono-tech">
            Pre-armed Vending Machine slots 1 & 2 for rapid dispense.
          </div>
        </div>
      </div>

      {poSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{poSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Medicine Name, Brand, or Batch #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'LOW', 'EXPIRING', 'EXPIRED'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono-tech font-semibold transition ${
                filterMode === mode
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 30-Medicine Inventory Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Medicine & Brand</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Strength & Form</th>
                <th className="px-4 py-3">Batch #</th>
                <th className="px-4 py-3">Stock / Min</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">AI Recommendation</th>
                <th className="px-4 py-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMeds.map((med) => {
                const isLow = med.quantity <= med.minStock;
                return (
                  <tr key={med.id} className="hover:bg-slate-850/50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{med.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono-tech">
                        {med.brandName} • ID: {med.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-tech text-[10px] border border-slate-700">
                        {med.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-tech text-slate-300">
                      {med.strength} ({med.dosageForm})
                    </td>
                    <td className="px-4 py-3 font-mono-tech text-cyan-400">
                      {med.batchNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono-tech font-bold">
                        <span className={isLow ? 'text-amber-400' : 'text-slate-100'}>
                          {med.quantity}
                        </span>
                        <span className="text-slate-500 font-normal">/ {med.minStock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono-tech font-bold uppercase border ${
                          med.isExpired
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : med.isExpiringSoon
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {med.expiryDate} {med.isExpired ? '(EXPIRED)' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {med.aiRecommendation ? (
                        <div className="text-[11px]">
                          <span className="text-purple-300 font-mono-tech font-semibold">
                            Reorder {med.aiRecommendation.recommendedOrderQty}
                          </span>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {med.aiRecommendation.reason}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono-tech">Optimal</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleApprovePo(med)}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition ml-auto"
                        title="Approve AI PO Restock"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
