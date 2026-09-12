import React from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Workflow,
  Radio,
  Camera,
  CalendarCheck2,
  Stethoscope,
  Pill,
  Box,
  GitBranch,
  ShieldCheck,
  TrendingUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DigitalFlowVisualization: React.FC = () => {
  const { setActiveTab } = useHospital();

  const flowSteps = [
    {
      num: '01',
      title: 'Biometric Identification',
      sub: 'Face Recognition, RFID UID, NFC, or QR Scan at entrance gate.',
      tab: 'camera',
      icon: Camera,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-950/20',
    },
    {
      num: '02',
      title: 'Visit Attendance & Token',
      sub: 'Auto-logs patient arrival, generates Token Number, prioritizes queue.',
      tab: 'visits',
      icon: CalendarCheck2,
      color: 'border-blue-500 text-blue-400 bg-blue-950/20',
    },
    {
      num: '03',
      title: 'Doctor Station & IoT Vitals',
      sub: 'Live BP/HR/SpO2 IoT sensor ingestion, clinical review & digital Rx.',
      tab: 'doctor',
      icon: Stethoscope,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/20',
    },
    {
      num: '04',
      title: 'Pharmacy Verification',
      sub: 'Pharmacist safety sign-off, allergy conflict validation, batch inspection.',
      tab: 'pharmacy',
      icon: Pill,
      color: 'border-purple-500 text-purple-400 bg-purple-950/20',
    },
    {
      num: '05',
      title: 'Smart Vending (VM-01)',
      sub: 'RFID/QR card auth, spiral motor dispense, IR beam drop & load cell.',
      tab: 'vending',
      icon: Box,
      color: 'border-cyan-500 text-cyan-300 bg-cyan-950/20',
    },
    {
      num: '06',
      title: 'Medicine Batch Traceability',
      sub: 'RFID & cryptographic batch hash inspection ensuring authentic dispensing.',
      tab: 'traceability',
      icon: GitBranch,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-950/20',
    },
    {
      num: '07',
      title: 'Patient Digital Handover',
      sub: 'Digital dispensing verification, SMS/portal instructions & safe completion.',
      tab: 'patient-portal',
      icon: ShieldCheck,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/20',
    },
    {
      num: '08',
      title: 'AI Intelligence & Auto-PO',
      sub: 'Daily burn rate computation, stockout prediction & automated restocking.',
      tab: 'inventory',
      icon: TrendingUp,
      color: 'border-amber-500 text-amber-400 bg-amber-950/20',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            ATOMIX Autonomous Digital Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            Click any station below to inspect its live hardware state, sensor telemetry, and simulation controls.
          </p>
        </div>
      </div>

      {/* Interactive Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {flowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              onClick={() => setActiveTab(step.tab)}
              className={`p-5 rounded-2xl border cursor-pointer transition hover:scale-[1.02] shadow-lg flex flex-col justify-between ${step.color} hover:border-cyan-400`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono-tech font-bold text-xs px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                    STAGE {step.num}
                  </span>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-tech text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{step.sub}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono-tech">
                <span>Team AtomiX Pipeline</span>
                <span className="flex items-center gap-1 font-semibold">
                  Open Station <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
