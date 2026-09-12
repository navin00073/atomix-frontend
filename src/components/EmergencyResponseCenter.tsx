import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  HeartPulse,
  Clock,
  MapPin,
  UserCheck,
  Stethoscope,
  Pill,
  Shield,
  Activity,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  Phone,
  Radio,
  Crosshair,
  FileText,
  RotateCcw,
  Check,
  Flame,
  ArrowRight,
  Volume2,
  Cpu,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { EmergencyIncident, EmergencyStageNumber } from '../types';
import { DEMO_PRESET_EMERGENCIES } from '../data/emergencyData';

export const EmergencyResponseCenter: React.FC = () => {
  const {
    emergencies,
    activeEmergency,
    triggerEmergencyAlert,
    advanceEmergencyStage,
    assignDoctorToEmergency,
    assignNurseToEmergency,
    dispatchEmergencyTeam,
    prepareEmergencyMedicine,
    markTeamReached,
    resolveEmergency,
    theme,
    setActiveTab,
    staff,
  } = useHospital();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    activeEmergency ? activeEmergency.id : emergencies[0]?.id || 'EMG-2026-01'
  );
  const [outcomeNotesInput, setOutcomeNotesInput] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('DOC-01');
  const [showFloorPlanDetail, setShowFloorPlanDetail] = useState(true);

  // Get currently selected incident
  const currentIncident: EmergencyIncident = useMemo(() => {
    return (
      emergencies.find((e) => e.id === selectedIncidentId) ||
      activeEmergency ||
      emergencies[0]
    );
  }, [emergencies, selectedIncidentId, activeEmergency]);

  const doctorsList = useMemo(() => {
    return staff.filter((s) => s.role === 'Doctor');
  }, [staff]);

  const nursesList = useMemo(() => {
    return staff.filter((s) => s.role === 'Nurse');
  }, [staff]);

  if (!currentIncident) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-semibold text-slate-200">No Emergency Incidents Active</h3>
        <p className="text-sm mt-1 mb-4">Initialize a simulated Code Blue event to test response orchestration.</p>
        <button
          onClick={() => triggerEmergencyAlert(0)}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 inline-flex items-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4" /> Trigger Simulated Code Blue
        </button>
      </div>
    );
  }

  const isResolved = currentIncident.status === 'RESOLVED';
  const isCritical = currentIncident.severity === 'CRITICAL';
  const stage = currentIncident.currentStage;

  // Format countdown minutes and seconds
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Code Blue Live Pulse Alert */}
      <div
        className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
          isResolved
            ? 'bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
            : 'bg-red-950/40 border-red-500/50 shadow-2xl shadow-red-950/40'
        }`}
      >
        {/* Animated Scan Line for active alert */}
        {!isResolved && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500/80 to-transparent top-0 animate-pulse" />
            <div className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-red-500/80 to-transparent left-0 animate-pulse" />
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Incident Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isResolved
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
              }`}
            >
              {isResolved ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <HeartPulse className="w-8 h-8 animate-bounce" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isResolved
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-500/30 border-red-500/60 text-red-200'
                  }`}
                >
                  {currentIncident.code}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                  {currentIncident.id}
                </span>
                <span
                  className={`text-xs font-mono uppercase font-semibold px-2 py-0.5 rounded-md ${
                    isResolved
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                      : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                  }`}
                >
                  Status: {currentIncident.status}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {currentIncident.title}
              </h2>

              <p className="text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentIncident.location.floor} • {currentIncident.location.room} (
                  <strong className="text-white">{currentIncident.location.bed}</strong>)
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  Source:{' '}
                  <strong className="text-amber-300">{currentIncident.detectionSource}</strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Time: {currentIncident.detectedAt}</span>
              </p>
            </div>
          </div>

          {/* Incident Timers & Quick Response Bar */}
          <div className="flex flex-wrap items-center gap-4 lg:self-center">
            {/* Target 3-min Countdown Clock */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-4">
              <div>
                <span className="block text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                  {isResolved ? 'Total Duration' : 'Target Window (3m)'}
                </span>
                <span
                  className={`text-2xl font-mono font-bold tracking-tight ${
                    isResolved
                      ? 'text-emerald-400'
                      : currentIncident.countdownSeconds < 60
                      ? 'text-red-400 animate-pulse'
                      : 'text-amber-400'
                  }`}
                >
                  {isResolved
                    ? `${Math.floor(currentIncident.elapsedSeconds / 60)}m ${currentIncident.elapsedSeconds % 60}s`
                    : formatTimer(currentIncident.countdownSeconds)}
                </span>
              </div>
              <Clock className="w-6 h-6 text-slate-500" />
            </div>

            {/* Quick Demo Presets Trigger */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-trigger-code-blue"
                type="button"
                onClick={() => triggerEmergencyAlert(0)}
                title="Trigger Cardiac Code Blue Preset"
                className="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-900/30 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Cardiac Blue</span>
              </button>
              <button
                id="btn-trigger-trauma"
                type="button"
                onClick={() => triggerEmergencyAlert(1)}
                title="Trigger Trauma Alert Preset"
                className="px-3 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-900/30 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Trauma Alert</span>
              </button>
              <button
                id="btn-trigger-stroke"
                type="button"
                onClick={() => triggerEmergencyAlert(2)}
                title="Trigger Code Stroke Preset"
                className="px-3 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Code Stroke</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Switcher Pills if multiple emergencies exist */}
      {emergencies.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0">
            Active Records:
          </span>
          {emergencies.map((emg) => {
            const isSelected = emg.id === currentIncident.id;
            return (
              <button
                key={emg.id}
                onClick={() => setSelectedIncidentId(emg.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    emg.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-red-400 animate-ping'
                  }`}
                />
                <span className="font-semibold">{emg.code}</span>
                <span className="text-slate-500">({emg.patientName})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid: 7-Stage Response Workflow Tracker & Patient Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Step-by-Step Response Workflow Progress Tracker */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Code Blue Orchestration Workflow (7 Stages)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated dispatch pipeline from sensor detection through bedside resuscitation sign-off.
                </p>
              </div>

              {!isResolved && (
                <button
                  id="btn-advance-emergency-stage"
                  onClick={() => advanceEmergencyStage(currentIncident.id)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  <span>Advance Stage ({stage}/7)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 7-Step Progress Pipeline */}
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-6 left-6 right-6 h-0.5 bg-slate-800 z-0">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((stage - 1) / 6) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:gap-2 relative z-10">
                {currentIncident.stageHistory.map((s) => {
                  const isCompleted = s.completed;
                  const isCurrent = stage === s.stage && !isResolved;

                  return (
                    <div
                      key={s.stage}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                          : isCompleted
                          ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                            isCurrent
                              ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : s.stage}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-1">
                          {s.timestamp}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h4
                          className={`text-xs font-semibold leading-snug ${
                            isCurrent
                              ? 'text-cyan-200'
                              : isCompleted
                              ? 'text-slate-100'
                              : 'text-slate-500'
                          }`}
                        >
                          {s.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {s.actor}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Bar for Current Stage */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Current Stage:{' '}
                <strong className="text-cyan-300">
                  {currentIncident.stageHistory[stage - 1]?.title || 'Protocol in motion'}
                </strong>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {stage === 3 && (
                  <button
                    onClick={() => assignNurseToEmergency(currentIncident.id, 'NUR-01')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Acknowledge Nurse (12m away)
                  </button>
                )}

                {stage === 4 && (
                  <button
                    onClick={() => assignDoctorToEmergency(currentIncident.id, selectedDoctorId)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> Assign Dr. Anand Verma MD
                  </button>
                )}

                {stage === 5 && (
                  <button
                    onClick={() => {
                      prepareEmergencyMedicine(currentIncident.id, 'MED-09');
                      advanceEmergencyStage(currentIncident.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pill className="w-3.5 h-3.5" /> Auto-Dispense Epinephrine Kit
                  </button>
                )}

                {stage === 6 && (
                  <button
                    onClick={() => markTeamReached(currentIncident.id)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Team At Bedside (NFC Tap)
                  </button>
                )}

                {!isResolved ? (
                  <button
                    id="btn-resolve-emergency"
                    onClick={() => resolveEmergency(currentIncident.id, outcomeNotesInput || 'Patient rhythm stabilized; transfer to ICU telemetry.')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Sign Off & Resolve Code Blue
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Resuscitation Complete • Resolved at {currentIncident.resolvedAt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Responders & Required Emergency Medicines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responders Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Assigned Rapid Responders
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  All GPS Positioned
                </span>
              </div>

              {/* Nearest Nurse */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                      Nearest Nurse (ICU Lead)
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {currentIncident.assignedNurse.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Distance: <strong className="text-cyan-300">{currentIncident.assignedNurse.distanceMeters}m</strong> • ETA: {currentIncident.assignedNurse.etaSeconds}s
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-1 rounded-md ${
                    currentIncident.assignedNurse.acknowledged
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-700/60 animate-pulse'
                  }`}
                >
                  {currentIncident.assignedNurse.acknowledged ? 'Acknowledged' : 'Paging...'}
                </span>
              </div>

              {/* Assigned Doctor */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                      Critical Care Physician
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {currentIncident.assignedDoctor.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {currentIncident.assignedDoctor.specialization} • Pager: {currentIncident.assignedDoctor.contact}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-1 rounded-md ${
                    currentIncident.assignedDoctor.acknowledged
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                  }`}
                >
                  {currentIncident.assignedDoctor.acknowledged ? 'En Route' : 'Assigned'}
                </span>
              </div>

              {/* Team Dispatch */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                      Response Team
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {currentIncident.emergencyTeam?.name || 'Rapid Response Team Alpha'}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Status: <strong className="text-amber-300">{currentIncident.emergencyTeam?.status || 'En Route'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dispatchEmergencyTeam(currentIncident.id, 'Code Blue Team 1')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 cursor-pointer"
                >
                  Reassign
                </button>
              </div>
            </div>

            {/* Required Emergency Medicine Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-400" />
                  Emergency Resuscitation Drugs
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  Smart Vending Linked
                </span>
              </div>

              <div className="space-y-2.5">
                {currentIncident.requiredMedicines.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{med.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {med.route}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Dose: <strong className="text-cyan-300">{med.dosage}</strong> • Source: {med.source}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {med.prepared ? (
                        <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-700/60 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => prepareEmergencyMedicine(currentIncident.id, med.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-mono text-[11px] font-semibold transition-all shadow-sm cursor-pointer"
                        >
                          Dispense
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Equipment Verification */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block mb-2 font-semibold">
                  Required Emergency Equipment
                </span>
                <div className="space-y-1.5">
                  {currentIncident.requiredEquipment.map((eq, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/40 border border-slate-800/60"
                    >
                      <span className="text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {eq.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{eq.location}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Patient Profile & Hospital Floor Map Navigation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Profile Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-400" />
                Emergency Subject Vitals
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50">
                {currentIncident.bloodGroup} Blood Group
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-white">
                {currentIncident.patientName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-white truncate">
                  {currentIncident.patientName}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {currentIncident.patientId} • {currentIncident.age}y / {currentIncident.gender}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block uppercase">Building</span>
                <span className="font-semibold text-slate-200 truncate block">
                  {currentIncident.location.building}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] text-slate-500 block uppercase">Room & Bed</span>
                <span className="font-semibold text-cyan-300 truncate block">
                  {currentIncident.location.bed} ({currentIncident.location.room.split(' ')[0]})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5 font-semibold">
                Attending Physician Resuscitation Notes:
              </label>
              <textarea
                value={outcomeNotesInput}
                onChange={(e) => setOutcomeNotesInput(e.target.value)}
                placeholder={currentIncident.outcomeNotes || 'Log clinical observations, defibrillation Joules, drug responses...'}
                rows={3}
                className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Interactive Hospital Floor Map / Indoor Navigation */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Indoor Navigation & Fleet Vector
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Level 3 East Wing • Live Positioning Mesh
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFloorPlanDetail(!showFloorPlanDetail)}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {showFloorPlanDetail ? 'Compact' : 'Expanded'}
              </button>
            </div>

            {/* SVG Interactive Floorplan */}
            <div className="relative rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden aspect-[4/3] flex items-center justify-center">
              <svg viewBox="0 0 500 350" className="w-full h-full">
                {/* Floor Grid */}
                <defs>
                  <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="500" height="350" fill="url(#grid)" />

                {/* Hospital Wing Layout Outlines */}
                {/* ICU Ward Zone */}
                <rect x="260" y="40" width="210" height="150" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="8" />
                <text x="275" y="65" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  ICU / CARDIAC WING
                </text>

                {/* Bed Bays */}
                <rect x="340" y="90" width="55" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="4" />
                <text x="348" y="115" fill="#cbd5e1" fontSize="9" fontFamily="monospace">Bed 12</text>

                <rect x="405" y="90" width="55" height="40" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="4" />
                <text x="413" y="115" fill="#64748b" fontSize="9" fontFamily="monospace">Bed 14</text>

                {/* Central Corridor */}
                <rect x="50" y="160" width="380" height="40" fill="#020617" stroke="#1e293b" strokeWidth="1" />
                <text x="60" y="185" fill="#475569" fontSize="9" fontFamily="monospace">
                  CENTRAL MAIN CORRIDOR (Level 3)
                </text>

                {/* Smart Vending VM-01 Station */}
                <rect x="70" y="60" width="130" height="80" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" rx="8" />
                <text x="80" y="85" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  SMART VM-01 CRASH
                </text>

                {/* Nurse Station */}
                <rect x="180" y="220" width="150" height="90" fill="#0f172a" stroke="#334155" strokeWidth="1.5" rx="8" />
                <text x="195" y="245" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  NURSE STATION 3A
                </text>

                {/* Rapid Response Team Vector Path (Dotted animated route line) */}
                <path
                  d="M 190 260 L 190 180 L 365 180 L 365 135"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  strokeDasharray="6,4"
                  className="animate-pulse"
                />

                {/* Medicine Delivery Rover Path */}
                <path
                  d="M 135 140 L 135 180 L 365 180"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Nurse Position Node */}
                <circle cx="190" cy="260" r="7" fill="#3b82f6" stroke="#93c5fd" strokeWidth="2" />
                <text x="170" y="285" fill="#93c5fd" fontSize="9" fontFamily="monospace">Nurse (12m)</text>

                {/* Doctor Position Node */}
                <circle cx="80" cy="280" r="7" fill="#6366f1" stroke="#c7d2fe" strokeWidth="2" />
                <text x="60" y="305" fill="#c7d2fe" fontSize="9" fontFamily="monospace">Dr. Verma</text>

                {/* Patient / Emergency Critical Pulse Marker */}
                <circle cx="367" cy="110" r="16" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
                <circle cx="367" cy="110" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                <text x="330" y="80" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  CODE BLUE
                </text>

                {/* Rover RB-01 Node */}
                <rect x="230" y="172" width="16" height="16" fill="#10b981" rx="3" stroke="#fff" strokeWidth="1" />
                <text x="220" y="202" fill="#34d399" fontSize="8" fontFamily="monospace">RB-01</text>
              </svg>

              {/* Map Overlay Badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Live Telemetry: Active
              </div>
            </div>

            {/* Map Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Patient Bed 12
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Nurse Deepa V.
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-emerald-500" /> Dispenser VM-01
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Attending Physician
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
