import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Box,
  Radio,
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Cpu,
  Scale,
  Zap,
  Lock,
  Unlock,
  Sparkles,
  ArrowDown,
  ShieldCheck,
  Check,
  CircleDot,
  PackageCheck,
  Fingerprint,
  ScanFace,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';

export const SmartVendingMachine: React.FC = () => {
  const {
    vendingMachines,
    patients,
    prescriptions,
    dispenseVendingSlot,
    addAuditLog,
    activeTab,
  } = useHospital();

  const [selectedVmId, setSelectedVmId] = useState('VM-01');
  const currentVm = (vendingMachines || []).find((v) => v.id === selectedVmId) || vendingMachines?.[0] || {
    id: 'VM-01',
    name: 'Smart Vending Machine 01',
    location: 'Emergency Corridor A',
    status: 'Online',
    totalSlots: 6,
    activeSlots: 6,
    ipAddress: '192.168.1.101',
    temperatureC: 4.2,
    doorLocked: true,
    slots: [],
  };

  // Auth Simulation State
  const [authMethod, setAuthMethod] = useState<'RFID' | 'NFC' | 'QR' | 'Face' | 'Fingerprint'>('RFID');
  const [selectedPatientId, setSelectedPatientId] = useState('PT-1024');
  const [authStatus, setAuthStatus] = useState<{
    authorized: boolean;
    message: string;
    patientName?: string;
    rxId?: string;
    slotNumber?: number;
  } | null>(null);

  const [dispensingSlot, setDispensingSlot] = useState<number | null>(null);
  const [dispenseProgress, setDispenseProgress] = useState<number>(0);
  const [dispenseStage, setDispenseStage] = useState<number>(1);
  const [dispenseSuccessAnim, setDispenseSuccessAnim] = useState<number | null>(null);
  const [hatchDoorOpen, setHatchDoorOpen] = useState(false);
  const [selectedSlotForInspect, setSelectedSlotForInspect] = useState<number | null>(1);

  // Authenticate patient at vending machine
  const handleAuthenticate = () => {
    soundEffects.playCardScan();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) return;

    // Check if patient has a verified or sent prescription
    const pendingRx = prescriptions.find(
      (r) => r.patientId === patient.id && (r.status === 'Verified' || r.status === 'Sent to Pharmacy')
    );

    if (pendingRx) {
      soundEffects.playSuccessChirp();
      setAuthStatus({
        authorized: true,
        message: `DISPENSING AUTHORIZED: Valid Prescription ${pendingRx.id} found for ${patient.name}. Ready to dispense.`,
        patientName: patient.name,
        rxId: pendingRx.id,
        slotNumber: 1, // Slot 1 default for Paracetamol
      });

      addAuditLog({
        actor: currentVm.id,
        role: 'VENDING IOT',
        action: 'Patient Authenticated at Vending Machine',
        details: `${patient.name} (${patient.id}) authenticated via ${authMethod}. Verified Prescription: ${pendingRx.id}.`,
        category: 'DISPENSARY',
        severity: 'INFO',
        patientId: patient.id,
      });
    } else {
      soundEffects.playEmergencyAlert();
      setAuthStatus({
        authorized: false,
        message: `ACCESS DENIED: No verified or pending prescription found for ${patient.name} (${patient.id}).`,
      });
    }
  };

  // Trigger mechanical dispense transaction with stepped animations
  const handleDispense = (slotNumber: number) => {
    setDispensingSlot(slotNumber);
    setSelectedSlotForInspect(slotNumber);
    setDispenseProgress(5);
    setDispenseStage(1);
    soundEffects.playMechanicalDispense();

    // Stage 1: Motor Engaged (0 - 500ms)
    setTimeout(() => {
      setDispenseProgress(35);
      setDispenseStage(2);
    }, 500);

    // Stage 2: Pushing to Optical Chute (500 - 1100ms)
    setTimeout(() => {
      setDispenseProgress(70);
      setDispenseStage(3);
    }, 1100);

    // Stage 3: Drop Verified & Door Opening (1100 - 1800ms)
    setTimeout(() => {
      setDispenseProgress(100);
      setDispenseStage(4);
      setHatchDoorOpen(true);
      dispenseVendingSlot(currentVm.id, slotNumber, authStatus?.patientName || 'PT-1024 Arun Kumar');
      soundEffects.playSuccessChirp();
      setDispensingSlot(null);
      setDispenseSuccessAnim(slotNumber);

      // Auto close retrieval door after 6 seconds
      setTimeout(() => {
        setDispenseSuccessAnim(null);
        setHatchDoorOpen(false);
      }, 6000);
    }, 1850);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            IoT Smart Medicine Vending Station (VM-01)
          </h2>
          <p className="text-xs text-slate-400">
            Automated spiral motor dispensing, IR optical drop verification, HX711 Load Cell weight telemetry, and patient contactless authorization
          </p>
        </div>

        {/* Machine Selector */}
        <div className="flex items-center gap-2">
          {vendingMachines.map((vm) => (
            <button
              key={vm.id}
              onClick={() => setSelectedVmId(vm.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition border cursor-pointer ${
                selectedVmId === vm.id
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {vm.id} ({vm.location.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Machine Visualizer & Slot Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vending Machine Hardware Status & Patient Auth Terminal */}
        <div className="space-y-4">
          {/* Hardware Telemetry Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold font-tech uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                {currentVm.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono-tech text-[10px] border border-emerald-800 font-bold">
                {currentVm.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">LOCATION</span>
                <span className="text-slate-200">{currentVm.location}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">CONTROLLER</span>
                <span className="text-cyan-300">ESP32-VM01 (v2.4)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">IR DROP SENSOR</span>
                <span className={hatchDoorOpen ? 'text-emerald-400 font-bold animate-pulse' : 'text-emerald-400'}>
                  {hatchDoorOpen ? 'DROP CONFIRMED' : 'ARMED (ACTIVE)'}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">HX711 LOAD CELL</span>
                <span className="text-purple-300">
                  {dispensingSlot ? 'MEASURING...' : hatchDoorOpen ? '14.20g (PAYLOAD)' : 'TARED (0.00g)'}
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Internal Temperature:</span>
              <strong className="text-slate-200 font-mono-tech">4.2°C (Cold Chain Verified)</strong>
            </div>
          </div>

          {/* Patient Authentication Panel */}
          <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Vending Authentication Panel
              </span>
              <span className="text-[10px] font-mono-tech text-slate-400">Step 1: Auth</span>
            </div>

            {/* Auth Method Selector */}
            <div className="grid grid-cols-5 gap-1">
              {(['RFID', 'NFC', 'QR', 'Face', 'Fingerprint'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setAuthMethod(method)}
                  className={`py-1 px-0.5 rounded text-[11px] font-mono-tech transition cursor-pointer truncate ${
                    authMethod === method
                      ? method === 'Face' || method === 'Fingerprint'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {method === 'Fingerprint' ? 'Touch' : method}
                </button>
              ))}
            </div>

            {/* Biometric Scan Indicator */}
            {(authMethod === 'Face' || authMethod === 'Fingerprint') && (
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                <div className="flex items-center gap-2">
                  {authMethod === 'Face' ? (
                    <ScanFace className="w-4 h-4 text-emerald-400 animate-pulse" />
                  ) : (
                    <Fingerprint className="w-4 h-4 text-emerald-400 animate-pulse" />
                  )}
                  <span>
                    {authMethod === 'Face' ? 'Biometric Face Mesh (99.4% Liveness)' : '508 DPI Capacitive Touch Sensor'}
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-200">
                  Ready
                </span>
              </div>
            )}

            {/* Patient Select */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Select Patient Simulating Scan:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAuthenticate}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2 font-tech uppercase tracking-wider cursor-pointer"
            >
              {authMethod === 'Face' ? (
                <ScanFace className="w-3.5 h-3.5 text-emerald-300" />
              ) : authMethod === 'Fingerprint' ? (
                <Fingerprint className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Radio className="w-3.5 h-3.5" />
              )}
              <span>Simulate {authMethod} Scan</span>
            </button>

            {/* Auth Status Box with AnimatePresence */}
            <AnimatePresence mode="wait">
              {authStatus && (
                <motion.div
                  key={authStatus.authorized ? 'auth-success' : 'auth-fail'}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`p-3 rounded-xl border text-xs ${
                    authStatus.authorized
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                      : 'bg-rose-950/80 border-rose-600 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {authStatus.authorized ? (
                      <Unlock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[11px]">
                        {authStatus.authorized ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed">{authStatus.message}</p>
                      {authStatus.authorized && authStatus.slotNumber && (
                        <div className="mt-2 pt-1.5 border-t border-emerald-800/80 flex items-center justify-between">
                          <span className="font-mono-tech text-[10px]">
                            Assigned: Slot 0{authStatus.slotNumber}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDispense(authStatus.slotNumber!)}
                            disabled={dispensingSlot !== null}
                            className="px-2.5 py-1 rounded bg-white text-emerald-900 font-bold text-[11px] hover:bg-emerald-100 transition shadow cursor-pointer"
                          >
                            Dispense Now →
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mechanical Retrieval Chute & Door Simulation */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-tech uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4" />
                Medication Retrieval Hatch
              </span>
              <span
                className={`text-[9px] font-mono-tech font-bold px-2 py-0.5 rounded uppercase border transition-colors ${
                  hatchDoorOpen
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {hatchDoorOpen ? 'HATCH UNLOCKED' : 'LOCKED'}
              </span>
            </div>

            {/* Retrieval Door Visualizer */}
            <div className="relative h-28 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-end p-3">
              {/* Internal Chamber Background with glow */}
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  hatchDoorOpen ? 'bg-emerald-950/40 opacity-100' : 'bg-slate-950 opacity-90'
                }`}
              />

              {/* Dispensed Medication Payload in Chamber */}
              <AnimatePresence>
                {hatchDoorOpen && (
                  <motion.div
                    initial={{ y: -60, scale: 0.8, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    className="relative z-10 mb-2 p-2 rounded-lg bg-emerald-600 text-white font-mono-tech text-xs font-bold shadow-xl shadow-emerald-950 flex items-center gap-2 border border-emerald-300"
                  >
                    <Box className="w-4 h-4" />
                    <span>PARACETAMOL 500mg</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.4, 1] }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Motorized Sliding Hatch Door */}
              <motion.div
                initial={false}
                animate={{
                  y: hatchDoorOpen ? -55 : 0,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 24 }}
                className="absolute bottom-0 left-2 right-2 h-14 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg border-t-2 border-cyan-400 shadow-2xl flex items-center justify-center text-[10px] font-mono-tech font-bold text-slate-300 z-20"
              >
                <div className="flex items-center gap-1.5">
                  <ArrowDown className={`w-3.5 h-3.5 ${hatchDoorOpen ? 'text-emerald-400 animate-bounce' : 'text-cyan-400'}`} />
                  <span>{hatchDoorOpen ? 'PUSH CHUTE TO RETRIEVE' : 'AUTOMATED DROP CHUTE DOOR'}</span>
                </div>
              </motion.div>
            </div>

            {hatchDoorOpen && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setHatchDoorOpen(false)}
                className="w-full mt-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-semibold font-mono-tech flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Medication Collected (Close Hatch)</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Interactive Slot Matrix & Dispense Flow */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Dispensing Transaction HUD (Framer Motion Pipeline) */}
          <AnimatePresence>
            {dispensingSlot !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-400 rounded-xl p-4 shadow-2xl shadow-cyan-950 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <RotateCw className="w-4 h-4 text-cyan-400" />
                    </motion.div>
                    <span className="text-xs font-bold font-tech uppercase text-cyan-300 tracking-wider">
                      DISPENSING TRANSACTION IN PROGRESS: SLOT 0{dispensingSlot}
                    </span>
                  </div>
                  <span className="text-xs font-mono-tech text-white font-bold">{dispenseProgress}%</span>
                </div>

                {/* Animated Smooth Progress Bar */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-cyan-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    initial={{ width: '5%' }}
                    animate={{ width: `${dispenseProgress}%` }}
                    transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                  />
                </div>

                {/* Stepped Process Indicators */}
                <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] font-mono-tech">
                  <div className={`p-1.5 rounded border transition-colors ${dispenseStage >= 1 ? 'bg-cyan-950 border-cyan-600 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    1. Motor Rotating
                  </div>
                  <div className={`p-1.5 rounded border transition-colors ${dispenseStage >= 2 ? 'bg-cyan-950 border-cyan-600 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    2. Pushing to Chute
                  </div>
                  <div className={`p-1.5 rounded border transition-colors ${dispenseStage >= 3 ? 'bg-cyan-950 border-cyan-600 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    3. IR Drop Detect
                  </div>
                  <div className={`p-1.5 rounded border transition-colors ${dispenseStage >= 4 ? 'bg-emerald-950 border-emerald-600 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    4. Scale Tare OK
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold font-tech uppercase text-slate-200 tracking-wider">
                  Vending Machine Slots Matrix (6 Slots)
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time stock level, spiral motor state, IR drop detection & HX711 load cell telemetry
                </p>
              </div>
              <span className="text-[11px] font-mono-tech text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                6 / 6 Slots Active
              </span>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(currentVm?.slots || []).map((slot) => {
                const isDispensingThis = dispensingSlot === slot.slotNumber;
                const isJustDispensed = dispenseSuccessAnim === slot.slotNumber;
                const isSelected = selectedSlotForInspect === slot.slotNumber;
                const stockPct = Math.round((slot.currentStock / slot.maxCapacity) * 100);

                return (
                  <motion.div
                    key={slot.slotNumber}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedSlotForInspect(slot.slotNumber)}
                    className={`bg-slate-950 border rounded-xl p-3 flex flex-col justify-between transition-all duration-200 relative overflow-hidden cursor-pointer ${
                      isDispensingThis
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-950'
                        : isJustDispensed
                        ? 'border-emerald-500 ring-2 ring-emerald-500/50 bg-emerald-950/20'
                        : isSelected
                        ? 'border-cyan-600/70 bg-slate-900/80 shadow-md'
                        : slot.isExpired
                        ? 'border-rose-900/80 bg-rose-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Slot Header */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono-tech font-bold px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                          SLOT {slot.slotNumber.toString().padStart(2, '0')}
                        </span>
                        <span
                          className={`text-[9px] font-mono-tech font-bold uppercase px-1.5 py-0.5 rounded transition-colors ${
                            slot.motorStatus === 'RUNNING' || isDispensingThis
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                              : isJustDispensed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : slot.isExpired
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {isDispensingThis ? 'ROTATING' : isJustDispensed ? 'DISPENSED' : slot.motorStatus}
                        </span>
                      </div>

                      {/* Medicine Info */}
                      <div className="font-semibold text-xs text-slate-100">{slot.medicineName}</div>
                      <div className="text-[11px] text-slate-400 font-mono-tech">{slot.strength}</div>

                      {/* Stock Level Gauge */}
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
                          <span>Stock: {slot.currentStock} / {slot.maxCapacity}</span>
                          <span className={stockPct <= 25 ? 'text-amber-400' : 'text-emerald-400'}>
                            {stockPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${stockPct <= 25 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stockPct}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Sensor Telemetry Badges */}
                      <div className="mt-3 pt-2 border-t border-slate-900 grid grid-cols-2 gap-1.5 text-[10px] font-mono-tech">
                        <div className="p-1 rounded bg-slate-900/90 text-slate-400">
                          <span className="block text-[8px] text-slate-500">IR SENSOR</span>
                          <span className={slot.irSensorStatus === 'DETECTED' || isJustDispensed ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {isJustDispensed ? 'DROP VERIFIED' : slot.irSensorStatus}
                          </span>
                        </div>

                        <div className="p-1 rounded bg-slate-900/90 text-slate-400">
                          <span className="block text-[8px] text-slate-500">LOAD CELL</span>
                          <span className="text-purple-300 font-bold">
                            {slot.loadCellGrams.toFixed(1)}g
                          </span>
                        </div>
                      </div>

                      {/* Expiry Badge */}
                      <div className="mt-2 text-[10px] font-mono-tech flex items-center justify-between">
                        <span className="text-slate-500">EXP: {slot.expiryDate}</span>
                        {slot.isExpired ? (
                          <span className="text-rose-400 font-bold">EXPIRED (LOCKED)</span>
                        ) : slot.isExpiringSoon ? (
                          <span className="text-amber-400 font-bold">EXPIRING SOON</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">SAFE</span>
                        )}
                      </div>
                    </div>

                    {/* Dispense Action Button with spring pop */}
                    <div className="mt-3 pt-2 border-t border-slate-800">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispense(slot.slotNumber);
                        }}
                        disabled={isDispensingThis || slot.isExpired || slot.currentStock === 0}
                        className={`w-full py-1.5 rounded-lg text-xs font-semibold font-tech uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isDispensingThis
                            ? 'bg-cyan-600 text-white animate-pulse cursor-not-allowed'
                            : slot.isExpired
                            ? 'bg-slate-900 text-rose-500 cursor-not-allowed border border-rose-900/50'
                            : slot.currentStock === 0
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                            : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300'
                        }`}
                      >
                        {isDispensingThis ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Dispensing...</span>
                          </>
                        ) : isJustDispensed ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: [0.8, 1.2, 1] }}
                            className="flex items-center gap-1 text-emerald-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Dispensed!</span>
                          </motion.div>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span>Test Dispense</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
