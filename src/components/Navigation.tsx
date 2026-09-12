import React, { useEffect, useState, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Camera,
  CalendarCheck2,
  UserCog,
  Stethoscope,
  Pill,
  Box,
  GitBranch,
  Boxes,
  Cpu,
  Workflow,
  ClipboardList,
  ShieldCheck,
  User,
  HeartPulse,
  Fingerprint,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgePulse?: boolean;
  badgeVariant?: 'red' | 'cyan' | 'default';
  description?: string;
}

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    visits,
    prescriptions,
    activeEmergency,
    theme,
  } = useHospital();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const pendingVisitsCount = (visits || []).filter((v) => v.status === 'Waiting' || v.status === 'Checked In').length;
  const pendingRxCount = (prescriptions || []).filter((r) => r.status === 'Sent to Pharmacy').length;

  // Master definition of all available tabs (Robots removed completely)
  const allTabs: Record<string, NavItem> = {
    dashboard: { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, description: 'Overview, KPIs & hospital health' },
    doctor: { id: 'doctor', label: 'Doctor Station', icon: Stethoscope, description: 'AI Clinical Scribe & Digital Rx' },
    patients: { id: 'patients', label: 'Patients', icon: Users, description: 'EMR Records & Medical History' },
    visits: {
      id: 'visits',
      label: 'Visits & Queue',
      icon: CalendarCheck2,
      badge: pendingVisitsCount || undefined,
      description: 'OPD Queue, Triage & Token Check-in',
    },
    emergency: {
      id: 'emergency',
      label: 'Emergency Care',
      icon: HeartPulse,
      badge: activeEmergency ? activeEmergency.code : 'Ready',
      badgePulse: !!activeEmergency,
      badgeVariant: activeEmergency ? 'red' : 'default',
      description: 'AI Code Blue & Critical Response',
    },
    pharmacy: {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: Pill,
      badge: pendingRxCount || undefined,
      description: 'Prescription Verification & Dispense Queue',
    },
    inventory: {
      id: 'inventory',
      label: 'Inventory & AI',
      icon: Boxes,
      description: 'Medicine Stock, Expiry & AI Forecasting',
    },
    'iot-attendance': {
      id: 'iot-attendance',
      label: 'Biometric Gate',
      icon: Fingerprint,
      badge: 'R307',
      description: 'ESP32 Optical Fingerprint & 12V Relay',
    },
    'iot-center': {
      id: 'iot-center',
      label: 'IoT Hardware & API',
      icon: Cpu,
      badge: 'ESP32',
      description: 'Firmware Generator & REST/MQTT APIs',
    },
    'patient-portal': {
      id: 'patient-portal',
      label: 'Patient Portal',
      icon: User,
      description: 'Token, Queue, Consultation & Advice',
    },
    // Secondary System Modules for Admin
    camera: { id: 'camera', label: 'Camera Center', icon: Camera, badge: '5 Cams', description: 'Real-time CCTV & Face Recognition' },
    vending: { id: 'vending', label: 'Smart Vending VM-01', icon: Box, badge: 'IoT', description: 'Motor Spiral & HX711 Load Cell' },
    traceability: { id: 'traceability', label: 'Batch Traceability', icon: GitBranch, description: 'RFID & Counterfeit-proof Chain' },
    staff: { id: 'staff', label: 'Staff Duty Attendance', icon: UserCog, description: 'Staff Shifts & Biometric Punch-in' },
    flow: { id: 'flow', label: 'Digital Flow Diagram', icon: Workflow, description: 'Interactive 8-Stage Digital Pipeline' },
    audit: { id: 'audit', label: 'Audit Logs', icon: ClipboardList, description: 'Immutable Security & Sensor Activity' },
    privacy: { id: 'privacy', label: 'Privacy & Fallback', icon: ShieldCheck, description: 'Data Protection & Offline Policies' },
  };

  // Role-Specific Visible Nav Items
  let primaryItems: NavItem[] = [];
  let secondaryItems: NavItem[] = [];

  if (currentRole === 'ADMIN') {
    primaryItems = [
      allTabs.dashboard,
      allTabs.doctor,
      allTabs.patients,
      allTabs.visits,
      allTabs.emergency,
      allTabs.pharmacy,
      allTabs.inventory,
      allTabs['iot-attendance'],
      allTabs['iot-center'],
      allTabs['patient-portal'],
    ];
    secondaryItems = [
      allTabs.camera,
      allTabs.vending,
      allTabs.traceability,
      allTabs.staff,
      allTabs.flow,
      allTabs.audit,
      allTabs.privacy,
    ];
  } else if (currentRole === 'DOCTOR') {
    primaryItems = [
      allTabs.doctor,
      allTabs.patients,
      allTabs.visits,
      allTabs.emergency,
      allTabs.pharmacy,
    ];
  } else if (currentRole === 'PHARMACIST') {
    primaryItems = [
      allTabs.pharmacy,
      allTabs.vending,
      allTabs.inventory,
      allTabs.traceability,
    ];
  } else if (currentRole === 'NURSE') {
    primaryItems = [
      allTabs.visits,
      allTabs.patients,
      allTabs.emergency,
      allTabs.staff,
      allTabs['patient-portal'],
    ];
  } else if (currentRole === 'PATIENT') {
    primaryItems = [
      allTabs['patient-portal'],
    ];
  }

  // Check if current active tab is one of the secondary items
  const activeSecondaryItem = secondaryItems.find((item) => item.id === activeTab);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure current tab is valid for role
  useEffect(() => {
    const allowedTabIds = [...primaryItems, ...secondaryItems].map((item) => item.id);
    if (!allowedTabIds.includes(activeTab) && primaryItems.length > 0) {
      setActiveTab(primaryItems[0].id);
    }
  }, [currentRole, primaryItems, secondaryItems, activeTab, setActiveTab]);

  return (
    <nav className={`border-b px-4 backdrop-blur-xl transition-colors duration-300 relative z-30 ${
      theme === 'dark'
        ? 'bg-[#070b14]/85 border-slate-800/80 text-slate-300'
        : 'bg-white/90 border-slate-200/90 text-slate-700 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 py-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5 max-w-full">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMoreOpen(false);
                }}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? theme === 'dark'
                      ? 'text-cyan-300 font-bold'
                      : 'text-cyan-800 font-bold'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTabPill"
                    className={`absolute inset-0 rounded-full border shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-cyan-500/50 shadow-cyan-950/80'
                        : 'bg-gradient-to-r from-cyan-50 via-sky-100 to-indigo-50 border-cyan-400/60 shadow-cyan-500/10'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 transition-colors ${
                    isActive
                      ? theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                      : theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono-tech px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                        item.badgeVariant === 'red'
                          ? 'bg-red-500/25 text-red-300 border border-red-500/50 animate-pulse'
                          : isActive
                          ? theme === 'dark'
                            ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                            : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                          : theme === 'dark'
                          ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {/* Admin "More System Tools" Dropdown */}
          {secondaryItems.length > 0 && (
            <div className="relative shrink-0" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  activeSecondaryItem
                    ? theme === 'dark'
                      ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-sm'
                      : 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-sm'
                    : theme === 'dark'
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/60'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Additional System Tools & Diagnostics"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {activeSecondaryItem ? activeSecondaryItem.label : 'System Tools'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-2 w-72 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl z-50 ${
                      theme === 'dark'
                        ? 'bg-slate-950/95 border-slate-800 text-slate-200 shadow-black/80'
                        : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono-tech uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800/60 mb-1 flex items-center justify-between">
                      <span>Diagnostic & Hospital Utilities</span>
                      <span className="text-cyan-500 font-normal">7 Modules</span>
                    </div>

                    <div className="space-y-1">
                      {secondaryItems.map((item) => {
                        const Icon = item.icon;
                        const isSubActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMoreOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                              isSubActive
                                ? theme === 'dark'
                                  ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/70'
                                  : 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-200'
                                : theme === 'dark'
                                ? 'hover:bg-slate-900 text-slate-300'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg ${
                                isSubActive
                                  ? theme === 'dark' ? 'bg-cyan-900/60 text-cyan-300' : 'bg-cyan-200 text-cyan-800'
                                  : theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="truncate">
                                <div className="font-semibold truncate">{item.label}</div>
                                {item.description && (
                                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                                )}
                              </div>
                            </div>
                            {item.badge && (
                              <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold shrink-0 ml-2">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* User-Friendly Role View Indicator */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 pl-2">
          <div className={`text-[11px] px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 ${
            currentRole === 'DOCTOR'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : currentRole === 'PHARMACIST'
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              : currentRole === 'NURSE'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : currentRole === 'PATIENT'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span className="capitalize">{currentRole.toLowerCase()} View</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
