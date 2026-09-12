import React, { useState, useRef, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Camera,
  Video,
  Radio,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Shield,
  Zap,
  Activity,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Sliders,
  Flame,
  Play,
  Pause,
  RefreshCw,
  PowerOff,
  WifiOff,
  Wifi,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';

interface CameraNode {
  id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Alert' | 'Connecting';
  fps: number;
  lastDetection: string;
  facesDetected: number;
  deviceId: string;
  type: 'Entrance' | 'Triage' | 'Pharmacy' | 'Corridor' | 'Docking';
}

// Crisp, 100% offline procedural SVG CCTV environments tailored to each clinical node
const LocalCameraScene: React.FC<{ type: CameraNode['type']; isAlert?: boolean }> = ({
  type,
  isAlert,
}) => {
  switch (type) {
    case 'Entrance':
      return (
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wallGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#08101e" />
              <stop offset="100%" stopColor="#020610" />
            </linearGradient>
            <linearGradient id="floorGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a1424" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Wall & Ceiling */}
          <rect width="800" height="260" fill="url(#wallGrad1)" />
          {/* Floor */}
          <polygon points="0,260 800,260 800,450 0,450" fill="url(#floorGrad1)" />

          {/* Perspective Floor Tiles */}
          <line x1="0" y1="450" x2="280" y2="260" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="200" y1="450" x2="360" y2="260" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="400" y1="450" x2="400" y2="260" stroke="#0ea5e9" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="6 4" />
          <line x1="600" y1="450" x2="440" y2="260" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="800" y1="450" x2="520" y2="260" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="0" y1="330" x2="800" y2="330" stroke="#0ea5e9" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="0" y1="390" x2="800" y2="390" stroke="#0ea5e9" strokeOpacity="0.12" strokeWidth="1" />

          {/* Automatic Sliding Glass Doors */}
          <rect x="260" y="70" width="280" height="190" fill="#030914" stroke="#1e293b" strokeWidth="3" />
          <rect x="270" y="80" width="125" height="175" fill="url(#glassGrad)" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.5" />
          <rect x="405" y="80" width="125" height="175" fill="url(#glassGrad)" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.5" />
          <line x1="395" y1="80" x2="395" y2="255" stroke="#38bdf8" strokeOpacity="0.7" strokeWidth="2" />
          <text x="400" y="60" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
            MAIN ENTRANCE GATE 01
          </text>

          {/* Biometric Scanner Pillars */}
          <rect x="230" y="150" width="20" height="110" fill="#1e293b" rx="3" stroke="#0ea5e9" strokeWidth="1" />
          <circle cx="240" cy="170" r="5" fill="#10b981" />
          <rect x="550" y="150" width="20" height="110" fill="#1e293b" rx="3" stroke="#0ea5e9" strokeWidth="1" />
          <circle cx="560" cy="170" r="5" fill="#10b981" />

          {/* Reception Desk on Left */}
          <polygon points="50,210 170,210 190,260 30,260" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
          <rect x="50" y="260" width="140" height="50" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <text x="110" y="240" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">RECEPTION DESK</text>

          {/* Ceiling Lights & Overheads */}
          <rect x="220" y="10" width="120" height="10" fill="#e0f2fe" fillOpacity="0.6" rx="2" />
          <rect x="460" y="10" width="120" height="10" fill="#e0f2fe" fillOpacity="0.6" rx="2" />
        </svg>
      );

    case 'Triage':
      return (
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="triageWall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b1120" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
            <linearGradient id="vitalLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="800" height="270" fill="url(#triageWall)" />
          <rect y="270" width="800" height="180" fill="#030712" />

          {/* Triage Privacy Curtains */}
          <path d="M 60 40 Q 90 140 70 270" stroke="#334155" strokeWidth="8" fill="none" opacity="0.6" />
          <path d="M 720 40 Q 700 140 730 270" stroke="#334155" strokeWidth="8" fill="none" opacity="0.6" />

          {/* Hospital Bed */}
          <rect x="240" y="220" width="320" height="80" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <rect x="250" y="200" width="90" height="40" rx="8" fill="#334155" />
          {/* Bed Rails & Legs */}
          <line x1="260" y1="300" x2="260" y2="340" stroke="#64748b" strokeWidth="5" />
          <line x1="540" y1="300" x2="540" y2="340" stroke="#64748b" strokeWidth="5" />
          <circle cx="260" cy="345" r="7" fill="#475569" />
          <circle cx="540" cy="345" r="7" fill="#475569" />

          {/* Cardiac Vital Signs Monitor */}
          <rect x="580" y="110" width="130" height="95" rx="6" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
          <rect x="585" y="115" width="120" height="85" fill="#030712" rx="4" />
          {/* Animated/Rendered ECG line */}
          <path
            d="M 590 150 L 610 150 L 615 135 L 620 165 L 625 145 L 630 150 L 660 150 L 665 135 L 670 165 L 675 145 L 700 150"
            fill="none"
            stroke={isAlert ? '#ef4444' : '#10b981'}
            strokeWidth="2"
          />
          <text x="592" y="130" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            HR: {isAlert ? '142' : '78'} BPM
          </text>
          <text x="660" y="130" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SpO2: {isAlert ? '89%' : '98%'}
          </text>

          {/* IV Drip Pole */}
          <line x1="210" y1="100" x2="210" y2="320" stroke="#94a3b8" strokeWidth="3" />
          <line x1="195" y1="100" x2="225" y2="100" stroke="#94a3b8" strokeWidth="3" />
          <rect x="200" y="110" width="20" height="35" rx="4" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 210 145 Q 220 180 250 220" fill="none" stroke="#e0f2fe" strokeWidth="1.5" strokeOpacity="0.5" />

          {/* Floor Warning / Trauma Marker */}
          <ellipse cx="400" cy="350" rx="160" ry="25" fill="none" stroke={isAlert ? '#ef4444' : '#0ea5e9'} strokeWidth="1.5" strokeDasharray="6 4" />
          <text x="400" y="354" fill={isAlert ? '#f87171' : '#38bdf8'} fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
            CRITICAL CARE RESUSCITATION ZONE
          </text>
        </svg>
      );

    case 'Pharmacy':
      return (
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="800" height="450" fill="#030712" />

          {/* Robotic Automated Pharmacy Storage Matrix */}
          <g transform="translate(140, 50)">
            <rect width="520" height="260" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <text x="260" y="25" fill="#a855f7" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="3">
              CENTRAL AUTOMATED MEDICINE DISPENSER [ROBO-RX 01]
            </text>

            {/* Matrix of Pill Bins */}
            {[0, 1, 2, 3, 4, 5].map((row) =>
              [0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
                <rect
                  key={`${row}-${col}`}
                  x={25 + col * 60}
                  y={40 + row * 34}
                  width="48"
                  height="26"
                  rx="3"
                  fill="#030712"
                  stroke="#3b82f6"
                  strokeOpacity={row === 2 && col === 3 ? '0.9' : '0.3'}
                  strokeWidth="1"
                />
              ))
            )}

            {/* Active Dispensing Robotic Axis Gantry */}
            <line x1="205" y1="40" x2="205" y2="245" stroke="#a855f7" strokeWidth="3" />
            <circle cx="205" cy="120" r="10" fill="#c084fc" stroke="#f3e8ff" strokeWidth="2" />
            <line x1="25" y1="120" x2="495" y2="120" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 2" />
          </g>

          {/* Conveyor Chute at Bottom */}
          <rect x="220" y="330" width="360" height="45" rx="6" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          <line x1="230" y1="352" x2="570" y2="352" stroke="#38bdf8" strokeWidth="2" strokeDasharray="10 6" />
          <text x="400" y="395" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
            OPTICAL VERIFIED OUTPUT CONVEYOR • BARCODE AUDIT: PASS
          </text>
        </svg>
      );

    case 'Corridor':
      return (
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="800" height="260" fill="#080e1a" />
          <rect y="260" width="800" height="190" fill="#020617" />

          {/* Floor perspective */}
          <line x1="0" y1="450" x2="300" y2="260" stroke="#1e293b" strokeWidth="1" />
          <line x1="800" y1="450" x2="500" y2="260" stroke="#1e293b" strokeWidth="1" />

          {/* Smart Vending Machine Kiosk in Center */}
          <rect x="310" y="60" width="180" height="280" rx="10" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          <rect x="325" y="80" width="150" height="120" rx="4" fill="#020617" stroke="#1e293b" strokeWidth="1" />

          {/* Spiral Coils & Items inside VM */}
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <circle
                key={`${r}-${c}`}
                cx={350 + c * 50}
                cy={105 + r * 35}
                r="10"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            ))
          )}

          {/* Interactive Screen on VM */}
          <rect x="330" y="215" width="80" height="45" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          <text x="370" y="240" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">
            RFID TAP HERE
          </text>

          {/* Dispense Chute Door */}
          <rect x="330" y="275" width="140" height="45" rx="4" fill="#020617" stroke="#334155" strokeWidth="1.5" />
          <text x="400" y="300" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            PUSH TO RETRIEVE
          </text>

          {/* Corridor Sign */}
          <rect x="80" y="50" width="140" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          <text x="150" y="75" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            EMERGENCY CORRIDOR A
          </text>
        </svg>
      );

    case 'Docking':
      return (
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="800" height="450" fill="#020617" />

          {/* Yellow Safety Floor Markings */}
          <rect x="180" y="160" width="440" height="240" fill="#030712" stroke="#eab308" strokeWidth="3" strokeDasharray="16 10" />
          <text x="400" y="195" fill="#eab308" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="4">
            AUTONOMOUS ROVER DOCKING BAY 03
          </text>

          {/* Inductive Charging Pad */}
          <rect x="290" y="230" width="220" height="130" rx="12" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
          <circle cx="400" cy="295" r="40" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="400" cy="295" r="20" fill="none" stroke="#10b981" strokeWidth="2" />

          {/* Rover Vehicle Outline */}
          <rect x="330" y="255" width="140" height="80" rx="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="400" cy="275" r="8" fill="#38bdf8" />
          <text x="400" y="315" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            MEDIBOT-01
          </text>

          {/* Optical Ground Track */}
          <line x1="400" y1="360" x2="400" y2="450" stroke="#06b6d4" strokeWidth="6" />
          <line x1="400" y1="360" x2="400" y2="450" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 8" />

          {/* Charging Status Beacon */}
          <rect x="640" y="180" width="30" height="120" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <circle cx="655" cy="205" r="7" fill="#10b981" />
          <circle cx="655" cy="230" r="7" fill="#eab308" />
          <circle cx="655" cy="255" r="7" fill="#ef4444" opacity="0.3" />
        </svg>
      );
  }
};

