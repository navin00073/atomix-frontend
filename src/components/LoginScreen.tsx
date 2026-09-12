import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Radio,
  Sparkles,
  ArrowRight,
  UserCheck,
  Stethoscope,
  Pill,
  HeartPulse,
  Fingerprint,
  ScanFace,
  Camera,
  Scan,
  Check,
  RefreshCw,
  Sliders,
  KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHospital } from '../context/HospitalContext';
import { DEMO_USERS } from '../data/userData';
import { soundEffects } from '../utils/audio';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { login, addAuditLog, theme } = useHospital();

  // Auth Mode State: CREDENTIALS or BIOMETRIC
  const [authMode, setAuthMode] = useState<'CREDENTIALS' | 'BIOMETRIC'>('CREDENTIALS');
  const [biometricType, setBiometricType] = useState<'FINGERPRINT' | 'FACE'>('FINGERPRINT');
  const [selectedBioUser, setSelectedBioUser] = useState<(typeof DEMO_USERS)[0]>(DEMO_USERS[0]);

  // Form State
  const [email, setEmail] = useState('doctor@atomix.med');
  const [password, setPassword] = useState('atomix2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Biometric Scanning Simulation State
  const [bioScanState, setBioScanState] = useState<'IDLE' | 'SCANNING' | 'MATCHED' | 'ERROR'>('IDLE');
  const [bioScanProgress, setBioScanProgress] = useState(0);
  const [bioStatusText, setBioStatusText] = useState('Place finger on biometric scanner or align face');
  const [useWebcamForFace, setUseWebcamForFace] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop webcam on unmount or mode switch
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [webcamStream]);

  // Handle webcam activation for Face Biometrics
  const toggleWebcam = async () => {
    if (useWebcamForFace) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((t) => t.stop());
        setWebcamStream(null);
      }
      setUseWebcamForFace(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        setWebcamStream(stream);
        setUseWebcamForFace(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setErrorMessage('Unable to access webcam. Switching to neural simulated scan.');
        setUseWebcamForFace(false);
      }
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your medical staff work email or terminal ID.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your authentication password or PIN.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate enterprise LDAP / credential verification latency
      await new Promise((resolve) => setTimeout(resolve, 750));

      const result = await login(email, password, rememberMe);
      if (result.success) {
        soundEffects.playSuccessChirp();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric Scan Trigger
  const handleBiometricScan = async () => {
    if (bioScanState === 'SCANNING') return;
    setErrorMessage(null);
    setBioScanState('SCANNING');
    setBioScanProgress(15);
    soundEffects.playCardScan();
    setBioStatusText(
      biometricType === 'FINGERPRINT'
        ? 'Acquiring 508 DPI capacitive ridge pattern...'
        : 'Aligning 68-point neural facial landmark vector...'
    );

    // Step 1: Minutiae analysis
    setTimeout(() => {
      setBioScanProgress(55);
      setBioStatusText(
        biometricType === 'FINGERPRINT'
          ? 'Minutiae points detected (52 points). Generating SHA-256 hash...'
          : 'Liveness verified (Positive). Extracting 512-D FaceNet tensor...'
      );
    }, 450);

    // Step 2: Match against hospital registry
    setTimeout(() => {
      setBioScanProgress(85);
      setBioStatusText(`Matching vector with hospital LDAP: ${selectedBioUser.name} (${selectedBioUser.badgeId})...`);
    }, 900);

    // Step 3: Authorization Success
    setTimeout(async () => {
      setBioScanProgress(100);
      setBioScanState('MATCHED');
      soundEffects.playSuccessChirp();
      setBioStatusText(`BIOMETRIC CLEARANCE GRANTED: 99.8% Match for ${selectedBioUser.name}`);

      addAuditLog({
        actor: selectedBioUser.name,
        role: selectedBioUser.role,
        action: 'Biometric Staff Authentication',
        details: `${selectedBioUser.name} authenticated via ${biometricType} Biometrics. Badge: ${selectedBioUser.badgeId}. Terminal: ICCU-GW-04.`,
        category: 'IDENTIFICATION',
        severity: 'INFO',
      });

      // Log in the user
      setTimeout(async () => {
        const res = await login(selectedBioUser.email, selectedBioUser.password, rememberMe);
        if (res.success && onSuccess) {
          onSuccess();
        }
      }, 700);
    }, 1400);
  };

  const selectDemoUser = (user: (typeof DEMO_USERS)[0]) => {
    setEmail(user.email);
    setPassword(user.password);
    setSelectedBioUser(user);
    setErrorMessage(null);
  };

  return (
    <div
      id="login-screen-root"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b14] text-slate-100 font-sans select-none"
    >
      {/* Dynamic Background: Medical Command Lattice & Tech Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep ambient glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-blue-700/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[180px]" />

        {/* Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Subtle glowing telemetry scan line */}
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent top-1/4 animate-pulse" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-4 my-8 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Left Side: Hospital Command Intelligence Briefing */}
        <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90">
          <div>
            {/* Hospital AI Brand Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-300/30">
                <HeartPulse className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                    AtomiX Health
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold tracking-wider">
                    v4.8 AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono tracking-wide">
                  Autonomous Hospital Command Center
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Unified real-time clinical operating system integrating multi-modal biometric security, AI vision triage, robotic pharmacy delivery, IoT telemetry, and instant Code Blue orchestration.
            </p>

            {/* Live Command Center Telemetry Pills */}
            <div className="space-y-2.5 mb-8">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <Fingerprint className="w-4 h-4 text-emerald-400" /> Biometric Multi-Modal Engine
                </span>
                <span className="font-mono font-semibold text-emerald-300">Face & Fingerprint Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <Activity className="w-4 h-4 text-cyan-400" /> Active Patient Monitors
                </span>
                <span className="font-mono font-semibold text-cyan-300">128 Online</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <Cpu className="w-4 h-4 text-amber-400" /> Emergency Code Blue Dispatch
                </span>
                <span className="font-mono font-semibold text-amber-300">Automated L3</span>
              </div>
            </div>

            {/* Quick 1-Click Demo Profiles */}
            <div className="border-t border-slate-800/80 pt-5">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Select Staff Profile for Login
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEMO_USERS.map((user) => {
                  const isSelected = selectedBioUser.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectDemoUser(user)}
                      className={`text-left p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-center cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                          : 'border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-medium truncate text-white">
                          {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
                        </span>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                            : user.role === 'DOCTOR'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                            : user.role === 'PHARMACIST'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : user.role === 'NURSE'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate mt-0.5">
                        {user.title.split('/')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Compliance & Security Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> FIDO2 / WebAuthn Tier 4
            </span>
            <span>AES-256 Biometric Vector Hashed</span>
          </div>
        </div>

        {/* Right Side: Secure Authentication Form & Biometric Scanner */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-slate-900/60">
          <div className="max-w-md w-full mx-auto">
            {/* Terminal Status Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Terminal Online • Node ID: ICCU-GW-04
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
              Medical Staff Sign In
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Choose your authentication protocol: password credentials or instant biometric verification.
            </p>

            {/* Authentication Protocol Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('CREDENTIALS');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMode === 'CREDENTIALS'
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password / PIN</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('BIOMETRIC');
                  setErrorMessage(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                  authMode === 'BIOMETRIC'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span className="flex items-center gap-1">
                  Biometric Auth
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                id="login-error-alert"
                className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-shake shadow-lg shadow-red-950/30"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-300 uppercase font-mono">Authentication Refused</p>
                  <p className="text-red-200/90 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* TAB 1: BIOMETRIC AUTHENTICATION INTERFACE */}
            {authMode === 'BIOMETRIC' ? (
              <div className="space-y-4">
                {/* Biometric Sub-Method Switcher (Fingerprint vs Face) */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider">
                    Biometric Sensor:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setBiometricType('FINGERPRINT');
                        setBioScanState('IDLE');
                        setBioScanProgress(0);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                        biometricType === 'FINGERPRINT'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Fingerprint</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBiometricType('FACE');
                        setBioScanState('IDLE');
                        setBioScanProgress(0);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                        biometricType === 'FACE'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>Face ID</span>
                    </button>
                  </div>
                </div>

                {/* Selected Staff Biometric Card */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs border border-cyan-400/40">
                      {selectedBioUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{selectedBioUser.name}</div>
                      <div className="text-[10px] font-mono text-cyan-400">
                        {selectedBioUser.badgeId} • {selectedBioUser.role}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    Enrolled
                  </span>
                </div>

                {/* VISUAL SCANNER BOX */}
                <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-5 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  {/* FINGERPRINT INTERACTIVE SCANNER */}
                  {biometricType === 'FINGERPRINT' ? (
                    <div
                      onClick={handleBiometricScan}
                      className="relative w-36 h-36 rounded-full flex items-center justify-center cursor-pointer group my-2"
                    >
                      {/* Concentric Glowing Scanner Rings */}
                      <div
                        className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                          bioScanState === 'SCANNING'
                            ? 'border-emerald-400 animate-spin border-t-transparent shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                            : bioScanState === 'MATCHED'
                            ? 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                            : 'border-slate-700 group-hover:border-cyan-400/80 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                        }`}
                      />
                      <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/40 animate-pulse" />

                      {/* Fingerprint Vector Graphic */}
                      <Fingerprint
                        className={`w-20 h-20 transition-all duration-300 ${
                          bioScanState === 'SCANNING'
                            ? 'text-emerald-400 scale-105'
                            : bioScanState === 'MATCHED'
                            ? 'text-emerald-300 scale-105'
                            : 'text-cyan-400 group-hover:text-cyan-300'
                        }`}
                      />

                      {/* Laser sweep animation line */}
                      {bioScanState === 'SCANNING' && (
                        <motion.div
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: [ -45, 45, -45 ], opacity: [ 0.2, 1, 0.2 ] }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                          className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent shadow-[0_0_12px_#10b981]"
                        />
                      )}
                    </div>
                  ) : (
                    /* FACE RECOGNITION HUD VIEWPORT */
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center my-1">
                      {useWebcamForFace ? (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        /* Simulated Neural Face Mesh SVG */
                        <svg className="w-full h-full text-cyan-500/80" viewBox="0 0 200 140">
                          {/* Face Outline Hologram */}
                          <ellipse cx="100" cy="65" rx="35" ry="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                          {/* Eyes & Landmarks */}
                          <circle cx="85" cy="55" r="4" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
                          <circle cx="115" cy="55" r="4" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
                          <circle cx="85" cy="55" r="1.5" fill="#00f0ff" />
                          <circle cx="115" cy="55" r="1.5" fill="#00f0ff" />
                          {/* Nose bridge & mouth */}
                          <path d="M 100 55 L 98 72 L 103 72" fill="none" stroke="currentColor" strokeWidth="1" />
                          <path d="M 88 88 Q 100 95 112 88" fill="none" stroke="currentColor" strokeWidth="1" />
                          {/* Landmark nodes */}
                          {[
                            [75, 40], [125, 40], [100, 30],
                            [68, 65], [132, 65],
                            [80, 102], [120, 102], [100, 108],
                          ].map(([x, y], i) => (
                            <circle key={i} cx={x} cy={y} r="1.5" fill="#10b981" opacity="0.8" />
                          ))}
                        </svg>
                      )}

                      {/* HUD Corners */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                      {/* Laser Scan Beam */}
                      {bioScanState === 'SCANNING' && (
                        <motion.div
                          animate={{ y: [-70, 70, -70] }}
                          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                          className="absolute inset-x-2 h-0.5 bg-cyan-400 shadow-[0_0_10px_#00f0ff]"
                        />
                      )}

                      {/* Live Telemetry Overlay */}
                      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                        LIVENESS: POSITIVE • 99.4% CONFIDENCE
                      </div>

                      {/* Toggle Webcam Button */}
                      <button
                        type="button"
                        onClick={toggleWebcam}
                        className="absolute top-2 right-2 text-[9px] font-mono px-2 py-1 rounded bg-black/70 hover:bg-black text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3 text-cyan-400" />
                        <span>{useWebcamForFace ? 'Use Mesh' : 'Use Webcam'}</span>
                      </button>
                    </div>
                  )}

                  {/* Status Text & Progress Bar */}
                  <div className="w-full mt-3 text-center">
                    <div className="text-[11px] font-mono text-slate-300 mb-1.5 flex items-center justify-center gap-1.5">
                      {bioScanState === 'MATCHED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : bioScanState === 'SCANNING' ? (
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <Scan className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{bioStatusText}</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          bioScanState === 'MATCHED'
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${bioScanProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={bioScanState === 'SCANNING'}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition cursor-pointer disabled:opacity-50"
                >
                  {bioScanState === 'SCANNING' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Biometric Vector...</span>
                    </>
                  ) : bioScanState === 'MATCHED' ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Verified! Launching Command Console...</span>
                    </>
                  ) : (
                    <>
                      {biometricType === 'FINGERPRINT' ? (
                        <Fingerprint className="w-4 h-4 text-emerald-200" />
                      ) : (
                        <ScanFace className="w-4 h-4 text-cyan-200" />
                      )}
                      <span>
                        Authorize Clearance via {biometricType === 'FINGERPRINT' ? 'Fingerprint' : 'Face ID'}
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              /* TAB 2: STANDARD CREDENTIALS FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email / ID */}
                <div>
                  <label
                    htmlFor="staff-email"
                    className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2 font-mono"
                  >
                    Work Email / Staff ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="staff-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@atomix.med"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="staff-password"
                      className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono"
                    >
                      Security Passcode / PIN
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      Demo PIN: <strong className="text-cyan-400">atomix2026</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      id="btn-toggle-password-visibility"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Terminal Policy */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/40 focus:ring-offset-0"
                    />
                    <span>Keep session active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('BIOMETRIC')}
                    className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Use Biometrics</span>
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authorizing Command Clearance...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Hospital Command Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-Click Biometric Access Pills */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <p className="text-xs text-center text-slate-400 font-mono mb-2.5">
                Instant Multi-Modal Hardware Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-rfid-login"
                  type="button"
                  onClick={() => {
                    selectDemoUser(DEMO_USERS[0]);
                    setAuthMode('BIOMETRIC');
                    setBiometricType('FINGERPRINT');
                    setTimeout(() => handleBiometricScan(), 150);
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scan Doctor Touch</span>
                </button>
                <button
                  id="btn-quick-emergency-login"
                  type="button"
                  onClick={() => {
                    selectDemoUser(DEMO_USERS[1]);
                    setAuthMode('BIOMETRIC');
                    setBiometricType('FACE');
                    setTimeout(() => handleBiometricScan(), 150);
                  }}
                  className="py-2 px-3 rounded-lg border border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ScanFace className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Face ID Command</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
