import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Prescription } from '../types';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  Send,
  Box,
  Search,
  Filter,
  Eye,
  Check,
  X,
  FileText,
  User,
  ShieldAlert,
  Sparkles,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';

export const PharmacyDashboard: React.FC = () => {
  const {
    prescriptions,
    patients,
    verifyPrescription,
    dispensePrescription,
    addAuditLog,
    setActiveTab,
  } = useHospital();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const filteredRx = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.id.toLowerCase().includes(search.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(search.toLowerCase()) ||
      rx.patientId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (rxId: string) => {
    setVerifyingId(rxId);
    soundEffects.playSuccessChirp();

    setTimeout(() => {
      verifyPrescription(rxId);
      setVerifyingId(null);
      setActionSuccessMsg(`Prescription ${rxId} verified by Pharmacist. Safe for automated dispensing.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }, 450);
  };

  const handleAuthorizeVending = (rx: Prescription) => {
    soundEffects.playSuccessChirp();
    verifyPrescription(rx.id);
    addAuditLog({
      actor: 'PHARMACIST-01',
      role: 'PHARMACIST',
      action: 'Vending Authorization Granted',
      details: `Prescription ${rx.id} authorized for Smart Vending Machine VM-01. Patient ${rx.patientName} can tap RFID or scan QR at VM-01 to collect.`,
      category: 'DISPENSARY',
      severity: 'INFO',
      patientId: rx.patientId,
    });
    setActionSuccessMsg(`Prescription ${rx.id} routed to Smart Vending VM-01. Switching view...`);
    setTimeout(() => {
      setActionSuccessMsg(null);
      setActiveTab('vending');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-5 h-5 text-purple-400" />
            Central Pharmacy Queue & Medication Verification
          </h2>
          <p className="text-xs text-slate-400">
            Pharmacist safety check, allergy validation, batch expiry inspection, and automated routing to Smart Vending VM-01
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech px-3 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-semibold">
            Pending Verification: {prescriptions.filter((r) => r.status === 'Sent to Pharmacy').length}
          </span>
        </div>
      </div>

      {/* Animated Action Notification */}
      <AnimatePresence>
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between shadow-xl shadow-emerald-950"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-400 hover:text-white text-xs px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Prescription ID, Patient Name, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Sent to Pharmacy">Sent to Pharmacy</option>
            <option value="Verified">Verified</option>
            <option value="Dispensed">Dispensed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Prescription ID</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Medicines Prescribed</th>
                <th className="px-4 py-3">Routing Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <AnimatePresence>
                {filteredRx.map((rx) => (
                  <motion.tr
                    key={rx.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-850/50 transition"
                  >
                    <td className="px-4 py-3 font-mono-tech font-bold text-purple-400">
                      {rx.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{rx.patientName}</div>
                      <div className="text-[11px] font-mono-tech text-cyan-400">{rx.patientId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {rx.doctorName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {(rx.items || rx.medicines || []).map((m, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="font-semibold text-slate-200">{m.medicineName || m.name}</span>{' '}
                            <span className="text-slate-400 font-mono-tech">({m.strength}, Qty: {m.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono-tech border border-slate-700">
                        {rx.destination || rx.vendingMachineId || 'Smart Vending VM-01'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <motion.span
                        key={rx.status}
                        initial={{ scale: 0.85 }}
                        animate={{ scale: 1 }}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border inline-block ${
                          rx.status === 'Delivered'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : rx.status === 'Dispensed'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : rx.status === 'Verified'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                        }`}
                      >
                        {rx.status}
                      </motion.span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setSelectedRx(rx)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-purple-400" />
                          <span>Inspect</span>
                        </motion.button>

                        {rx.status === 'Sent to Pharmacy' && (
                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleVerify(rx.id)}
                            disabled={verifyingId === rx.id}
                            className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1 transition cursor-pointer shadow"
                          >
                            <Check className="w-3 h-3" />
                            <span>{verifyingId === rx.id ? 'Checking...' : 'Verify'}</span>
                          </motion.button>
                        )}

                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleAuthorizeVending(rx)}
                          className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-1 transition cursor-pointer"
                          title="Authorize Smart Vending VM-01"
                        >
                          <Box className="w-3 h-3" />
                          <span>Vending</span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Prescription Details Modal */}
      <AnimatePresence>
        {selectedRx && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedRx(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-tech text-white uppercase tracking-wider">
                    Prescription Safety Review: {selectedRx.id}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Patient: <strong className="text-slate-200">{selectedRx.patientName}</strong> ({selectedRx.patientId}) • Prescribed by: {selectedRx.doctorName}
                </p>
              </div>

              {/* Clinical Notes */}
              <div className="space-y-3 text-xs mb-4">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block mb-1">Diagnosis</span>
                  <span className="text-cyan-300 font-semibold">{selectedRx.diagnosis || selectedRx.notes || 'Clinical evaluation complete'}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block mb-1">Doctor's Clinical Notes</span>
                  <span className="text-slate-300">{selectedRx.doctorNotes || selectedRx.notes || 'Routine prescription instructions'}</span>
                </div>

                {/* Items */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono-tech text-slate-400 uppercase block mb-2">Medication Line Items</span>
                  <div className="space-y-2">
                    {(selectedRx.items || selectedRx.medicines || []).map((m, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                        <div>
                          <div className="font-semibold text-slate-200">{m.medicineName || m.name} ({m.strength})</div>
                          <div className="text-[11px] text-slate-400">{m.frequency} • {m.duration} • {m.instructions}</div>
                        </div>
                        <div className="text-right font-mono-tech font-bold text-cyan-400">
                          Qty: {m.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleVerify(selectedRx.id);
                    setSelectedRx(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer shadow-lg shadow-emerald-950"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify & Approve</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