export const CameraCenter: React.FC = () => {
  const {
    patients,
    checkInPatient,
    addAuditLog,
    setActiveTab,
    triggerCameraAnomaly,
    triggerEmergencyAlert,
    theme,
  } = useHospital();

  const [cameras, setCameras] = useState<CameraNode[]>([
    {
      id: 'CAM-01',
      name: 'Main Entrance AI Vision Node',
      location: 'Hospital Main Entrance Gate 1',
      status: 'Online',
      fps: 30,
      lastDetection: '3s ago',
      facesDetected: 1,
      deviceId: 'CAM-ENTRANCE-01',
      type: 'Entrance',
    },
    {
      id: 'CAM-02',
      name: 'Emergency Ward & Triage Vision',
      location: 'ICU / Emergency Bay Corridor',
      status: 'Alert',
      fps: 30,
      lastDetection: 'Just now',
      facesDetected: 2,
      deviceId: 'CAM-TRIAGE-02',
      type: 'Triage',
    },
    {
      id: 'CAM-03',
      name: 'Central Pharmacy Robotic Node',
      location: 'Cleanroom Dispensing Console',
      status: 'Online',
      fps: 25,
      lastDetection: '45s ago',
      facesDetected: 1,
      deviceId: 'CAM-PHARM-01',
      type: 'Pharmacy',
    },
    {
      id: 'CAM-04',
      name: 'Smart Vending VM-01 Optical',
      location: 'Corridor A Emergency Slot #01',
      status: 'Online',
      fps: 25,
      lastDetection: '2m ago',
      facesDetected: 1,
      deviceId: 'CAM-VM01-01',
      type: 'Corridor',
    },
    {
      id: 'CAM-05',
      name: 'Rover RB-01 Docking Bay',
      location: 'Autonomous Rover Bay 3',
      status: 'Online',
      fps: 30,
      lastDetection: '1m ago',
      deviceId: 'CAM-ROBOT-01',
      type: 'Docking',
    },
  ]);

  const [selectedCamId, setSelectedCamId] = useState<string>('CAM-01');
  const [feedMode, setFeedMode] = useState<'SIMULATED' | 'WEBCAM'>('SIMULATED');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState<string | null>(null);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [isSwitchingFeed, setIsSwitchingFeed] = useState(false);

  // Designated camera node for physical hardware webcam (defaults to CAM-01 Entrance)
  const [webcamAssignedNode, setWebcamAssignedNode] = useState<string>('CAM-01');

  const [detectionEvent, setDetectionEvent] = useState<{
    detected: boolean;
    patientName?: string;
    patientId?: string;
    confidence?: number;
    message: string;
    type?: 'SUCCESS' | 'WARNING' | 'EMERGENCY';
  } | null>({
    detected: true,
    patientName: 'Arun Kumar',
    patientId: 'PT-1024',
    confidence: 0.984,
    message: 'Biometric Face Match Verified (98.4% Confidence). Liveness: Positive.',
    type: 'SUCCESS',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  // Starts local webcam hardware stream
  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        streamRef.current = stream;
        setIsWebcamActive(true);
        setFeedMode('WEBCAM');
        setWebcamAssignedNode(selectedCamId);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }
    } catch {
      setIsWebcamActive(false);
      setFeedMode('SIMULATED');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
    setFeedMode('SIMULATED');
  };

  // Re-bind video stream safely whenever active camera, feedMode, or webcam state changes
  useEffect(() => {
    if (feedMode === 'WEBCAM' && isWebcamActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [selectedCamId, feedMode, isWebcamActive]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Handle switching camera tiles
  const handleSelectCamera = (camId: string) => {
    if (camId === selectedCamId) return;

    setIsSwitchingFeed(true);
    setSelectedCamId(camId);

    // If in webcam mode and user switches to a different camera tile:
    // If the new camera is not the webcam assigned node, give seamless behavior:
    // User can either keep webcam bound to new camera or automatically fallback to crisp simulation
    if (feedMode === 'WEBCAM' && isWebcamActive) {
      if (camId !== webcamAssignedNode) {
        // Automatically switch to Simulated Vision for that specific node so it doesn't freeze!
        setFeedMode('SIMULATED');
      }
    }

    setTimeout(() => {
      setIsSwitchingFeed(false);
    }, 280);
  };

  // Toggle Camera Offline / Online Simulation
  const handleToggleCameraPower = (camId: string) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === camId) {
          const nextStatus = c.status === 'Offline' ? 'Online' : 'Offline';
          if (nextStatus === 'Offline') {
            soundEffects.playEmergencyAlert();
          } else {
            soundEffects.playSuccessChirp();
          }
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Simulate Reconnection with progress spinner
  const handleReconnectFeed = (camId: string) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === camId ? { ...c, status: 'Connecting' } : c))
    );

    setTimeout(() => {
      setCameras((prev) =>
        prev.map((c) => (c.id === camId ? { ...c, status: 'Online' } : c))
      );
      soundEffects.playSuccessChirp();
    }, 1200);
  };

  // Trigger biometric face verification
  const handleFaceVerification = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (patient && patient.identifiers.faceRegistered) {
      soundEffects.playSuccessChirp();
      setActiveAnomaly(null);
      setDetectionEvent({
        detected: true,
        patientName: patient.name,
        patientId: patient.id,
        confidence: 0.986,
        message: `Face match confirmed for ${patient.name} (${patient.id}). Confidence: 98.6%.`,
        type: 'SUCCESS',
      });

      checkInPatient(patient.id, 'Face', 'Normal');

      addAuditLog({
        actor: currentCam.deviceId,
        role: 'AI CAMERA',
        action: 'Face Verification Success',
        details: `Face identified for ${patient.name} (${patient.id}) with 98.6% match confidence. Visit queued.`,
        category: 'IDENTIFICATION',
        severity: 'INFO',
        patientId: patient.id,
      });
    } else {
      soundEffects.playEmergencyAlert();
      setActiveAnomaly('UNENROLLED_FACE');
      setDetectionEvent({
        detected: false,
        message: 'Unenrolled subject or low confidence (<65%). Secondary credential (RFID/QR) requested.',
        type: 'WARNING',
      });

      addAuditLog({
        actor: currentCam.deviceId,
        role: 'AI CAMERA',
        action: 'Face Match Failed',
        details: 'Biometric match below 70% threshold. Fallback requested.',
        category: 'IDENTIFICATION',
        severity: 'WARNING',
      });
    }
  };

  // Trigger simulated patient fall or cardiac distress anomaly
  const handleTriggerAnomaly = (anomalyType: string, isCodeBlue = false) => {
    setActiveAnomaly(anomalyType);
    triggerCameraAnomaly(currentCam.deviceId, anomalyType, currentCam.location, isCodeBlue);

    setDetectionEvent({
      detected: true,
      message: `ANOMALY DETECTED: ${anomalyType} at ${currentCam.location}. Immediate dispatch alerted.`,
      type: isCodeBlue ? 'EMERGENCY' : 'WARNING',
    });

    if (isCodeBlue) {
      setCameras((prev) =>
        prev.map((c) => (c.id === currentCam.id ? { ...c, status: 'Alert' } : c))
      );
    }
  };

  const isCurrentOffline = currentCam.status === 'Offline';
  const isCurrentConnecting = currentCam.status === 'Connecting';

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-tech uppercase tracking-wider text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              AI Computer Vision Surveillance Grid
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              5 Active Nodes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Edge neural inference nodes: Face Biometrics, Fall Detection, Thermal Screening & Rover Line Monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Feed Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                setFeedMode('SIMULATED');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                feedMode === 'SIMULATED'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulated Vision
            </button>
            <button
              onClick={() => {
                if (isWebcamActive) {
                  setFeedMode('WEBCAM');
                  setWebcamAssignedNode(selectedCamId);
                } else {
                  startWebcam();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                feedMode === 'WEBCAM' && isWebcamActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isWebcamActive ? 'Local Cam (Active)' : 'Connect Local Cam'}</span>
            </button>
          </div>

          {isWebcamActive && (
            <button
              onClick={stopWebcam}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-mono hover:bg-rose-900 cursor-pointer"
              title="Disconnect local camera hardware"
            >
              Stop Cam
            </button>
          )}

          <button
            onClick={() => setSimulationPaused(!simulationPaused)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={simulationPaused ? 'Resume AI Overlay' : 'Pause AI Overlay'}
          >
            {simulationPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Node List + Right CCTV Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: 5 Connected Video Camera Nodes */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold font-tech uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>Video Feeds ({cameras.length})</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {cameras.filter((c) => c.status !== 'Offline').length}/{cameras.length} Active
            </span>
          </h3>

          <div className="space-y-2.5">
            {cameras.map((cam) => {
              const isSelected = selectedCamId === cam.id;
              const isCamAlert = cam.status === 'Alert';
              const isCamOffline = cam.status === 'Offline';
              const isCamConnecting = cam.status === 'Connecting';

              return (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/40'
                      : isCamOffline
                      ? 'bg-slate-950/60 border-slate-900 opacity-70 hover:opacity-100 hover:border-slate-800'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-white flex items-center gap-2">
                      <Radio
                        className={`w-3.5 h-3.5 ${
                          isCamOffline
                            ? 'text-slate-600'
                            : isCamAlert
                            ? 'text-red-400 animate-pulse'
                            : 'text-cyan-400'
                        }`}
                      />
                      {cam.name}
                    </span>

                    {/* Status badge with OFFLINE / CONNECTING handling */}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isCamOffline
                          ? 'bg-red-950 text-red-400 border border-red-800/80 animate-pulse'
                          : isCamConnecting
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                          : isCamAlert
                          ? 'bg-red-950 text-red-300 border border-red-800/60 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 truncate">{cam.location}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    <span>{cam.deviceId}</span>
                    <span>{isCamOffline ? '0 FPS' : `${cam.fps} FPS`}</span>
                    <span>Faces: {isCamOffline ? '-' : cam.facesDetected}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Main Video Viewport & Telemetry HUD */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Camera Viewport Header Bar */}
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCurrentOffline
                      ? 'bg-slate-600'
                      : isCurrentConnecting
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-red-500 animate-pulse'
                  }`}
                />
                <span className="font-bold text-white uppercase">{currentCam.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {currentCam.deviceId}
                </span>
                {feedMode === 'WEBCAM' && isWebcamActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/70 border border-blue-700 text-blue-300 font-bold">
                    WEBCAM ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-slate-400 text-[11px] hidden sm:flex items-center gap-3">
                  <span>1080p • {isCurrentOffline ? '0' : currentCam.fps} FPS</span>
                  <span>ISO 400</span>
                </div>

                {/* Simulate Node Failure / Reconnect Toggle */}
                <button
                  onClick={() => handleToggleCameraPower(currentCam.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition cursor-pointer border ${
                    isCurrentOffline
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-red-300 hover:border-red-800'
                  }`}
                  title={isCurrentOffline ? 'Restore Camera Feed' : 'Simulate Camera Offline Signal Loss'}
                >
                  {isCurrentOffline ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>Power On</span>
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-3 h-3" />
                      <span>Simulate Offline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Video Canvas Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {/* Switching Feed Spinner Transition */}
              {isSwitchingFeed ? (
                <div className="flex flex-col items-center justify-center text-cyan-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    SWITCHING RTSP FEED [{currentCam.id}]...
                  </span>
                </div>
              ) : isCurrentConnecting ? (
                /* Connecting Loading State */
                <div className="flex flex-col items-center justify-center text-cyan-400 gap-3 p-6 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                  <div>
                    <h4 className="text-sm font-bold font-tech text-white uppercase tracking-wider">
                      CONNECTING TO EDGE NODE {currentCam.deviceId}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Negotiating H.264/RTSP stream • Syncing YOLOv8 Inference weights...
                    </p>
                  </div>
                </div>
              ) : isCurrentOffline ? (
                /* Proper High-Tech OFFLINE / NO SIGNAL State */
                <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative p-6 text-center select-none">
                  {/* SMPTE Color Bar Strip */}
                  <div className="absolute top-0 left-0 right-0 h-4 flex opacity-50">
                    <div className="flex-1 bg-slate-100" />
                    <div className="flex-1 bg-yellow-400" />
                    <div className="flex-1 bg-cyan-400" />
                    <div className="flex-1 bg-green-500" />
                    <div className="flex-1 bg-purple-600" />
                    <div className="flex-1 bg-red-600" />
                    <div className="flex-1 bg-blue-600" />
                  </div>

                  <WifiOff className="w-12 h-12 text-red-500/80 mb-3 animate-pulse" />
                  <div className="space-y-1 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700 text-red-300 font-mono text-xs font-bold uppercase tracking-wider">
                      NO SIGNAL — CAMERA OFFLINE
                    </span>
                    <h4 className="text-sm font-bold text-white font-mono mt-2">
                      FEED DISRUPTED [{currentCam.deviceId}]
                    </h4>
                    <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
                      Edge camera node failed to return telemetry. Check IP gateway or power distribution.
                    </p>
                  </div>

                  <button
                    onClick={() => handleReconnectFeed(currentCam.id)}
                    className="mt-4 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs font-mono flex items-center gap-1.5 transition shadow-lg shadow-red-950 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reconnect Feed</span>
                  </button>

                  {/* Scanline CRT overlay */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)',
                    }}
                  />
                </div>
              ) : feedMode === 'WEBCAM' && isWebcamActive ? (
                /* Hardware Webcam Feed */
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                /* 100% Reliable Offline Procedural Clinical CCTV Environment */
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <LocalCameraScene
                    type={currentCam.type}
                    isAlert={currentCam.status === 'Alert' || activeAnomaly !== null}
                  />

                  {/* Dark Vignette & CCTV scanlines */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)',
                    }}
                  />
                </div>
              )}

              {/* HUD Bounding Boxes & AI Overlays (rendered when online) */}
              {!isCurrentOffline && !isCurrentConnecting && !isSwitchingFeed && !simulationPaused && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  {/* Top HUD Telemetry */}
                  <div className="flex items-start justify-between text-[11px] font-mono text-cyan-300 drop-shadow">
                    <div className="bg-slate-950/80 p-2 rounded-lg border border-cyan-500/40">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        AI MODEL: YOLOv8-MED-BIO
                      </p>
                      <p className="text-[10px] text-slate-400">LATENCY: 12ms • RECALL: 99.2%</p>
                    </div>

                    <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-right">
                      <p className="font-bold text-emerald-400">
                        {feedMode === 'WEBCAM' && isWebcamActive ? 'LOCAL WEBCAM LIVE' : 'STATUS: NORMAL'}
                      </p>
                      <p className="text-[10px] text-slate-400">TIME: {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {/* Centered Dynamic Bounding Box */}
                  <div className="self-center">
                    {activeAnomaly === 'PATIENT_FALL' ? (
                      /* Red Alert Fall Anomaly Bounding Box */
                      <div className="relative w-64 h-36 border-2 border-red-500 rounded-xl bg-red-950/20 backdrop-blur-[1px] p-2 animate-bounce shadow-2xl shadow-red-950">
                        <div className="flex items-center justify-between text-[10px] font-mono text-red-300 font-bold bg-red-950/90 px-2 py-0.5 rounded border border-red-800">
                          <span>[CRITICAL_FALL_DETECTED]</span>
                          <span>99.4% CONF</span>
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-xs font-bold font-mono text-white bg-red-900/80 px-2 py-1 rounded inline-block">
                            FALL DETECTED: ICCU CORRIDOR
                          </p>
                          <p className="text-[10px] text-red-300 font-mono mt-1">
                            CODE BLUE AUTOMATION DISPATCHED
                          </p>
                        </div>
                      </div>
                    ) : activeAnomaly === 'ELEVATED_TEMP' ? (
                      /* Thermal Scanner Box */
                      <div className="relative w-48 h-56 border-2 border-amber-500 rounded-xl bg-amber-950/20 p-2 animate-pulse">
                        <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 font-bold bg-amber-950/90 px-2 py-0.5 rounded">
                          <span>[THERMAL_ANOMALY]</span>
                          <span>39.2°C HIGH</span>
                        </div>
                        <div className="mt-12 text-center">
                          <p className="text-xs font-bold font-mono text-amber-200 bg-slate-900/90 px-2 py-0.5 rounded">
                            PYREXIA ALERT
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Normal High-Precision Face Recognition Box */
                      <div className="relative w-48 h-56 border-2 border-dashed border-cyan-400 rounded-2xl flex flex-col justify-between p-2.5 backdrop-blur-[1px] bg-cyan-950/20 shadow-xl shadow-cyan-950/50">
                        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold">
                          <span>[FACE_MATCH]</span>
                          <span>98.6%</span>
                        </div>

                        <div className="text-center">
                          <div className="text-xs font-mono font-bold text-white bg-slate-950/90 px-2.5 py-1 rounded-lg border border-cyan-500/50 inline-block">
                            {detectionEvent?.patientName ? detectionEvent.patientName : 'PT-1024 Arun Kumar'}
                          </div>
                          <div className="text-[10px] text-cyan-400 font-mono mt-1">
                            {detectionEvent?.patientId ? detectionEvent.patientId : 'PT-1024'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400 font-semibold">
                          <span>BIOMETRIC_OK</span>
                          <span>LIVENESS: TRUE</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom HUD Footprint */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>GRID: EPSG:4326 • ELEV: 14m</span>
                    <span>NODE LATENCY: 12ms</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Interactive Trigger Actions */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  Simulate Real-Time Anomaly & Detection at this Node:
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Deterministic QA Mode</span>
              </div>

              {/* Simulation Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  id="btn-cam-face-arun"
                  type="button"
                  onClick={() => handleFaceVerification('PT-1024')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Arun Kumar (PT-1024 Match)</span>
                </button>

                <button
                  id="btn-cam-face-priya"
                  type="button"
                  onClick={() => handleFaceVerification('PT-1025')}
                  className="px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-700 text-blue-300 hover:bg-blue-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Priya Sharma (PT-1025 Match)</span>
                </button>

                <button
                  id="btn-cam-fall-anomaly"
                  type="button"
                  onClick={() => handleTriggerAnomaly('Patient Acute Fall & Unresponsive', true)}
                  className="px-3 py-1.5 rounded-lg bg-red-950 border border-red-700 text-red-300 hover:bg-red-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-950 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Simulate Patient Fall (Code Blue)</span>
                </button>

                <button
                  id="btn-cam-fever-anomaly"
                  type="button"
                  onClick={() => handleTriggerAnomaly('Elevated Body Temperature 39.2°C', false)}
                  className="px-3 py-1.5 rounded-lg bg-amber-950 border border-amber-700 text-amber-300 hover:bg-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Elevated Pyrexia (39.2°C)</span>
                </button>

                <button
                  id="btn-cam-unregistered"
                  type="button"
                  onClick={() => handleFaceVerification('UNKNOWN')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Unknown Person (Simulate Fail)</span>
                </button>
              </div>

              {/* Event Feedback Alert */}
              {detectionEvent && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    detectionEvent.type === 'EMERGENCY'
                      ? 'bg-red-950/70 border-red-600 text-red-200'
                      : detectionEvent.type === 'WARNING'
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                      : 'bg-emerald-950/70 border-emerald-600 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {detectionEvent.type === 'EMERGENCY' ? (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                    ) : detectionEvent.type === 'WARNING' ? (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{detectionEvent.message}</span>
                  </div>

                  {detectionEvent.type === 'EMERGENCY' ? (
                    <button
                      onClick={() => setActiveTab('emergency')}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md whitespace-nowrap cursor-pointer"
                    >
                      Open Emergency Module →
                    </button>
                  ) : detectionEvent.detected ? (
                    <button
                      onClick={() => setActiveTab('visits')}
                      className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs shadow-md whitespace-nowrap cursor-pointer"
                    >
                      View Visit Queue →
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
