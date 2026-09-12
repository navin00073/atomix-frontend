import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  GitBranch,
  Search,
  CheckCircle2,
  Box,
  Truck,
  User,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const MedicineTraceability: React.FC = () => {
  const { prescriptions, patients, medicines } = useHospital();
  const [searchRx, setSearchRx] = useState('RX-2041');

  const targetRx =
    prescriptions.find(
      (r) =>
        r.id.toLowerCase().includes(searchRx.toLowerCase()) ||
        r.patientName.toLowerCase().includes(searchRx.toLowerCase())
    ) || prescriptions[0];

  const targetPatient = patients.find((p) => p.id === targetRx?.patientId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            End-to-End Medicine Traceability & Custody Flow
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographic batch pedigree from Central Stockroom through Smart Vending and Rover delivery to Patient verification
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search Prescription ID..."
            value={searchRx}
            onChange={(e) => setSearchRx(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 font-mono-tech focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {targetRx && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 shadow-xl">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-tech text-white">Prescription {targetRx.id}</span>
                <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {targetRx.destination || targetRx.vendingMachineId || 'Smart Vending VM-01'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Patient: <strong className="text-slate-200">{targetRx.patientName}</strong> ({targetRx.patientId}) • Prescribing Physician: <strong className="text-slate-200">{targetRx.doctorName}</strong>
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold font-mono-tech bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              Chain of Custody: Verified
            </span>
          </div>

          {/* Visual 5-Stage Custody Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1: Central Warehouse */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech text-slate-500 font-bold uppercase">STAGE 01</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-slate-200">Central Warehouse</div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono-tech">
                <div>Batch: <strong>BATCH-2026-P65</strong></div>
                <div>Expiry: <strong>2027-08-30</strong></div>
                <div>Temp: <strong>21.2°C (OK)</strong></div>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                Logged at 08:30 AM
              </div>
            </div>

            {/* Step 2: Doctor Prescription */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech text-slate-500 font-bold uppercase">STAGE 02</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-slate-200">Digital Consultation</div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono-tech">
                <div>Doctor: {targetRx.doctorName ? targetRx.doctorName.split(' ')[1] || targetRx.doctorName : 'Attending'}</div>
                <div>Diagnosis: {targetRx.diagnosis ? targetRx.diagnosis.split(' ')[0] : 'Clinical'}</div>
                <div>Items: {(targetRx.items || targetRx.medicines || []).length} meds</div>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                Created {targetRx.createdAt}
              </div>
            </div>

            {/* Step 3: Smart Vending Machine */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech text-slate-500 font-bold uppercase">STAGE 03</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-slate-200">Smart Vending VM-01</div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono-tech">
                <div>Slot: <strong>01 (Paracetamol)</strong></div>
                <div>IR Drop: <strong>Verified</strong></div>
                <div>Load Cell: <strong>5.4g drop</strong></div>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                Motor 12V 100RPM
              </div>
            </div>

            {/* Step 4: Autonomous Delivery Rover */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech text-slate-500 font-bold uppercase">STAGE 04</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-slate-200">Rover RB-01 (Apollo)</div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono-tech">
                <div>Checkpoints: 4/4</div>
                <div>Transit: Optical line</div>
                <div>Compartment: Secured</div>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                RFID-01 → RFID-04
              </div>
            </div>

            {/* Step 5: Ward Handover */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-600/40 space-y-2 shadow-lg shadow-emerald-950/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-tech text-emerald-400 font-bold uppercase">STAGE 05</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-emerald-300">Ward Handover Complete</div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono-tech">
                <div>Recipient: {targetRx.patientName ? targetRx.patientName.split(' ')[0] : 'Patient'}</div>
                <div>Auth: RFID 04:A3...</div>
                <div>Status: Confirmed</div>
              </div>
              <div className="text-[10px] text-emerald-400 pt-2 border-t border-slate-900 font-bold">
                Patient Received ✓
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
