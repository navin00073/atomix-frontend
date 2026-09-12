import React from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pill,
  Box,
  Fingerprint,
  Cpu,
  ArrowUpRight,
  Stethoscope,
  Sparkles,
  Workflow,
  HeartPulse,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const CommandCenterDashboard: React.FC = () => {
  const {
    patients,
    visits,
    medicines,
    vendingMachines,
    robots,
    iotDevices,
    auditLogs,
    setActiveTab,
    isEmergencyMode,
    runCompleteEndToEndDemo,
    theme,
    activeEmergency,
    emergencies,
    triggerEmergencyAlert,
  } = useHospital();

  const totalPatients = patients.length;
  const todaysPatients = visits.length;
  const waitingPatients = visits.filter((v) => v.status === 'Waiting').length;
  const consultationsCompleted = visits.filter(
    (v) => v.status === 'Pharmacy' || v.status === 'Medicine Dispensed' || v.status === 'Completed'
  ).length;
  const emergencyPatients = visits.filter((v) => v.priority === 'Emergency').length;
  const lowStockMeds = medicines.filter((m) => m.quantity <= m.minStock).length;
  const expiringMeds = medicines.filter((m) => m.isExpiringSoon || m.isExpired).length;
  const activeRobots = robots.filter((r) => r.status === 'En Route' || r.status === 'Delivering').length;
  const onlineDevices = iotDevices.filter((d) => d.status === 'Online').length;

  // Chart 1: Hourly Patient Flow
  const hourlyFlowData = [
    { hour: '07:00', arrivals: 4, consultations: 1 },
    { hour: '08:00', arrivals: 12, consultations: 5 },
    { hour: '09:00', arrivals: 22, consultations: 14 },
    { hour: '10:00', arrivals: 28, consultations: 21 },
    { hour: '11:00', arrivals: 19, consultations: 18 },
    { hour: '12:00', arrivals: 15, consultations: 16 },
    { hour: '13:00', arrivals: 8, consultations: 10 },
    { hour: '14:00', arrivals: 14, consultations: 12 },
  ];

  // Chart 2: Medicine Consumption Breakdown
  const medicineData = [
    { name: 'Paracetamol', count: 42, color: '#06b6d4' },
    { name: 'Amoxicillin', count: 28, color: '#3b82f6' },
    { name: 'Metformin', count: 35, color: '#10b981' },
    { name: 'Dolo 650', count: 50, color: '#8b5cf6' },
    { name: 'ORS Sachets', count: 31, color: '#f59e0b' },
  ];

  // Chart 3: Doctor Workload
  const doctorWorkloadData = [
    { doctor: 'Dr. Sundar', patients: 14 },
    { doctor: 'Dr. Radhika', patients: 9 },
    { doctor: 'Dr. Vignesh', patients: 11 },
    { doctor: 'Dr. Kavita', patients: 8 },
    { doctor: 'Dr. Amit', patients: 6 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Active Code Blue Incident Banner */}
      {activeEmergency && (
        <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-slate-900/90 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-red-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-600/40">
              <HeartPulse className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-800 text-white">
                  {activeEmergency.code}
                </span>
                <span className="text-xs font-mono text-red-200">
                  {activeEmergency.severity} ALERT
                </span>
                <span className="text-[11px] font-mono text-cyan-300">
                  Stage {activeEmergency.currentStage}/7: {activeEmergency.stageHistory[activeEmergency.currentStage - 1]?.title}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {activeEmergency.title} — {activeEmergency.patientName} ({activeEmergency.location.floor} • {activeEmergency.location.bed})
              </h3>
              <p className="text-xs text-red-200/90 mt-0.5">
                Nearest Nurse: <strong className="text-white">{activeEmergency.assignedNurse.name}</strong> • Attending: <strong className="text-white">{activeEmergency.assignedDoctor.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setActiveTab('emergency')}
              className="px-4 py-2 rounded-xl bg-white text-red-950 font-bold text-xs hover:bg-red-50 transition-all shadow-lg whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <span>Command Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Emergency Mode Alert Banner if active */}
      {isEmergencyMode && !activeEmergency && (
        <div className="bg-rose-950/80 border-2 border-rose-600 rounded-xl p-4 shadow-xl shadow-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-tech uppercase tracking-wider">
                HOSPITAL EMERGENCY PROTOCOL ACTIVE (CODE BLUE)
              </h3>
              <p className="text-xs text-rose-200">
                Priority triage override in effect. Delivery rover emergency priority lane enabled. Emergency medication kit VM-01 unlocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('doctor')}
            className="px-3 py-1.5 rounded-lg bg-white text-rose-900 font-bold text-xs hover:bg-rose-100 transition whitespace-nowrap"
          >
            Go to Triage Queue →
          </button>
        </div>
      )}

      {/* Live Operations Telemetry Ribbon */}
      <div className={`border backdrop-blur-xl rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-indigo-950/40 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-200/50'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-tech uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                  Live Hospital Operations
                </span>
                <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  8 Node Telemetry Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-modal biometric triage linked to Smart Vending (VM-01) and Autonomous Rover delivery routes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('emergency')}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-xs shadow-md shadow-red-600/30 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>AI Code Blue</span>
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-3.5 py-2 rounded-full font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 border ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Workflow className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Flow Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('iot-attendance')}
              className={`px-3.5 py-2 rounded-full font-semibold text-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 border ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Biometric Gate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Live-Status Capsules (Inspired directly by user reference images) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900/70 border-slate-800 text-slate-200'
            : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="truncate">
            <div className="text-[10px] uppercase font-mono-tech text-emerald-500 font-bold tracking-wider">Vending VM-01</div>
            <div className="text-xs font-semibold truncate">142 Doses Stocked</div>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900/70 border-slate-800 text-slate-200'
            : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <div className="truncate">
            <div className="text-[10px] uppercase font-mono-tech text-cyan-500 font-bold tracking-wider">ESP32 Biometrics</div>
            <div className="text-xs font-semibold truncate">R307 Optical 508 DPI Ready</div>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900/70 border-slate-800 text-slate-200'
            : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] uppercase font-mono-tech text-indigo-500 font-bold tracking-wider">Biometrics Match</div>
            <div className="text-xs font-semibold truncate">99.4% Face & RFID</div>
          </div>
        </div>

        <div className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900/70 border-slate-800 text-slate-200'
            : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
          <div className="truncate">
            <div className="text-[10px] uppercase font-mono-tech text-blue-500 font-bold tracking-wider">IoT Sensor Mesh</div>
            <div className="text-xs font-semibold truncate">8/8 Gateways Online</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (12 Metrics with High-Tech Glow) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/50'
            : 'bg-white/90 border-slate-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Total Patients</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{totalPatients}</div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">20 registered records</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-950/50'
            : 'bg-white/90 border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Today's Visits</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{todaysPatients}</div>
          <div className="text-[10px] text-cyan-500 font-medium mt-0.5">Active hospital pipeline</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-950/50'
            : 'bg-white/90 border-slate-200 hover:border-amber-400 hover:shadow-lg hover:shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Waiting Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-amber-300' : 'text-amber-600'}`}>{waitingPatients}</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Avg wait: 8 mins</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/50'
            : 'bg-white/90 border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Consulted</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>{consultationsCompleted}</div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">Rx generated & signed</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-950/50'
            : 'bg-white/90 border-slate-200 hover:border-rose-400 hover:shadow-lg hover:shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Emergency</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>{emergencyPatients}</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-rose-400/80' : 'text-rose-600'}`}>High priority triaged</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/50'
            : 'bg-white/90 border-slate-200 hover:border-purple-400 hover:shadow-lg hover:shadow-slate-200/80'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Dispensed</span>
            <Pill className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>18 units</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>IR & Load cell verified</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-amber-500/50'
            : 'bg-white/90 border-slate-200 hover:border-amber-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Low Stock</span>
            <Box className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>{lowStockMeds}</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-amber-400/80' : 'text-amber-600'}`}>Reorder alert</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-rose-500/50'
            : 'bg-white/90 border-slate-200 hover:border-rose-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Expiring / Exp</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-rose-300' : 'text-rose-600'}`}>{expiringMeds}</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Blocked from vending</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/50'
            : 'bg-white/90 border-slate-200 hover:border-cyan-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Biometrics (R307)</span>
            <Fingerprint className="w-4 h-4 text-cyan-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'}`}>2 Gates</div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">508 DPI / 99.4% Match</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-emerald-500/50'
            : 'bg-white/90 border-slate-200 hover:border-emerald-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>IoT Devices</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-xl font-bold font-mono-tech ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'}`}>{onlineDevices} / 8</div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">100% online</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/50'
            : 'bg-white/90 border-slate-200 hover:border-cyan-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Vending VM-01</span>
            <Box className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-sm font-bold font-mono-tech text-emerald-500">ONLINE</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>6/6 Slots active</div>
        </div>

        <div className={`rounded-2xl p-3.5 border transition-all duration-200 hover:-translate-y-0.5 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 hover:border-purple-500/50'
            : 'bg-white/90 border-slate-200 hover:border-purple-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>AI Forecast</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`text-sm font-bold font-mono-tech ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>ACTIVE</div>
          <div className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Daily burn analysis</div>
        </div>
      </div>

      {/* Live Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Patient Flow */}
        <div className={`lg:col-span-2 border rounded-3xl p-5 shadow-lg transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 shadow-slate-950/50'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`text-sm font-bold font-tech uppercase tracking-wider flex items-center gap-2 ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Activity className="w-4 h-4 text-cyan-500" />
                Hourly Patient Inflow & Consultations
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time attendance vs doctor consultation rate
              </p>
            </div>
            <span className={`text-[11px] font-mono-tech px-2.5 py-0.5 rounded-full border font-semibold ${
              theme === 'dark'
                ? 'text-cyan-300 bg-cyan-950/80 border-cyan-800'
                : 'text-cyan-700 bg-cyan-50 border-cyan-200'
            }`}>
              Peak: 10:00 AM (28 pts)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyFlowData}>
                <defs>
                  <linearGradient id="arrivalsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area type="monotone" dataKey="arrivals" stroke="#06b6d4" fill="url(#arrivalsGrad)" name="Check-in Arrivals" strokeWidth={2} />
                <Area type="monotone" dataKey="consultations" stroke="#10b981" fill="url(#consGrad)" name="Consultations Completed" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medicine Consumption Distribution */}
        <div className={`border rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 shadow-slate-950/50'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50'
        }`}>
          <div>
            <h3 className={`text-sm font-bold font-tech uppercase tracking-wider flex items-center gap-2 mb-1 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Pill className="w-4 h-4 text-purple-500" />
              Medicine Consumption
            </h3>
            <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Automated dispensing share today
            </p>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={medicineData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4}>
                    {medicineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-2 text-[11px] font-mono-tech pt-2 border-t ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            {medicineData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={`truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{item.name}:</span>
                <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Doctor Workload & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Workload Distribution */}
        <div className={`border rounded-3xl p-5 shadow-lg transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 shadow-slate-950/50'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold font-tech uppercase tracking-wider flex items-center gap-2 ${
              theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              Doctor Queue Load
            </h3>
            <span className={`text-[10px] font-mono-tech ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Today</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorWorkloadData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="doctor" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="patients" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Patients Consulted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed (Section 4 requirement) */}
        <div className={`lg:col-span-2 border rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/80 shadow-slate-950/50'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b mb-3 ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <h3 className={`text-sm font-bold font-tech uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
              }`}>
                Live Hospital Event Feed
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('audit')}
              className="text-xs text-cyan-500 hover:text-cyan-400 font-mono-tech transition flex items-center gap-1 font-semibold"
            >
              All Audit Logs ({auditLogs.length}) →
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {(auditLogs || []).slice(0, 6).map((log, index) => (
              <div
                key={`${log.id}-${index}`}
                className={`flex items-start justify-between gap-3 p-2.5 rounded-xl border text-xs transition ${
                  theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-mono-tech font-bold uppercase ${
                      log.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : theme === 'dark'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                    }`}
                  >
                    {log.category}
                  </span>
                  <div>
                    <div className={`font-semibold flex items-center gap-1.5 ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      <span>{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-mono-tech">• {log.actor}</span>
                    </div>
                    <p className={`text-[11px] leading-snug mt-0.5 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>{log.details}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono-tech whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={() => setActiveTab('patients')}
          className={`p-4 rounded-2xl border text-left transition duration-200 group hover:-translate-y-0.5 ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850'
              : 'bg-white/90 border-slate-200 hover:border-cyan-400 hover:shadow-md'
          }`}
        >
          <div className="text-cyan-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Patient Registration</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Webcam Face, RFID & NFC Multi-Modal Enrollment
          </div>
        </button>

        <button
          onClick={() => setActiveTab('vending')}
          className={`p-4 rounded-2xl border text-left transition duration-200 group hover:-translate-y-0.5 ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'
              : 'bg-white/90 border-slate-200 hover:border-emerald-400 hover:shadow-md'
          }`}
        >
          <div className="text-emerald-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Smart Vending VM-01</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Motor, IR Sensor & HX711 Load Cell Dispenser
          </div>
        </button>

        <button
          onClick={() => setActiveTab('iot-attendance')}
          className={`p-4 rounded-2xl border text-left transition duration-200 group hover:-translate-y-0.5 ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850'
              : 'bg-white/90 border-slate-200 hover:border-cyan-400 hover:shadow-md'
          }`}
        >
          <div className="text-cyan-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>Biometric Gate (R307)</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            ESP32 Optical Fingerprint & 12V Solenoid Door Relay
          </div>
        </button>

        <button
          onClick={() => setActiveTab('ai-forecasting')}
          className={`p-4 rounded-2xl border text-left transition duration-200 group hover:-translate-y-0.5 ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850'
              : 'bg-white/90 border-slate-200 hover:border-amber-400 hover:shadow-md'
          }`}
        >
          <div className="text-amber-500 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>AI Forecasting</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
          <div className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Burn Rate, Stockout Prediction & PO Automation
          </div>
        </button>
      </div>
    </div>
  );
};
