import React, { useState, useEffect, useId } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Fingerprint,
  Radio,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  Download,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  UserCheck,
  UserPlus,
  X,
  Volume2,
  Clock,
  ArrowRightLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';

interface BiometricLogEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  location: string;
  personName: string;
  personId: string;
  role: string;
  type: 'STAFF_IN' | 'STAFF_OUT' | 'PATIENT_TOKEN' | 'ACCESS_DENIED';
  modality: 'R307 Fingerprint' | 'Capacitive FP' | 'Dual (FP + RFID)';
  confidence: number;
  relayAction: 'UNLOCKED (3s)' | 'DENIED (LOCKED)';
  tokenNumber?: string;
}

export const IotAttendanceCenter: React.FC = () => {
  const {
    staff,
    patients,
    toggleStaffStatus,
    checkInPatient,
    enrollStaffFingerprint,
    addAuditLog,
    addAlert,
    theme,
  } = useHospital();

  // Active Terminal State
  const [selectedNode, setSelectedNode] = useState('ESP32-BIO-01');
  const [authMode, setAuthMode] = useState<'STAFF' | 'PATIENT' | 'STRANGER'>('STAFF');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || 'DOC-01');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'PT-1001');

  // Scanner Hardware State
  const [isScanning, setIsScanning] = useState(false);
  const [scanState, setScanState] = useState<'IDLE' | 'READING' | 'MATCHED' | 'REJECTED'>('IDLE');
  const [solenoidOpen, setSolenoidOpen] = useState(false);
  const [solenoidTimer, setSolenoidTimer] = useState(0);
  const [oledLines, setOledLines] = useState<string[]>([
    'ATOMIX R307 BIO-GATEWAY',
    'NODE: ESP32-BIO-01 [READY]',
    'SCANNER: 508 DPI OPTICAL',
    'PLACE FINGER ON PAD...',
  ]);

  // Auto-punch live simulation toggle
  const [autoSimulate, setAutoSimulate] = useState(false);

  // Filters & Logs
  const [logFilter, setLogFilter] = useState<'ALL' | 'STAFF' | 'PATIENT' | 'DENIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial event logs
  const [eventLogs, setEventLogs] = useState<BiometricLogEntry[]>([
    {
      id: 'BIO-LOG-01',
      timestamp: '08:30:14 AM',
      nodeId: 'ESP32-BIO-01',
      location: 'Main Entrance & ICCU Air-Lock',
      personName: 'Dr. Sundar Kumar MD',
      personId: 'DOC-01',
      role: 'DOCTOR',
      type: 'STAFF_IN',
      modality: 'R307 Fingerprint',
      confidence: 99.4,
      relayAction: 'UNLOCKED (3s)',
    },
    {
      id: 'BIO-LOG-02',
      timestamp: '08:24:05 AM',
      nodeId: 'ESP32-BIO-01',
      location: 'Main Entrance & ICCU Air-Lock',
      personName: 'Dr. Radhika Iyer MD',
      personId: 'DOC-02',
      role: 'DOCTOR',
      type: 'STAFF_IN',
      modality: 'Dual (FP + RFID)',
      confidence: 99.8,
      relayAction: 'UNLOCKED (3s)',
    },
    {
      id: 'BIO-LOG-03',
      timestamp: '08:18:42 AM',
      nodeId: 'ESP32-BIO-03',
      location: 'OPD Central Kiosk #1',
      personName: 'Rajesh Kumar',
      personId: 'PT-1001',
      role: 'PATIENT',
      type: 'PATIENT_TOKEN',
      modality: 'R307 Fingerprint',
      confidence: 98.7,
      relayAction: 'UNLOCKED (3s)',
      tokenNumber: 'TKN-304',
    },
    {
      id: 'BIO-LOG-04',
      timestamp: '08:12:11 AM',
      nodeId: 'ESP32-BIO-04',
      location: 'Operation Theatre Sterile Air-Lock',
      personName: 'Nurse Priya Sharma',
      personId: 'NUR-01',
      role: 'NURSE',
      type: 'STAFF_IN',
      modality: 'R307 Fingerprint',
      confidence: 99.2,
      relayAction: 'UNLOCKED (3s)',
    },
  ]);

  // Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStep, setEnrollStep] = useState<1 | 2 | 3>(1);
  const [enrollStaffTarget, setEnrollStaffTarget] = useState<string>(staff[0]?.id || 'DOC-01');
  const [enrollFinger, setEnrollFinger] = useState('Right Index Finger');
  const [enrollSlotNumber, setEnrollSlotNumber] = useState(5);

  // Nodes telemetry
  const [nodes, setNodes] = useState([
    {
      id: 'ESP32-BIO-01',
      name: 'Main Entrance & ICCU Air-Lock',
      ip: '192.168.1.140',
      port: 'UART2 (GPIO 16/17)',
      status: 'ONLINE',
      latencyMs: 22,
      sensor: 'R307 Optical 508 DPI',
      relayGpio: 'GPIO 26 (Solenoid)',
      enrolledCount: 32,
    },
    {
      id: 'ESP32-BIO-02',
      name: 'Emergency Trauma Fast-Track',
      ip: '192.168.1.141',
      port: 'UART1 (GPIO 4/5)',
      status: 'ONLINE',
      latencyMs: 18,
      sensor: 'FPM10A Capacitive',
      relayGpio: 'GPIO 27 (MagLock)',
      enrolledCount: 28,
    },
    {
      id: 'ESP32-BIO-03',
      name: 'OPD Central Kiosk & Token',
      ip: '192.168.1.142',
      port: 'UART2 (GPIO 16/17)',
      status: 'ONLINE',
      latencyMs: 29,
      sensor: 'AS608 Optical High-Speed',
      relayGpio: 'GPIO 12 (Printer Relay)',
      enrolledCount: 64,
    },
    {
      id: 'ESP32-BIO-04',
      name: 'OT-A Sterile Scrub Air-Lock',
      ip: '192.168.1.143',
      port: 'UART2 (GPIO 16/17)',
      status: 'ONLINE',
      latencyMs: 16,
      sensor: 'R307 Optical + Touchless IR',
      relayGpio: 'GPIO 26 (Hermetic Door)',
      enrolledCount: 18,
    },
  ]);

  // Solenoid Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (solenoidOpen && solenoidTimer > 0) {
      interval = setInterval(() => {
        setSolenoidTimer((prev) => {
          if (prev <= 1) {
            setSolenoidOpen(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [solenoidOpen, solenoidTimer]);

  // Auto-simulate staff biometric attendance arrivals
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];
      if (randomStaff) {
        handleFingerprintTrigger(randomStaff.id, 'STAFF');
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [autoSimulate, staff]);

  // Trigger Fingerprint Touch Scan
  const handleFingerprintTrigger = (targetId?: string, overrideMode?: 'STAFF' | 'PATIENT' | 'STRANGER') => {
    if (isScanning) return;
    const currentMode = overrideMode || authMode;
    setIsScanning(true);
    setScanState('READING');
    soundEffects.playCardScan();

    const activeNodeObj = nodes.find((n) => n.id === selectedNode) || nodes[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Step 1: OLED reading feedback
    setOledLines([
      'FINGER DETECTED...',
      'CAPTURING 508 DPI IMAGE',
      'EXTRACTING MINUTIAE...',
      'SEARCHING EEPROM FLASH...',
    ]);

    setTimeout(() => {
      if (currentMode === 'STRANGER') {
        // Stranger / Unregistered
        soundEffects.playEmergencyAlert();
        setScanState('REJECTED');
        setIsScanning(false);
        setOledLines([
          '❌ MATCH FAILED!',
          'CONFIDENCE: 14% (<75%)',
          'ACCESS DENIED [LOCKED]',
          'SECURITY ALERT DISPATCHED',
        ]);

        const newLog: BiometricLogEntry = {
          id: `BIO-LOG-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          nodeId: selectedNode,
          location: activeNodeObj.name,
          personName: 'Unknown Fingerprint (Unregistered)',
          personId: 'UNKNOWN-BIO',
          role: 'STRANGER',
          type: 'ACCESS_DENIED',
          modality: 'R307 Fingerprint',
          confidence: 14.2,
          relayAction: 'DENIED (LOCKED)',
        };
        setEventLogs((prev) => [newLog, ...prev]);

        addAuditLog({
          actor: `IoT Biometric Node (${selectedNode})`,
          role: 'SECURITY',
          action: 'Biometric Access Denied',
          details: `Unregistered fingerprint scanned at ${activeNodeObj.name}. Score: 14.2%. Door remained locked.`,
          category: 'SECURITY',
          severity: 'WARNING',
        });

        addAlert({
          type: 'SECURITY',
          title: 'Unauthorized Fingerprint Scan',
          message: `Unrecognized fingerprint rejected at ${activeNodeObj.name} [Device: ${selectedNode}]. Door kept locked.`,
        });

        setTimeout(() => setScanState('IDLE'), 3000);
      } else if (currentMode === 'STAFF') {
        // Enrolled Staff Member
        const staffIdToUse = targetId || selectedStaffId;
        const targetStaff = staff.find((s) => s.id === staffIdToUse) || staff[0];
        const res = toggleStaffStatus(targetStaff.id, 'Fingerprint', selectedNode);

        soundEffects.playSuccessChirp();
        setScanState('MATCHED');
        setIsScanning(false);
        setSolenoidOpen(true);
        setSolenoidTimer(3);

        const isClockIn = res?.action === 'IN';

        setOledLines([
          `VERIFIED: ${targetStaff.name.slice(0, 18).toUpperCase()}`,
          `ID: ${targetStaff.id} | ${targetStaff.role.toUpperCase()}`,
          `PUNCH: CLOCKED ${isClockIn ? 'IN' : 'OUT'} @ ${timeStr.slice(0, 5)}`,
          'RELAY: SOLENOID UNLOCKED [3s]',
        ]);

        const newLog: BiometricLogEntry = {
          id: `BIO-LOG-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          nodeId: selectedNode,
          location: activeNodeObj.name,
          personName: targetStaff.name,
          personId: targetStaff.id,
          role: targetStaff.role.toUpperCase(),
          type: isClockIn ? 'STAFF_IN' : 'STAFF_OUT',
          modality: 'R307 Fingerprint',
          confidence: 99.4,
          relayAction: 'UNLOCKED (3s)',
        };
        setEventLogs((prev) => [newLog, ...prev]);

        setTimeout(() => setScanState('IDLE'), 3500);
      } else if (currentMode === 'PATIENT') {
        // Patient OPD Check-In & Instant Token
        const patientIdToUse = targetId || selectedPatientId;
        const targetPatient = patients.find((p) => p.id === patientIdToUse) || patients[0];
        const visit = checkInPatient(targetPatient.id, 'Fingerprint', 'Normal');

        soundEffects.playSuccessChirp();
        setScanState('MATCHED');
        setIsScanning(false);
        setSolenoidOpen(true);
        setSolenoidTimer(3);

        setOledLines([
          `PATIENT: ${targetPatient.name.slice(0, 18).toUpperCase()}`,
          `ID: ${targetPatient.id}`,
          `TOKEN: ${visit.tokenNumber} (OPD QUEUE)`,
          'THERMAL TICKET ISSUED',
        ]);

        const newLog: BiometricLogEntry = {
          id: `BIO-LOG-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          nodeId: selectedNode,
          location: activeNodeObj.name,
          personName: targetPatient.name,
          personId: targetPatient.id,
          role: 'PATIENT',
          type: 'PATIENT_TOKEN',
          modality: 'R307 Fingerprint',
          confidence: 98.9,
          relayAction: 'UNLOCKED (3s)',
          tokenNumber: visit.tokenNumber,
        };
        setEventLogs((prev) => [newLog, ...prev]);

        setTimeout(() => setScanState('IDLE'), 3500);
      }
    }, 1100);
  };

  // Test Solenoid Relay directly
  const handleManualRelayTrigger = () => {
    soundEffects.playCardScan();
    setSolenoidOpen(true);
    setSolenoidTimer(3);
    addAuditLog({
      actor: 'Terminal Admin',
      role: 'ADMIN',
      action: 'Door Relay Manual Override',
      details: `12V Solenoid door strike manually activated for 3 seconds on ${selectedNode}.`,
      category: 'SECURITY',
      severity: 'INFO',
    });
  };

  // Handle Enrollment Flow
  const handleStartEnrollment = () => {
    setEnrollStep(1);
    setShowEnrollModal(true);
  };

  const handleCompleteEnrollment = () => {
    enrollStaffFingerprint(enrollStaffTarget, enrollSlotNumber);
    setShowEnrollModal(false);
    setEnrollStep(1);
  };

  // Filtered event logs
  const filteredLogs = eventLogs.filter((log) => {
    const matchesFilter =
      logFilter === 'ALL' ||
      (logFilter === 'STAFF' && (log.type === 'STAFF_IN' || log.type === 'STAFF_OUT')) ||
      (logFilter === 'PATIENT' && log.type === 'PATIENT_TOKEN') ||
      (logFilter === 'DENIED' && log.type === 'ACCESS_DENIED');

    const matchesSearch =
      log.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.personId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.nodeId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Export Attendance CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Node ID', 'Location', 'Person Name', 'Person ID', 'Role', 'Event Type', 'Biometric Modality', 'Match Confidence', 'Relay Action'];
    const rows = eventLogs.map((l) => [
      l.timestamp,
      l.nodeId,
      `"${l.location}"`,
      `"${l.personName}"`,
      l.personId,
      l.role,
      l.type,
      l.modality,
      `${l.confidence}%`,
      l.relayAction,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `atomix_iot_biometric_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div
        className={`border rounded-2xl p-5 shadow-xl backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Fingerprint className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-tech tracking-wide uppercase flex items-center gap-2">
                  IoT Biometric Attendance & Access Gateway
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono-tech">
                    R307 / AS608 508 DPI
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Hardware-integrated biometric terminal, ESP32 microcontrollers, electric door strike relays & instant outpatient queue attendance
                </p>
              </div>
            </div>
          </div>

          {/* Top telemetry pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono-tech flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">MQTT Broker:</span>
              <span className="text-emerald-400 font-semibold">broker.atomix.med:1883</span>
            </div>

            <button
              type="button"
              onClick={() => setAutoSimulate((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                autoSimulate
                  ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoSimulate ? 'text-teal-300 animate-spin' : 'text-slate-400'}`} />
              <span>{autoSimulate ? 'Live Auto-Stream [ACTIVE]' : 'Simulate Live Stream'}</span>
            </button>

            <button
              type="button"
              onClick={handleStartEnrollment}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-cyan-900/30"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Fingerprint</span>
            </button>
          </div>
        </div>

        {/* Nodes Switcher Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNode(node.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-950/40 border-teal-500/80 shadow-[0_0_14px_rgba(20,184,166,0.2)]'
                    : 'bg-slate-950/50 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-mono-tech font-bold ${isSelected ? 'text-teal-300' : 'text-slate-300'}`}>
                    {node.id}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono-tech font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {node.latencyMs}ms
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">{node.name}</div>
                <div className="text-[10px] text-slate-400 font-mono-tech mt-1 flex items-center justify-between">
                  <span>{node.sensor}</span>
                  <span className="text-teal-400">{node.enrolledCount} Enrolled</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Terminal & Control Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical Fingerprint Terminal Simulation (7 Cols) */}
        <div
          className={`lg:col-span-7 border rounded-2xl p-5 shadow-xl flex flex-col justify-between ${
            isDark
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800'
              : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
          }`}
        >
          {/* Terminal Top Hardware Frame */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold font-mono-tech text-slate-300 uppercase tracking-wider">
                  Hardware Node: {selectedNode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Solenoid Door Strike Relay Pill */}
                <span
                  className={`text-[10px] font-mono-tech px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border transition-all ${
                    solenoidOpen
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-rose-950/70 text-rose-300 border-rose-800'
                  }`}
                >
                  {solenoidOpen ? (
                    <>
                      <Unlock className="w-3 h-3 text-emerald-400 animate-bounce" />
                      DOOR UNLOCKED ({solenoidTimer}s)
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-rose-400" />
                      DOOR LOCKED (12V RELAY)
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleManualRelayTrigger}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono-tech cursor-pointer transition border border-slate-700"
                  title="Manual 3s Door Solenoid Override"
                >
                  Pulse Relay
                </button>
              </div>
            </div>

            {/* Simulated 128x64 Micro OLED Screen */}
            <div className="mt-4 p-3.5 rounded-xl bg-black border-2 border-cyan-500/40 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)] font-mono-tech">
              <div className="flex items-center justify-between text-[10px] text-cyan-400/70 pb-1.5 mb-2 border-b border-cyan-900/50">
                <span>[ I2C OLED 128x64 SSD1306 ]</span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                  UART 57600
                </span>
              </div>
              <div className="space-y-1">
                {oledLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`text-xs font-mono-tech tracking-wider ${
                      idx === 0
                        ? 'text-cyan-300 font-bold'
                        : idx === 1
                        ? 'text-teal-400'
                        : line.includes('❌') || line.includes('DENIED')
                        ? 'text-rose-400 font-bold'
                        : line.includes('VERIFIED') || line.includes('UNLOCKED')
                        ? 'text-emerald-400 font-bold'
                        : 'text-cyan-200'
                    }`}
                  >
                    &gt; {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Biometric Scanner Bed with Pulsing LED Ring */}
            <div className="mt-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
              {/* Concentric Scan Rings */}
              <div className="relative flex items-center justify-center">
                {/* Outer LED Halo Ring */}
                <motion.div
                  animate={{
                    scale: isScanning ? [1, 1.08, 1] : 1,
                    boxShadow:
                      scanState === 'MATCHED'
                        ? '0 0 35px rgba(16, 185, 129, 0.7)'
                        : scanState === 'REJECTED'
                        ? '0 0 35px rgba(244, 63, 94, 0.7)'
                        : isScanning
                        ? '0 0 35px rgba(20, 184, 166, 0.8)'
                        : '0 0 15px rgba(6, 182, 212, 0.25)',
                  }}
                  transition={{ duration: 1.2, repeat: isScanning ? Infinity : 0 }}
                  className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-colors duration-300 ${
                    scanState === 'MATCHED'
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : scanState === 'REJECTED'
                      ? 'border-rose-500 bg-rose-950/30'
                      : isScanning
                      ? 'border-teal-400 bg-teal-950/30'
                      : 'border-cyan-500/60 bg-slate-900/80'
                  }`}
                >
                  {/* Interactive Finger Touch Pad */}
                  <button
                    type="button"
                    onClick={() => handleFingerprintTrigger()}
                    disabled={isScanning}
                    className="w-32 h-32 rounded-full flex flex-col items-center justify-center relative cursor-pointer group focus:outline-none"
                  >
                    <Fingerprint
                      className={`w-20 h-20 transition-all duration-300 ${
                        scanState === 'MATCHED'
                          ? 'text-emerald-400 scale-110'
                          : scanState === 'REJECTED'
                          ? 'text-rose-400 scale-95'
                          : isScanning
                          ? 'text-teal-300 scale-105'
                          : 'text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105'
                      }`}
                    />

                    {/* Animated Optical Laser Sweep Line */}
                    {isScanning && (
                      <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: [ -45, 45, -45 ], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-28 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#06b6d4]"
                      />
                    )}
                  </button>
                </motion.div>

                {/* Minutiae coordinate dots */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-6 left-8 w-1.5 h-1.5 rounded-full bg-teal-300 animate-ping" />
                    <span className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                    <span className="absolute top-12 right-12 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  </div>
                )}
              </div>

              {/* Touch instructions */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => handleFingerprintTrigger()}
                  disabled={isScanning}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-semibold text-xs shadow-lg shadow-teal-900/40 transition cursor-pointer flex items-center gap-2 mx-auto"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isScanning ? 'Extracting Ridge Minutiae...' : 'Touch Fingerprint Sensor to Scan'}</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-2 font-mono-tech">
                  Click the sensor bed to simulate placing an enrolled finger
                </p>
              </div>
            </div>
          </div>

          {/* Terminal Test Controls & Person Selector */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-tech flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Terminal Mode & Subject Selector:
              </span>
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthMode('STAFF')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    authMode === 'STAFF' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Staff Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('PATIENT')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    authMode === 'PATIENT' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patient OPD Token
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('STRANGER')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    authMode === 'STRANGER' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Stranger (Reject)
                </button>
              </div>
            </div>

            {/* Context-aware dropdown */}
            {authMode === 'STAFF' && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Select Medical Staff Member:</label>
                  <span className="text-[11px] font-mono-tech text-teal-400">
                    Fingerprint Template: AS608 Slot #0{staff.findIndex((s) => s.id === selectedStaffId) + 1}
                  </span>
                </div>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono-tech"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role} - {s.department}) [Currently: {s.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {authMode === 'PATIENT' && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Select Outpatient for Kiosk Check-In:</label>
                  <span className="text-[11px] font-mono-tech text-cyan-400">
                    Instant Token Generation & Queue
                  </span>
                </div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Age {p.age} - {p.gender}) [{p.id}] - Current Status: {p.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {authMode === 'STRANGER' && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Security Denial Simulation Mode Active</div>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">
                    Testing will trigger a non-enrolled fingerprint biometric mismatch. The system will sound an alarm, lock the door strike, and log a critical security anomaly event.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Template Memory Grid & Hardware Specifications (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AS608 / R307 Flash Memory Matrix */}
          <div
            className={`border rounded-2xl p-5 shadow-xl transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold font-tech uppercase tracking-wider text-slate-200">
                  Sensor Flash Memory (AS608 EEPROM)
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                14 / 256 Slots Used
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Onboard 512-byte fingerprint templates synthesized and stored directly in the sensor flash for offline &lt;0.8s identification:
            </p>

            {/* 16-slot visual grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mt-3">
              {Array.from({ length: 16 }).map((_, i) => {
                const staffMember = staff[i];
                const isOccupied = !!staffMember;
                return (
                  <div
                    key={i}
                    title={
                      isOccupied
                        ? `Slot #${i + 1}: ${staffMember.name} (${staffMember.role}) - Right Index Finger`
                        : `Slot #${i + 1}: [EMPTY] Available for Enrollment`
                    }
                    className={`h-12 rounded-lg border p-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isOccupied
                        ? 'bg-teal-950/60 border-teal-700/80 text-teal-300 hover:bg-teal-900'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Fingerprint className={`w-3.5 h-3.5 ${isOccupied ? 'text-teal-400' : 'text-slate-600'}`} />
                    <span className="text-[9px] font-mono-tech font-bold mt-0.5">
                      #{i + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center font-mono-tech">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">FAR</div>
                <div className="text-xs font-bold text-emerald-400">&lt; 0.001%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">FRR</div>
                <div className="text-xs font-bold text-cyan-400">&lt; 0.1%</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Match Speed</div>
                <div className="text-xs font-bold text-teal-400">&lt; 0.65s</div>
              </div>
            </div>
          </div>

          {/* Technical Hardware Integration Specs */}
          <div
            className={`border rounded-2xl p-5 shadow-xl transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-tech uppercase tracking-wider text-slate-200">
                  Node Hardware Pinout & Wiring
                </h3>
              </div>
              <span className="text-[10px] font-mono-tech text-emerald-400">ESP32-WROOM</span>
            </div>

            <div className="space-y-2 mt-3 text-xs font-mono-tech">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">VCC / GND</span>
                <span className="text-slate-200 font-bold">5.0V DC / Common Rail</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">R307 TX / RX</span>
                <span className="text-teal-300 font-bold">GPIO 16 (RX2) / GPIO 17 (TX2)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Door Strike Relay</span>
                <span className="text-cyan-300 font-bold">GPIO 26 (Optocoupled 12V)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">NeoPixel Ring DIN</span>
                <span className="text-purple-300 font-bold">GPIO 18 (WS2812B 8-LED)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Buzzer Pin</span>
                <span className="text-amber-300 font-bold">GPIO 19 (Piezo PWM)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Biometric Attendance Event Stream */}
      <div
        className={`border rounded-2xl p-5 shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-400" />
              Live IoT Biometric Attendance & Access Feed
            </h3>
            <p className="text-xs text-slate-400">
              Real-time MQTT audit events captured across all hospital fingerprint edge scanners
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono-tech">
              <button
                type="button"
                onClick={() => setLogFilter('ALL')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition ${
                  logFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('STAFF')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition ${
                  logFilter === 'STAFF' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Staff Only
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('PATIENT')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition ${
                  logFilter === 'PATIENT' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Patients (OPD)
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('DENIED')}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer transition ${
                  logFilter === 'DENIED' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Denied
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, ID, node..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono-tech w-48"
              />
            </div>

            {/* CSV Download */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stream Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono-tech uppercase text-[11px]">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Edge Node & Location</th>
                <th className="pb-3 px-3">Individual / Staff ID</th>
                <th className="pb-3 px-3">Modality & Score</th>
                <th className="pb-3 px-3">Event Action</th>
                <th className="pb-3 px-3 text-right">Door Solenoid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-tech">
              <AnimatePresence>
                {filteredLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{log.nodeId}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{log.location}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        {log.personName}
                        {log.tokenNumber && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
                            {log.tokenNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.personId} &bull; {log.role}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-slate-200">{log.modality}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        Match Confidence: {log.confidence}%
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block border ${
                          log.type === 'STAFF_IN'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : log.type === 'STAFF_OUT'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : log.type === 'PATIENT_TOKEN'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`text-[11px] font-bold inline-flex items-center gap-1 ${
                          log.relayAction.includes('UNLOCKED') ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.relayAction.includes('UNLOCKED') ? (
                          <Unlock className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-rose-400" />
                        )}
                        {log.relayAction}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fingerprint Enrollment Modal */}
      <AnimatePresence>
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-teal-500/50 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                    <Fingerprint className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-tech uppercase">
                      Enroll Biometric Fingerprint
                    </h3>
                    <p className="text-xs text-slate-400">
                      R307 2-Pass Minutiae Template Enrollment
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between px-2 text-xs font-mono-tech">
                <span className={enrollStep >= 1 ? 'text-teal-400 font-bold' : 'text-slate-600'}>
                  1. Select Staff
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className={enrollStep >= 2 ? 'text-teal-400 font-bold' : 'text-slate-600'}>
                  2. Scan Passes
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className={enrollStep === 3 ? 'text-teal-400 font-bold' : 'text-slate-600'}>
                  3. Store Flash
                </span>
              </div>

              {enrollStep === 1 && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Target Personnel:
                    </label>
                    <select
                      value={enrollStaffTarget}
                      onChange={(e) => setEnrollStaffTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono-tech"
                    >
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role} - {s.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Finger Selected:
                      </label>
                      <select
                        value={enrollFinger}
                        onChange={(e) => setEnrollFinger(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono-tech"
                      >
                        <option>Right Index Finger</option>
                        <option>Right Thumb</option>
                        <option>Left Index Finger</option>
                        <option>Left Thumb</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        AS608 Flash Slot #:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={256}
                        value={enrollSlotNumber}
                        onChange={(e) => setEnrollSlotNumber(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono-tech"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEnrollStep(2)}
                    className="w-full py-2.5 mt-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer shadow transition"
                  >
                    Proceed to Finger Placement Scan &rarr;
                  </button>
                </div>
              )}

              {enrollStep === 2 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-teal-500/80 bg-teal-950/40 flex items-center justify-center animate-pulse">
                    <Fingerprint className="w-14 h-14 text-teal-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">
                      Place {enrollFinger} on Optical Bed
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Sensor will acquire 2 high-resolution 508 DPI images to synthesize minutiae model
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playCardScan();
                      setTimeout(() => {
                        setEnrollStep(3);
                      }, 1200);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer shadow transition"
                  >
                    Capture & Synthesize Image 1 & 2
                  </button>
                </div>
              )}

              {enrollStep === 3 && (
                <div className="text-center py-6 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">
                      Minutiae Extraction Complete!
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono-tech">
                      Generated 512-byte vector template. Ready to write to Flash Slot #{enrollSlotNumber}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompleteEnrollment}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow transition"
                  >
                    Commit Template to AS608 EEPROM
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
