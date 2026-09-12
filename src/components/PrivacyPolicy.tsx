import React from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Radio,
  QrCode,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Biometric Data Privacy & Universal Fallback Policy
          </h2>
          <p className="text-xs text-slate-400">
            Compliance with healthcare privacy standards, SHA-256 vector encryption, and full contactless card fallback guarantees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Principles */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-tech text-white uppercase">One-Way Template Vectorization</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Raw camera video frames are processed instantaneously on edge micro-nodes. Facial landmarks are converted into an irreversible 512-dimension mathematical hash. The original photographic image is never stored on disk.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-tech text-white uppercase">Explicit Patient Consent</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Biometric enrollment is 100% voluntary. During patient registration, patients can toggle off facial enrollment. At any future visit, the patient can revoke their biometric hash with immediate deletion.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-700/60 space-y-3 shadow-lg shadow-emerald-950/40">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold font-tech text-white uppercase">Guaranteed Fallback Protocol</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Patients who decline biometric scanning receive a high-durability RFID card, NFC wristband, or dynamic QR code. Every hospital terminal (Entrance, Vitals Hub, Vending Machine, and Rover) supports complete contactless fallback.
          </p>
        </div>
      </div>

      {/* Fallback Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold font-tech text-slate-200 uppercase tracking-wider">
          Multi-Modal Identification & Fallback Parity Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Hospital Gate Check-In</th>
                <th className="p-3">Doctor Consultation Queue</th>
                <th className="p-3">Smart Vending Dispense (VM-01)</th>
                <th className="p-3">Rover Ward Handover</th>
                <th className="p-3">Privacy Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-tech text-[11px]">
              <tr>
                <td className="p-3 font-bold text-cyan-400">Face Recognition</td>
                <td className="p-3 text-emerald-400">Supported (Instant)</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400">Secondary Check</td>
                <td className="p-3 text-emerald-400">Optional</td>
                <td className="p-3 text-slate-300">High (Encrypted Hash)</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-400">RFID Card / Wristband</td>
                <td className="p-3 text-emerald-400">Supported (Tap)</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400">Primary Dispense Auth</td>
                <td className="p-3 text-emerald-400">Compartment Unlock</td>
                <td className="p-3 text-emerald-400 font-bold">100% Zero-Biometric</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-purple-400">NFC Phone / Token</td>
                <td className="p-3 text-emerald-400">Supported (Tap)</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400 font-bold">100% Zero-Biometric</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-400">Patient QR Printout</td>
                <td className="p-3 text-emerald-400">Supported (Scan)</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400">Supported</td>
                <td className="p-3 text-emerald-400 font-bold">100% Zero-Biometric</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
