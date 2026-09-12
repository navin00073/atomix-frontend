import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  User,
  QrCode,
  Heart,
  Pill,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Box,
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const { patients, visits, prescriptions, robots, vendingMachines } = useHospital();
  const [selectedPtId, setSelectedPtId] = useState('PT-1024');

  const patient = patients.find((p) => p.id === selectedPtId) || patients[0];
  const visit = visits.find((v) => v.patientId === patient?.id);
  const patientRx = prescriptions.filter((r) => r.patientId === patient?.id);
  const assignedRobot = robots.find((r) => r.assignedPatientId === patient?.id);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Patient Personal Health & Automation Portal
          </h2>
          <p className="text-xs text-slate-400">
            Real-time consultation queue token, IoT vitals telemetry, prescription schedule, and medicine delivery tracker
          </p>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Logged-in Patient:</span>
          <select
            value={selectedPtId}
            onChange={(e) => setSelectedPtId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-cyan-300 font-mono-tech focus:outline-none"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Banner: Token & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase">Today's Token</span>
          <div className="text-2xl font-bold font-mono-tech text-cyan-400">
            {visit?.tokenNumber || 'TKN-101'}
          </div>
          <div className="text-xs text-slate-400">
            Priority: <strong className="text-slate-200">{visit?.priority || 'Normal'}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase">Current Stage</span>
          <div className="text-lg font-bold font-tech text-emerald-400 uppercase">
            {patient?.status || 'Waiting'}
          </div>
          <div className="text-xs text-slate-400">
            Method: <strong className="text-slate-200">{visit?.method || 'Face + RFID'}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono-tech text-slate-400 uppercase">Assigned Doctor</span>
          <div className="text-lg font-bold text-slate-100 font-tech">Dr. Sundar Kumar MD</div>
          <div className="text-xs text-cyan-400">Consultation Room 02</div>
        </div>
      </div>

      {/* Digital Prescription & Medication Dispense Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold font-tech uppercase text-slate-200 tracking-wider">
              Active Prescriptions & Collection Method
            </h3>
          </div>
          <span className="text-[10px] font-mono-tech text-slate-400">
            {patientRx.length} Prescriptions on file
          </span>
        </div>

        {patientRx.length === 0 ? (
          <div className="text-xs text-slate-500 py-4 text-center">No active prescriptions yet. Consult doctor first.</div>
        ) : (
          patientRx.map((rx) => (
            <div key={rx.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-cyan-300 font-tech">{rx.id} • {rx.diagnosis || rx.notes || 'Prescription Details'}</div>
                  <div className="text-xs text-slate-400">Prescribed by {rx.doctorName}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-tech bg-purple-950 text-purple-300 border border-purple-800">
                  {rx.status}
                </span>
              </div>

              {/* Medicines List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                {(rx.items || rx.medicines || []).map((m, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-semibold text-slate-200">{m.medicineName || m.name} ({m.strength})</div>
                    <div className="text-[11px] text-cyan-400 font-mono-tech mt-0.5">
                      {m.frequency} • {m.duration} (Qty: {m.quantity})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.instructions}</div>
                  </div>
                ))}
              </div>

              {/* How to collect */}
              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-200 flex items-start gap-2">
                <Box className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-cyan-300">How to Collect Your Medication:</strong>
                  <span>
                    Proceed to <strong>Smart Vending Machine VM-01</strong> in Emergency Corridor A. Tap your patient RFID badge or scan your patient QR code. Slot 01 will automatically dispense your prescribed package.
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rover Live Delivery Status if assigned */}
      {assignedRobot && (
        <div className="bg-slate-900 border border-blue-500/50 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-tech uppercase text-slate-200 tracking-wider">
                Autonomous Rover Delivery En Route to Your Ward
              </h3>
            </div>
            <span className="text-xs font-mono-tech text-emerald-400 font-bold">{assignedRobot.status}</span>
          </div>

          <div className="text-xs text-slate-300">
            Rover <strong>{assignedRobot.name} ({assignedRobot.id})</strong> is currently navigating to <strong>{assignedRobot.currentDestination}</strong>. Current Checkpoint: <span className="font-mono-tech text-cyan-300">{assignedRobot.currentCheckpoint}</span>.
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            When the rover reaches your bed, tap your RFID patient wristband to unlock the medicine compartment.
          </div>
        </div>
      )}
    </div>
  );
};
