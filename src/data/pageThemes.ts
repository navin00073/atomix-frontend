export interface PageThemeConfig {
  id: string;
  name: string;
  tagline: string;
  headline: string;
  subheadline: string;
  badgeText: string;
  bgImageUrl: string;
  gradientAura: string;
  accentColor: string;
  secondaryColor: string;
  chip1: {
    avatar: string;
    title: string;
    subtitle: string;
    progress?: number;
    color: string;
  };
  chip2: {
    avatar: string;
    title: string;
    subtitle: string;
    badge?: string;
    color: string;
  };
  floatingPill: {
    label: string;
    icon: string;
  };
}

export const PAGE_THEMES: Record<string, PageThemeConfig> = {
  dashboard: {
    id: 'dashboard',
    name: 'Command Center',
    tagline: "IT'S AS EASY AS 1, 2, 3",
    headline: 'Less worrying, more healing.',
    subheadline:
      'Autonomous biometrics, smart medicine dispensing & robotic delivery across all wards in under 5 minutes.',
    badgeText: 'Team AtomiX 2.0 • Live Hospital Command',
    bgImageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-violet-500/20 via-sky-400/20 to-amber-300/15',
    accentColor: '#2563eb',
    secondaryColor: '#06b6d4',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      title: 'Dispensing VM-01',
      subtitle: 'Slot 03 • Paracetamol',
      progress: 75,
      color: 'emerald',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      title: 'Aarav Patel',
      subtitle: 'Ward 4B • Bed 12',
      badge: 'Checked In',
      color: 'blue',
    },
    floatingPill: {
      label: 'Robotic Line Active',
      icon: 'bot',
    },
  },

  flow: {
    id: 'flow',
    name: 'Digital Workflow',
    tagline: 'END-TO-END PATIENT PIPELINE',
    headline: 'Seamless flow, zero delays.',
    subheadline:
      'Step-by-step autonomous progression from biometric kiosk check-in to automated bedside medicine delivery.',
    badgeText: '7-Stage Autonomous Telemetry',
    bgImageUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-sky-500/25 via-indigo-500/20 to-teal-400/20',
    accentColor: '#0284c7',
    secondaryColor: '#10b981',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      title: 'Pipeline Sync',
      subtitle: 'Queue Stage 3 of 7',
      progress: 42,
      color: 'sky',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      title: 'Dr. Priya Sharma',
      subtitle: 'Consulting Room 2',
      badge: 'Live',
      color: 'indigo',
    },
    floatingPill: {
      label: 'Zero Paperwork',
      icon: 'sparkles',
    },
  },

  patients: {
    id: 'patients',
    name: 'Patient Enrollment & Biometrics',
    tagline: 'MULTI-MODAL AUTHENTICATION',
    headline: 'Instant recognition, absolute precision.',
    subheadline:
      'Webcam Face AI vector matching, 13.56 MHz RFID wristbands, and tamper-resistant encrypted medical identity.',
    badgeText: 'Biometric Vector Matching Engine',
    bgImageUrl:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-purple-500/25 via-pink-400/20 to-sky-400/15',
    accentColor: '#7c3aed',
    secondaryColor: '#ec4899',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      title: 'Face Scan Verified',
      subtitle: '99.4% Match Confidence',
      progress: 99,
      color: 'purple',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
      title: 'RFID Tag UID',
      subtitle: 'E2-80-11-04-A1',
      badge: 'Linked',
      color: 'emerald',
    },
    floatingPill: {
      label: '13.56 MHz NFC Ready',
      icon: 'shield',
    },
  },

  doctor: {
    id: 'doctor',
    name: 'Doctor Consultation Desk',
    tagline: 'SMART CLINICAL TELEMETRY',
    headline: 'Accurate diagnoses, instant prescriptions.',
    subheadline:
      'Real-time IoT vitals monitoring, drug-drug interaction warnings, and 1-click cryptographic e-signatures.',
    badgeText: 'Intelligent Doctor Workstation',
    bgImageUrl:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-blue-600/20 via-cyan-400/20 to-emerald-400/15',
    accentColor: '#2563eb',
    secondaryColor: '#10b981',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
      title: 'IoT Vitals Sync',
      subtitle: 'SpO2: 98% • HR: 74 bpm',
      progress: 98,
      color: 'emerald',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
      title: 'Dr. Anand Verma',
      subtitle: 'Chief Pulmonologist',
      badge: 'Active Desk',
      color: 'blue',
    },
    floatingPill: {
      label: 'Drug Safety Engine',
      icon: 'stethoscope',
    },
  },

  pharmacy: {
    id: 'pharmacy',
    name: 'Smart Vending & Pharmacy',
    tagline: 'AUTOMATED MEDICINE DISPENSER',
    headline: 'Dual-sensor verified, zero error.',
    subheadline:
      'NEMA-17 stepper motor spiral dispensing with infrared beam fall detection and HX711 load cell weight confirmation.',
    badgeText: 'Smart Vending Machine VM-01',
    bgImageUrl:
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-emerald-500/25 via-teal-400/20 to-cyan-400/20',
    accentColor: '#059669',
    secondaryColor: '#0d9488',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=150&q=80',
      title: 'Dispensing Spiral',
      subtitle: 'Amoxicillin 500mg (Slot 2)',
      progress: 88,
      color: 'emerald',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=150&q=80',
      title: 'HX711 Load Cell',
      subtitle: 'Expected: 42g • Measured: 42.1g',
      badge: '100% Match',
      color: 'teal',
    },
    floatingPill: {
      label: 'Dual Sensor Verified',
      icon: 'box',
    },
  },

  robots: {
    id: 'robots',
    name: 'Delivery Rovers & Logistics',
    tagline: 'AUTONOMOUS FLEET CONTROL',
    headline: 'Self-navigating rovers, safe transit.',
    subheadline:
      'TCS3200 optical line-tracking, RFID checkpoint verification, and biometric PIN-secured compartment unlock.',
    badgeText: 'Autonomous Rover Fleet AtomiX',
    bgImageUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-indigo-600/25 via-purple-500/20 to-amber-400/20',
    accentColor: '#4f46e5',
    secondaryColor: '#f59e0b',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=150&q=80',
      title: 'Rover 01 En Route',
      subtitle: 'Checkpoint CP-03 • Ward 4B',
      progress: 68,
      color: 'amber',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80',
      title: 'Secure Lockbox',
      subtitle: 'Nurse OTP / NFC Required',
      badge: 'Armed',
      color: 'indigo',
    },
    floatingPill: {
      label: 'Optical Line Tracking',
      icon: 'truck',
    },
  },

  analytics: {
    id: 'analytics',
    name: 'AI Demand Forecast & Inventory',
    tagline: 'PREDICTIVE INVENTORY INTELLIGENCE',
    headline: 'Anticipate shortages, automate supply.',
    subheadline:
      'Linear regression daily consumption burn rates, stockout lead-time warnings, and automated supplier purchase orders.',
    badgeText: 'AI Predictive Engine AtomiX',
    bgImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-violet-600/25 via-fuchsia-500/20 to-sky-400/20',
    accentColor: '#8b5cf6',
    secondaryColor: '#d946ef',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80',
      title: 'Burn Rate Calc',
      subtitle: 'Paracetamol • 4.2 days left',
      progress: 85,
      color: 'purple',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=150&q=80',
      title: 'Automated PO-9021',
      subtitle: 'Apollo Med Supply • 200 units',
      badge: 'Queued',
      color: 'fuchsia',
    },
    floatingPill: {
      label: 'AI Stockout Prevention',
      icon: 'sparkles',
    },
  },

  audit: {
    id: 'audit',
    name: 'Tamper-Evident Audit Trail',
    tagline: 'CRYPTOGRAPHIC COMPLIANCE HUB',
    headline: 'Complete transparency, verifiable trust.',
    subheadline:
      'Immutable timestamped telemetry logs, cryptographic actor attribution, and end-to-end drug batch traceability.',
    badgeText: 'Zero-Tampering Security Architecture',
    bgImageUrl:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-slate-600/20 via-sky-500/20 to-indigo-500/20',
    accentColor: '#0284c7',
    secondaryColor: '#64748b',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&q=80',
      title: 'Hash Verification',
      subtitle: 'SHA-256 Ledger Block #4812',
      progress: 100,
      color: 'sky',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=150&q=80',
      title: 'Actor Attribution',
      subtitle: 'Nurse Deepa Nair • RFID 04-A1',
      badge: 'Signed',
      color: 'slate',
    },
    floatingPill: {
      label: 'Tamper Evident',
      icon: 'shield',
    },
  },

  'iot-attendance': {
    id: 'iot-attendance',
    name: 'IoT & Attendance Gateway',
    tagline: 'BIOMETRIC HARDWARE ACCESS',
    headline: 'Instant recognition, secure access.',
    subheadline:
      'Edge ESP32 microcontrollers, R307 508 DPI optical ridge scanners, and 12V solenoid door strike relays for medical personnel and OPD patients.',
    badgeText: 'Team AtomiX • Hardware Biometric Gateway',
    bgImageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80',
    gradientAura: 'from-teal-500/20 via-cyan-400/20 to-emerald-300/15',
    accentColor: '#0d9488',
    secondaryColor: '#06b6d4',
    chip1: {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      title: 'R307 Optical Sensor',
      subtitle: 'Slot #01 • Dr. Sundar Kumar',
      progress: 99,
      color: 'teal',
    },
    chip2: {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      title: 'ICCU Solenoid Strike',
      subtitle: 'GPIO 26 • Relay Ready',
      badge: 'Online',
      color: 'emerald',
    },
    floatingPill: {
      label: '508 DPI FIDO2',
      icon: 'sparkles',
    },
  },
};
