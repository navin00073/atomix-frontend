import React, { createContext, useContext, useState, useEffect, useCallback, useTransition, useMemo } from 'react';
import {
  Patient,
  StaffMember,
  Medicine,
  VendingMachine,
  DeliveryRobot,
  IoTDevice,
  AuditLog,
  AlertNotification,
  MedicineTraceabilityRecord,
  PatientVisit,
  Prescription,
  Vitals,
  Consultation,
  PrescriptionItem,
  UserRole,
  SystemMode,
  ColorTheme,
  UserAccount,
  EmergencyIncident,
  EmergencyStageNumber,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_STAFF,
  INITIAL_MEDICINES,
  INITIAL_VENDING_MACHINES,
  INITIAL_ROBOTS,
  INITIAL_IOT_DEVICES,
  INITIAL_VISITS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ALERTS,
  INITIAL_TRACEABILITY,
} from '../data/seedData';
import { INITIAL_EMERGENCIES, DEMO_PRESET_EMERGENCIES } from '../data/emergencyData';
import { DEMO_USERS } from '../data/userData';
import { soundEffects } from '../utils/audio';
import { authApi, setToken } from '../api';

interface DemoProgress {
  isRunning: boolean;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
}

interface HospitalContextType {
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;
  toggleSystemMode: () => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  isEmergencyMode: boolean;
  emergencyPatientId: string | null;
  triggerEmergencyMode: (patientId?: string, reason?: string) => void;
  cancelEmergencyMode: () => void;

  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; user?: UserAccount; message: string }>;
  logout: () => void;

  // AI Emergency Response / Code Blue
  emergencies: EmergencyIncident[];
  activeEmergency: EmergencyIncident | null;
  triggerEmergencyAlert: (presetIndex?: number, customPatientId?: string) => void;
  advanceEmergencyStage: (emergencyId: string) => void;
  assignDoctorToEmergency: (emergencyId: string, doctorId: string) => void;
  assignNurseToEmergency: (emergencyId: string, nurseId: string) => void;
  dispatchEmergencyTeam: (emergencyId: string, teamName?: string) => void;
  prepareEmergencyMedicine: (emergencyId: string, medicineId: string) => void;
  markTeamReached: (emergencyId: string) => void;
  resolveEmergency: (emergencyId: string, outcomeNotes?: string) => void;
  triggerCameraAnomaly: (camId: string, anomalyType: string, location: string, autoCodeBlue?: boolean) => void;

  // Data collections
  patients: Patient[];
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedPatient: Patient | null;
  staff: StaffMember[];
  medicines: Medicine[];
  vendingMachines: VendingMachine[];
  robots: DeliveryRobot[];
  iotDevices: IoTDevice[];
  visits: PatientVisit[];
  prescriptions: Prescription[];
  auditLogs: AuditLog[];
  alerts: AlertNotification[];
  traceabilityRecords: MedicineTraceabilityRecord[];

  // Core workflows
  registerPatient: (patientData: Omit<Patient, 'id' | 'status' | 'registeredAt' | 'lastVisitDate'>) => Patient;
  updatePatient: (patientId: string, updatedData: Partial<Omit<Patient, 'id'>>) => Patient | null;
  deletePatient: (patientId: string) => boolean;
  clearAllPatients: () => void;
  checkInPatient: (patientId: string, method: 'Face' | 'RFID' | 'NFC' | 'QR' | 'Face + RFID' | 'Fingerprint', priority?: 'Normal' | 'High' | 'Emergency') => PatientVisit;
  deleteVisit: (visitId: string) => boolean;
  clearAllVisits: () => void;
  registerStaff: (staffData: Omit<StaffMember, 'id'>) => StaffMember;
  deleteStaff: (staffId: string) => boolean;
  clearAllStaff: (preserveAdmin?: boolean) => void;
  wipeDemoDataForFreshStart: () => void;
  toggleStaffStatus: (staffId: string, method?: 'RFID' | 'Face' | 'Fingerprint' | 'NFC', deviceId?: string) => { success: boolean; staffMember?: StaffMember; action: 'IN' | 'OUT'; timeStr: string };
  enrollStaffFingerprint: (staffId: string, slotId?: number) => { success: boolean; message: string };
  recordVitals: (visitId: string, vitals: Vitals) => void;
  saveConsultation: (visitId: string, consultation: Omit<Consultation, 'id' | 'timestamp'>, rxItems: PrescriptionItem[]) => void;
  verifyPrescription: (rxId: string) => void;
  dispenseVendingSlot: (vendingId: string, slotNumber: number, patientId: string, prescriptionId?: string, method?: string) => Promise<{ success: boolean; message: string }>;
  dispatchRobotMission: (robotId: string, prescriptionId: string, ward: string) => void;
  advanceRobotStep: (robotId: string) => void;
  confirmRobotDelivery: (robotId: string, recipientUid: string) => { success: boolean; message: string };
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addAlert: (alert: Omit<AlertNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAlertRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  approveAiReorder: (medicineId: string, quantity: number) => void;
  restockMedicine: (medicineId: string, quantity: number) => void;
  pingDevice: (deviceId: string) => void;
  restartDevice: (deviceId: string) => void;
  rebootDevice: (deviceId: string) => void;
  doctors: StaffMember[];
  createPrescription: (prescriptionData: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorNotes?: string;
    diagnosis?: string;
    medicines?: PrescriptionItem[];
    items?: PrescriptionItem[];
    destination?: string;
  }) => Prescription;
  dispensePrescription: (rxId: string, method?: string) => void;
  dispatchRobot: (robotId: string, destination: string, patientId?: string, prescriptionIds?: string[]) => void;

  // Simulation helpers
  simulateRfidScan: (uid: string) => { found: boolean; patient?: Patient; staff?: StaffMember };
  simulateNfcScan: (nfcId: string) => { found: boolean; patient?: Patient };
  simulateFaceMatch: (patientId: string) => { success: boolean; patient?: Patient; confidence: number };

  // One-Click Demo
  demoProgress: DemoProgress;
  runCompleteEndToEndDemo: () => Promise<void>;
  stopDemo: () => void;
  resetAllToDefault: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

let globalIdSequence = 1000;
export const generateUniqueId = (prefix: string): string => {
  globalIdSequence += 1;
  const time = Date.now().toString(36).toUpperCase();
  const seq = (globalIdSequence % 100000).toString(36).toUpperCase().padStart(4, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${time}-${seq}-${rand}`;
};

function ensureUniqueIds<T>(items: T[]): T[] {
  const seenIds = new Set<string>();
  return items.map((item, index) => {
    if (item && typeof item === 'object' && 'id' in item && typeof (item as Record<string, unknown>).id === 'string') {
      const currentId = (item as Record<string, unknown>).id as string;
      if (seenIds.has(currentId)) {
        const uniqueId = `${currentId}-${Date.now().toString(36)}-${index}-${Math.floor(100 + Math.random() * 900)}`;
        seenIds.add(uniqueId);
        return { ...item, id: uniqueId };
      }
      seenIds.add(currentId);
    }
    return item;
  });
}

function loadStorageArray<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return ensureUniqueIds(fallback);
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return ensureUniqueIds(parsed);
    }
    return ensureUniqueIds(fallback);
  } catch {
    return ensureUniqueIds(fallback);
  }
}

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, startTransition] = useTransition();

  // Mode and Role
  const [systemMode, setSystemMode] = useState<SystemMode>('SIMULATION');
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('atomix_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.role) return u.role;
      }
    } catch {}
    return 'ADMIN';
  });
  const [activeTab, setActiveTabState] = useState<string>('dashboard');

  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    if (role === 'PHARMACIST') {
      setActiveTabState((curr) =>
        ['pharmacy', 'vending', 'traceability', 'inventory', 'ai-forecasting'].includes(curr)
          ? curr
          : 'pharmacy'
      );
    } else if (role === 'DOCTOR') {
      setActiveTabState((curr) =>
        ['doctor', 'patients', 'visits', 'emergency', 'pharmacy', 'staff'].includes(curr)
          ? curr
          : 'doctor'
      );
    } else if (role === 'NURSE') {
      setActiveTabState((curr) =>
        ['visits', 'patients', 'emergency', 'staff', 'patient-portal'].includes(curr)
          ? curr
          : 'visits'
      );
    } else if (role === 'PATIENT') {
      setActiveTabState('patient-portal');
    }
  }, []);
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('atomix_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('atomix_theme', next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    try {
      localStorage.setItem('atomix_theme', t);
    } catch (e) {
      console.error(e);
    }
  };

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('atomix_color_theme') as ColorTheme;
      if (['cyan', 'sapphire', 'emerald', 'purple', 'amber', 'crimson'].includes(saved)) {
        return saved;
      }
      return 'cyan';
    } catch {
      return 'cyan';
    }
  });

  const setColorTheme = (ct: ColorTheme) => {
    setColorThemeState(ct);
    try {
      localStorage.setItem('atomix_color_theme', ct);
    } catch (e) {
      console.error(e);
    }
  };

  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);
  const [emergencyPatientId, setEmergencyPatientId] = useState<string | null>(null);

  // Entities
  const [patients, setPatients] = useState<Patient[]>(() => loadStorageArray('techshield_patients', INITIAL_PATIENTS));
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('PT-1024');
  const [staff, setStaff] = useState<StaffMember[]>(() => loadStorageArray('techshield_staff', INITIAL_STAFF));
  const [medicines, setMedicines] = useState<Medicine[]>(() => loadStorageArray('techshield_medicines', INITIAL_MEDICINES));
  const [vendingMachines, setVendingMachines] = useState<VendingMachine[]>(() => loadStorageArray('techshield_vending', INITIAL_VENDING_MACHINES));
  const [robots, setRobots] = useState<DeliveryRobot[]>(() => loadStorageArray('techshield_robots', INITIAL_ROBOTS));
  const [iotDevices, setIotDevices] = useState<IoTDevice[]>(() => loadStorageArray('techshield_devices', INITIAL_IOT_DEVICES));
  const [visits, setVisits] = useState<PatientVisit[]>(() => loadStorageArray('techshield_visits', INITIAL_VISITS));
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => loadStorageArray('techshield_prescriptions', INITIAL_PRESCRIPTIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorageArray('techshield_audit', INITIAL_AUDIT_LOGS));
  const [alerts, setAlerts] = useState<AlertNotification[]>(() => loadStorageArray('techshield_alerts', INITIAL_ALERTS));
  const [traceabilityRecords, setTraceabilityRecords] = useState<MedicineTraceabilityRecord[]>(() => loadStorageArray('techshield_traceability', INITIAL_TRACEABILITY));

  // Authentication & Current User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('atomix_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('atomix_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Emergencies & Code Blue
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>(() =>
    loadStorageArray('atomix_emergencies', INITIAL_EMERGENCIES)
  );

  const activeEmergency = useMemo(() => {
    return emergencies.find((e) => e.status === 'ACTIVE' || e.status === 'RESPONDING' || e.status === 'AT_SCENE') || null;
  }, [emergencies]);

  // Demo state
  const [demoProgress, setDemoProgress] = useState<DemoProgress>({
    isRunning: false,
    step: 0,
    totalSteps: 21,
    title: '',
    description: '',
  });

  // Keep localStorage updated
  useEffect(() => {
    try {
      localStorage.setItem('techshield_patients', JSON.stringify(patients));
      localStorage.setItem('techshield_staff', JSON.stringify(staff));
      localStorage.setItem('techshield_medicines', JSON.stringify(medicines));
      localStorage.setItem('techshield_vending', JSON.stringify(vendingMachines));
      localStorage.setItem('techshield_robots', JSON.stringify(robots));
      localStorage.setItem('techshield_visits', JSON.stringify(visits));
      localStorage.setItem('techshield_prescriptions', JSON.stringify(prescriptions));
      localStorage.setItem('techshield_audit', JSON.stringify(auditLogs));
      localStorage.setItem('techshield_alerts', JSON.stringify(alerts));
      localStorage.setItem('techshield_traceability', JSON.stringify(traceabilityRecords));
      localStorage.setItem('atomix_emergencies', JSON.stringify(emergencies));
      if (currentUser) {
        localStorage.setItem('atomix_user', JSON.stringify(currentUser));
      }
      localStorage.setItem('atomix_auth', isAuthenticated ? 'true' : 'false');
    } catch {}
  }, [patients, staff, medicines, vendingMachines, robots, visits, prescriptions, auditLogs, alerts, traceabilityRecords, emergencies, currentUser, isAuthenticated]);

  // Emergency countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setEmergencies((prev) =>
        prev.map((emg) => {
          if (emg.status === 'ACTIVE' || emg.status === 'RESPONDING' || emg.status === 'AT_SCENE') {
            const nextCountdown = Math.max(0, emg.countdownSeconds - 1);
            const nextElapsed = emg.elapsedSeconds + 1;
            return {
              ...emg,
              countdownSeconds: nextCountdown,
              elapsedSeconds: nextElapsed,
            };
          }
          return emg;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Authentication methods
  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    const trimmedEmail = email.trim().toLowerCase();
    let userToLogin: UserAccount | null = null;

    // Try the real backend first (Node/Express + SQLite, see /backend folder).
    try {
      const result = await authApi.login(trimmedEmail, password);
      if (result?.success && result.user) {
        userToLogin = result.user;
        setToken(result.token);
      }
    } catch (err) {
      // Backend unreachable or invalid credentials — fall back to local demo
      // data below so the UI still works when the backend isn't running.
      console.warn('Backend login failed, falling back to local demo auth:', err);
    }

    if (!userToLogin) {
      const matched = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === trimmedEmail && (u.password === password || password === 'atomix2026' || password === 'admin' || password === 'doctor')
      );

      userToLogin = matched
        ? {
            id: matched.id,
            name: matched.name,
            email: matched.email,
            role: matched.role,
            department: matched.department,
            title: matched.title,
            badgeId: matched.badgeId,
            avatarUrl: matched.avatarUrl,
            lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : {
            id: generateUniqueId('USR'),
            name: email.split('@')[0].toUpperCase(),
            email: trimmedEmail,
            role: 'ADMIN',
            department: 'Emergency & Clinical Operations',
            title: 'Staff Physician / Command Station Lead',
            badgeId: 'BADGE-STAFF-8841',
            avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
            lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

      if (!DEMO_USERS.some((u) => u.email.toLowerCase() === trimmedEmail)) {
        return { success: false, message: 'Invalid email or password' };
      }
    }

    setCurrentUser(userToLogin);
    setIsAuthenticated(true);
    setCurrentRole(userToLogin.role);

    // Automatic role-based default tab landing
    if (userToLogin.role === 'PHARMACIST') {
      setActiveTabState('pharmacy');
    } else if (userToLogin.role === 'DOCTOR') {
      setActiveTabState('doctor');
    } else if (userToLogin.role === 'PATIENT') {
      setActiveTabState('patient-portal');
    } else if (userToLogin.role === 'NURSE') {
      setActiveTabState('visits');
    } else {
      setActiveTabState('dashboard');
    }

    if (rememberMe) {
      try {
        localStorage.setItem('atomix_auth', 'true');
        localStorage.setItem('atomix_user', JSON.stringify(userToLogin));
      } catch {}
    }

    soundEffects.playSuccessChirp();
    return { success: true, user: userToLogin, message: 'Authentication successful' };
  }, [setCurrentRole]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentRoleState('ADMIN');
    setActiveTabState('dashboard');
    try {
      localStorage.removeItem('atomix_auth');
      localStorage.removeItem('atomix_user');
    } catch {}
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    startTransition(() => {
      setActiveTabState(tab);
    });
  }, []);

  const toggleSystemMode = useCallback(() => {
    setSystemMode((prev) => {
      const next = prev === 'SIMULATION' ? 'LIVE HARDWARE' : 'SIMULATION';
      soundEffects.playCardScan();
      return next;
    });
  }, []);

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: AuditLog = {
      id: generateUniqueId('LOG'),
      timestamp: timeStr,
      ...log,
    };
    setAuditLogs((prev) => {
      const seen = new Set<string>([newLog.id]);
      const dedupedPrev = prev.filter((p) => {
        if (!p.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      return [newLog, ...dedupedPrev.slice(0, 99)];
    });
  }, []);

  const addAlert = useCallback((alert: Omit<AlertNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newAlert: AlertNotification = {
      id: generateUniqueId('ALT'),
      timestamp: 'Just now',
      isRead: false,
      ...alert,
    };
    setAlerts((prev) => {
      const seen = new Set<string>([newAlert.id]);
      const dedupedPrev = prev.filter((a) => {
        if (!a.id || seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      return [newAlert, ...dedupedPrev];
    });
    if (alert.severity === 'CRITICAL') {
      soundEffects.playEmergencyAlert();
    }
  }, []);

  const markAlertRead = useCallback((alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Emergency Mode triggers
  const triggerEmergencyMode = useCallback(
    (patientId?: string, reason?: string) => {
      setIsEmergencyMode(true);
      if (patientId) setEmergencyPatientId(patientId);
      soundEffects.playEmergencyAlert();

      addAlert({
        title: 'EMERGENCY PROTOCOL ACTIVATED',
        message: reason || `Emergency triage override initiated for ${patientId || 'Code Blue Incident'}. All robots prioritized.`,
        severity: 'CRITICAL',
        category: 'EMERGENCY',
        linkTab: 'dashboard',
      });

      addAuditLog({
        actor: 'Admin / Command Desk',
        role: 'ADMIN',
        action: 'EMERGENCY PROTOCOL ACTIVATED',
        details: `Hospital Emergency Mode enabled. Reason: ${reason || 'Immediate critical intervention required'}.`,
        category: 'EMERGENCY',
        severity: 'CRITICAL',
        patientId,
      });
    },
    [addAlert, addAuditLog]
  );

  const cancelEmergencyMode = useCallback(() => {
    setIsEmergencyMode(false);
    setEmergencyPatientId(null);
    addAuditLog({
      actor: 'Admin / Command Desk',
      role: 'ADMIN',
      action: 'Emergency Deactivated',
      details: 'Hospital returned to standard operational state.',
      category: 'EMERGENCY',
      severity: 'INFO',
    });
  }, [addAuditLog]);

  // AI Emergency Response / Code Blue Module Operations
  const triggerEmergencyAlert = useCallback(
    (presetIndex = 0, customPatientId?: string) => {
      const preset = DEMO_PRESET_EMERGENCIES[presetIndex % DEMO_PRESET_EMERGENCIES.length];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const emgId = `EMG-${now.getFullYear()}-${Math.floor(100 + Math.random() * 899)}`;

      const newEmergency: EmergencyIncident = {
        id: emgId,
        code: preset.code,
        title: preset.title,
        severity: 'CRITICAL',
        status: 'ACTIVE',
        patientId: customPatientId || preset.patientId,
        patientName: preset.patientName,
        age: preset.age,
        gender: preset.gender,
        bloodGroup: preset.bloodGroup,
        location: preset.location,
        detectedAt: timeStr,
        detectionSource: preset.source,
        currentStage: 2,
        stageHistory: [
          {
            stage: 1,
            title: 'Emergency Detected',
            timestamp: timeStr,
            actor: `${preset.source} (${preset.location.room} - ${preset.location.bed})`,
            completed: true,
          },
          {
            stage: 2,
            title: 'AI Alert Triggered',
            timestamp: timeStr,
            actor: 'AtomiX AI Medical Dispatch (Code Blue Broadcasted)',
            completed: true,
          },
          {
            stage: 3,
            title: 'Nearest Nurse Notified',
            timestamp: 'Pending',
            actor: 'Nurse Deepa V. (12m away)',
            completed: false,
          },
          {
            stage: 4,
            title: 'Doctor Assigned',
            timestamp: 'Pending',
            actor: 'Dr. Anand Verma MD (Critical Care Lead)',
            completed: false,
          },
          {
            stage: 5,
            title: 'Emergency Medicine Prepared',
            timestamp: 'Pending',
            actor: 'Smart Vending VM-01 Crash Slot #01',
            completed: false,
          },
          {
            stage: 6,
            title: 'Team Reached Patient',
            timestamp: 'Pending',
            actor: 'Rapid Response Team Alpha',
            completed: false,
          },
          {
            stage: 7,
            title: 'Emergency Resolved',
            timestamp: 'Pending',
            actor: 'Attending Resuscitation Team',
            completed: false,
          },
        ],
        assignedDoctor: {
          id: 'DOC-01',
          name: 'Dr. Anand Verma MD',
          specialization: 'Pulmonology & Critical Care',
          distanceMeters: 45,
          etaSeconds: 40,
          contact: '+91 98400 11111',
          acknowledged: false,
        },
        assignedNurse: {
          id: 'NUR-01',
          name: 'Nurse Deepa V. (Head Nurse)',
          department: 'Inpatient Ward & ICU',
          distanceMeters: 12,
          etaSeconds: 15,
          acknowledged: false,
        },
        emergencyTeam: {
          id: 'TEAM-ALPHA',
          name: 'Rapid Response Team Alpha',
          leadDoctor: 'Dr. Anand Verma MD',
          status: 'En Route',
        },
        requiredMedicines: [
          {
            id: 'MED-09',
            name: 'Epinephrine Injection (1mg / 1mL ampoule)',
            dosage: '1mg IV push every 3-5 min',
            route: 'Intravenous',
            prepared: false,
            source: 'Smart Vending VM-01 Slot 01',
          },
          {
            id: 'MED-08',
            name: 'Atropine Sulfate (0.5mg / 5mL)',
            dosage: '1mg IV push',
            route: 'Intravenous',
            prepared: false,
            source: 'Emergency Crash Cart #02',
          },
          {
            id: 'MED-12',
            name: 'Amiodarone (150mg / 3mL vial)',
            dosage: '300mg IV push in 20-30mL D5W',
            route: 'Intravenous',
            prepared: false,
            source: 'Emergency Crash Cart #02',
          },
        ],
        requiredEquipment: [
          {
            name: 'Biphasic Defibrillator (Zoll R Series #02)',
            location: 'ICU Corridor Station A (8m away)',
            ready: true,
          },
          {
            name: 'Emergency Crash Cart (CC-ICU-01)',
            location: 'ICU Station B (14m away)',
            ready: true,
          },
          {
            name: 'High-Flow Suction & Bag-Valve-Mask (BVM)',
            location: 'Bedside Console',
            ready: true,
          },
        ],
        countdownSeconds: 180,
        elapsedSeconds: 0,
      };

      setEmergencies((prev) => [newEmergency, ...prev]);
      setIsEmergencyMode(true);
      setEmergencyPatientId(newEmergency.patientId);
      soundEffects.playEmergencyAlert();

      addAlert({
        title: `${newEmergency.code}: ${newEmergency.patientName} (${newEmergency.location.bed})`,
        message: `${newEmergency.title} in ${newEmergency.location.room}. Nearest nurse notified; Rapid response team dispatched.`,
        severity: 'CRITICAL',
        category: 'EMERGENCY',
        linkTab: 'emergency',
      });

      addAuditLog({
        actor: 'AtomiX Emergency Engine',
        role: 'AI DISPATCH',
        action: `${newEmergency.code} Initiated`,
        details: `${newEmergency.title} triggered for ${newEmergency.patientName} (${newEmergency.patientId}) at ${newEmergency.location.room}. Target response time: 3 mins.`,
        category: 'EMERGENCY',
        severity: 'CRITICAL',
        patientId: newEmergency.patientId,
      });

      // Navigate to emergency module
      startTransition(() => {
        setActiveTabState('emergency');
      });
    },
    [addAlert, addAuditLog]
  );

  const advanceEmergencyStage = useCallback(
    (emergencyId: string) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setEmergencies((prev) =>
        prev.map((emg) => {
          if (emg.id !== emergencyId) return emg;
          const nextStageNum = Math.min(7, emg.currentStage + 1) as EmergencyStageNumber;
          const isResolved = nextStageNum === 7;

          const stageTitles: Record<EmergencyStageNumber, string> = {
            1: 'Emergency Detected',
            2: 'AI Alert Triggered',
            3: 'Nearest Nurse Notified',
            4: 'Doctor Assigned',
            5: 'Emergency Medicine Prepared',
            6: 'Team Reached Patient',
            7: 'Emergency Resolved',
          };

          const updatedHistory = emg.stageHistory.map((s) => {
            if (s.stage <= nextStageNum) {
              return {
                ...s,
                completed: true,
                timestamp: s.timestamp === 'Pending' ? timeStr : s.timestamp,
              };
            }
            return s;
          });

          return {
            ...emg,
            currentStage: nextStageNum,
            status: isResolved ? 'RESOLVED' : emg.status === 'ACTIVE' ? 'RESPONDING' : emg.status,
            resolvedAt: isResolved ? timeStr : emg.resolvedAt,
            outcomeNotes: isResolved ? 'Patient stabilized, rhythm restored, vitals monitored.' : emg.outcomeNotes,
            stageHistory: updatedHistory,
          };
        })
      );

      soundEffects.playSuccessChirp();
    },
    []
  );

  const assignDoctorToEmergency = useCallback((emergencyId: string, doctorId: string) => {
    const doc = staff.find((s) => s.id === doctorId) || {
      id: doctorId,
      name: 'Dr. Anand Verma MD',
      specialization: 'Critical Care Lead',
      phone: '+91 98400 11111',
    };

    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        return {
          ...emg,
          assignedDoctor: {
            id: doc.id,
            name: doc.name,
            specialization: doc.specialization || 'Critical Care Lead',
            distanceMeters: 25,
            etaSeconds: 20,
            contact: doc.phone || '+91 98400 11111',
            acknowledged: true,
          },
        };
      })
    );
    soundEffects.playCardScan();
  }, [staff]);

  const assignNurseToEmergency = useCallback((emergencyId: string, nurseId: string) => {
    const nurse = staff.find((s) => s.id === nurseId) || {
      id: nurseId,
      name: 'Nurse Deepa V. RN',
      department: 'Inpatient Ward 1 & ICU',
    };

    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        return {
          ...emg,
          assignedNurse: {
            id: nurse.id,
            name: nurse.name,
            department: nurse.department,
            distanceMeters: 8,
            etaSeconds: 10,
            acknowledged: true,
          },
        };
      })
    );
    soundEffects.playCardScan();
  }, [staff]);

  const dispatchEmergencyTeam = useCallback((emergencyId: string, teamName = 'Rapid Response Team Alpha') => {
    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        return {
          ...emg,
          emergencyTeam: {
            id: 'TEAM-ALPHA',
            name: teamName,
            leadDoctor: emg.assignedDoctor?.name || 'Dr. Anand Verma MD',
            status: 'En Route',
          },
          status: 'RESPONDING',
        };
      })
    );
    soundEffects.playCardScan();
  }, []);

  const prepareEmergencyMedicine = useCallback((emergencyId: string, medicineId: string) => {
    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        const updatedMeds = emg.requiredMedicines.map((m) =>
          m.id === medicineId ? { ...m, prepared: true } : m
        );
        return {
          ...emg,
          requiredMedicines: updatedMeds,
        };
      })
    );
    soundEffects.playDispenseSound();
  }, []);

  const markTeamReached = useCallback((emergencyId: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        const nextStage: EmergencyStageNumber = emg.currentStage < 6 ? 6 : emg.currentStage;
        return {
          ...emg,
          status: 'AT_SCENE',
          currentStage: nextStage,
          emergencyTeam: emg.emergencyTeam
            ? { ...emg.emergencyTeam, status: 'On Scene' }
            : undefined,
          stageHistory: emg.stageHistory.map((s) =>
            s.stage <= 6 ? { ...s, completed: true, timestamp: s.timestamp === 'Pending' ? timeStr : s.timestamp } : s
          ),
        };
      })
    );
    soundEffects.playSuccessChirp();
  }, []);

  const resolveEmergency = useCallback(
    (emergencyId: string, outcomeNotes = 'Patient stabilized; sinus rhythm restored; vitals transferred to ICU monitor.') => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setEmergencies((prev) =>
        prev.map((emg) => {
          if (emg.id !== emergencyId) return emg;
          return {
            ...emg,
            status: 'RESOLVED',
            currentStage: 7 as EmergencyStageNumber,
            resolvedAt: timeStr,
            outcomeNotes,
            stageHistory: emg.stageHistory.map((s) => ({
              ...s,
              completed: true,
              timestamp: s.timestamp === 'Pending' ? timeStr : s.timestamp,
            })),
          };
        })
      );

      setIsEmergencyMode(false);
      soundEffects.playSuccessChirp();

      addAlert({
        title: `EMERGENCY RESOLVED — ${emergencyId}`,
        message: `Patient resuscitated and stable. Emergency workflow closed successfully.`,
        severity: 'INFO',
        category: 'EMERGENCY',
        linkTab: 'emergency',
      });

      addAuditLog({
        actor: 'Attending Physician & Rapid Response',
        role: 'DOCTOR',
        action: 'Emergency Resolved',
        details: `Incident ${emergencyId} successfully stabilized. Notes: ${outcomeNotes}`,
        category: 'EMERGENCY',
        severity: 'INFO',
      });
    },
    [addAlert, addAuditLog]
  );

  // Camera Anomaly Integration
  const triggerCameraAnomaly = useCallback(
    (camId: string, anomalyType: string, location: string, autoCodeBlue = false) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      addAlert({
        title: `AI Vision Anomaly: ${anomalyType}`,
        message: `Detected at ${location} (${camId}) at ${timeStr}. Real-time computer vision alert dispatched to station.`,
        severity: autoCodeBlue ? 'CRITICAL' : 'WARNING',
        category: 'CAMERA_AI',
        linkTab: 'camera',
      });

      addAuditLog({
        actor: camId,
        role: 'AI CAMERA',
        action: 'Visual Anomaly Detected',
        details: `${anomalyType} identified at ${location}. Real-time bounding box generated with 98.6% confidence.`,
        category: 'SYSTEM',
        severity: autoCodeBlue ? 'CRITICAL' : 'WARNING',
        deviceId: camId,
      });

      if (autoCodeBlue) {
        triggerEmergencyAlert(0);
      } else {
        soundEffects.playEmergencyAlert();
      }
    },
    [addAlert, addAuditLog, triggerEmergencyAlert]
  );

  // Selected Patient
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || null;

  // Register New Patient
  const registerPatient = useCallback(
    (patientData: Omit<Patient, 'id' | 'status' | 'registeredAt' | 'lastVisitDate'>) => {
      const nextNum = patients.length + 1024;
      const newId = `PT-${nextNum}`;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const newPatient: Patient = {
        ...patientData,
        id: newId,
        status: 'Registered',
        registeredAt: dateStr,
        lastVisitDate: dateStr,
      };

      setPatients((prev) => [newPatient, ...prev]);
      setSelectedPatientId(newId);
      soundEffects.playSuccessChirp();

      addAuditLog({
        actor: 'Reception Terminal',
        role: 'REGISTRATION',
        action: 'Patient Enrolled',
        details: `Enrolled ${newPatient.name} (${newId}) with Multi-Modal identifiers: Face=${newPatient.identifiers.faceRegistered ? 'Yes' : 'No'}, RFID=${newPatient.identifiers.rfidUid || 'None'}, NFC=${newPatient.identifiers.nfcId || 'None'}, QR=${newPatient.identifiers.qrCode}.`,
        category: 'IDENTIFICATION',
        severity: 'INFO',
        patientId: newId,
      });

      return newPatient;
    },
    [patients.length, addAuditLog]
  );

  // Update Existing Patient Details
  const updatePatient = useCallback(
    (patientId: string, updatedData: Partial<Omit<Patient, 'id'>>) => {
      let updatedPt: Patient | null = null;
      setPatients((prev) =>
        prev.map((pt) => {
          if (pt.id === patientId) {
            updatedPt = {
              ...pt,
              ...updatedData,
              identifiers: {
                ...pt.identifiers,
                ...(updatedData.identifiers || {}),
              },
              emergencyContact: {
                ...pt.emergencyContact,
                ...(updatedData.emergencyContact || {}),
              },
            };
            return updatedPt;
          }
          return pt;
        })
      );

      if (updatedPt) {
        soundEffects.playSuccessChirp();
        addAuditLog({
          actor: 'Staff / Admin',
          role: 'REGISTRATION',
          action: 'Patient Profile Updated',
          details: `Updated details for ${(updatedPt as Patient).name} (${patientId}). Changes synchronized with EMR.`,
          category: 'IDENTIFICATION',
          severity: 'INFO',
          patientId,
        });
      }

      return updatedPt;
    },
    [addAuditLog]
  );

  // Delete Patient Record
  const deletePatient = useCallback(
    (patientId: string) => {
      let ptName = '';
      const existing = patients.find((p) => p.id === patientId);
      if (!existing) return false;
      ptName = existing.name;

      setPatients((prev) => prev.filter((pt) => pt.id !== patientId));

      if (selectedPatientId === patientId) {
        const remaining = patients.filter((pt) => pt.id !== patientId);
        setSelectedPatientId(remaining[0]?.id || null);
      }

      soundEffects.playCardScan();
      addAuditLog({
        actor: 'Staff / Admin',
        role: 'REGISTRATION',
        action: 'Patient Record Deleted',
        details: `Deleted patient profile ${ptName} (${patientId}) and purged registration data.`,
        category: 'SECURITY',
        severity: 'WARNING',
        patientId,
      });

      return true;
    },
    [patients, selectedPatientId, addAuditLog]
  );

  // Clear All Patients
  const clearAllPatients = useCallback(() => {
    const count = patients.length;
    setPatients([]);
    setSelectedPatientId(null);
    setVisits([]);
    soundEffects.playCardScan();
    addAuditLog({
      actor: 'Staff / Admin',
      role: 'REGISTRATION',
      action: 'All Patients Cleared',
      details: `Purged ${count} patient profiles and associated queue records for fresh enrollment.`,
      category: 'SECURITY',
      severity: 'WARNING',
    });
  }, [patients.length, addAuditLog]);

  // Delete Individual Patient Visit / Queue item
  const deleteVisit = useCallback(
    (visitId: string) => {
      const targetVisit = visits.find((v) => v.id === visitId);
      if (!targetVisit) return false;

      setVisits((prev) => prev.filter((v) => v.id !== visitId));

      // Reset patient's current token and status if this was their active visit
      setPatients((prev) =>
        prev.map((pt) => {
          if (pt.id === targetVisit.patientId && pt.currentToken === targetVisit.tokenNumber) {
            return {
              ...pt,
              status: 'Registered',
              currentToken: undefined,
            };
          }
          return pt;
        })
      );

      soundEffects.playCardScan();
      addAuditLog({
        actor: 'Reception / Triage Queue',
        role: 'QUEUE',
        action: 'Visit Removed from Queue',
        details: `Deleted visit record ${visitId} (Token: ${targetVisit.tokenNumber}, Patient: ${targetVisit.patientName}).`,
        category: 'SYSTEM',
        severity: 'INFO',
        patientId: targetVisit.patientId,
      });

      return true;
    },
    [visits, addAuditLog]
  );

  // Clear All Visits / Entire Queue
  const clearAllVisits = useCallback(() => {
    const count = visits.length;
    setVisits([]);
    setPatients((prev) =>
      prev.map((pt) => ({
        ...pt,
        status: pt.status === 'Checked In' || pt.status === 'Consultation' ? 'Registered' : pt.status,
        currentToken: undefined,
      }))
    );
    soundEffects.playCardScan();
    addAuditLog({
      actor: 'Reception / Staff',
      role: 'QUEUE',
      action: 'All Visits Cleared',
      details: `Purged all ${count} visits from the active hospital consultation and pharmacy queue.`,
      category: 'SYSTEM',
      severity: 'WARNING',
    });
  }, [visits.length, addAuditLog]);

  // Register New Doctor / Staff Member
  const registerStaff = useCallback(
    (staffData: Omit<StaffMember, 'id'>) => {
      const prefix =
        staffData.role === 'Doctor'
          ? 'DOC'
          : staffData.role === 'Nurse'
          ? 'NUR'
          : staffData.role === 'Pharmacist'
          ? 'PHM'
          : staffData.role === 'Admin'
          ? 'ADM'
          : 'TECH';
      const randNum = Math.floor(10 + Math.random() * 89);
      const newId = `${prefix}-${randNum}`;

      const newMember: StaffMember = {
        ...staffData,
        id: newId,
        faceRegistered: staffData.faceRegistered ?? true,
        fingerprintRegistered: staffData.fingerprintRegistered ?? true,
        status: staffData.status || 'Present',
        rfidUid: staffData.rfidUid || `04:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:A1`,
        nfcId: staffData.nfcId || `NFC-STF-${randNum}`,
      };

      setStaff((prev) => [newMember, ...prev]);
      soundEffects.playSuccessChirp();

      addAuditLog({
        actor: 'Hospital Administration',
        role: 'HR',
        action: 'Staff Member Enrolled',
        details: `Registered ${newMember.role} ${newMember.name} (${newId}) in ${newMember.department}. RFID: ${newMember.rfidUid}.`,
        category: 'IDENTIFICATION',
        severity: 'INFO',
      });

      return newMember;
    },
    [addAuditLog]
  );

  // Delete Doctor / Staff Member
  const deleteStaff = useCallback(
    (staffId: string) => {
      const existing = staff.find((s) => s.id === staffId);
      if (!existing) return false;

      setStaff((prev) => prev.filter((s) => s.id !== staffId));
      soundEffects.playCardScan();

      addAuditLog({
        actor: 'Hospital Administration',
        role: 'HR',
        action: 'Staff Member Deleted',
        details: `Removed ${existing.role} ${existing.name} (${staffId}) from personnel registry.`,
        category: 'SECURITY',
        severity: 'WARNING',
      });

      return true;
    },
    [staff, addAuditLog]
  );

  // Clear All Staff / Personnel
  const clearAllStaff = useCallback(
    (preserveAdmin = false) => {
      const prevCount = staff.length;
      if (preserveAdmin) {
        setStaff((prev) => prev.filter((s) => s.role === 'Admin'));
      } else {
        setStaff([]);
      }
      soundEffects.playCardScan();
      addAuditLog({
        actor: 'Hospital Administration',
        role: 'HR',
        action: 'Staff Roster Cleared',
        details: `Purged ${prevCount} staff and doctor records for fresh team onboarding.`,
        category: 'SECURITY',
        severity: 'WARNING',
      });
    },
    [staff.length, addAuditLog]
  );

  // Wipe Demo Data for Fresh Start (Zero Patients, Zero Doctors/Staff, Zero Visits)
  const wipeDemoDataForFreshStart = useCallback(() => {
    setPatients([]);
    setSelectedPatientId(null);
    setStaff([]);
    setVisits([]);
    setPrescriptions([]);
    setIsEmergencyMode(false);
    setEmergencies([]);
    soundEffects.playCardScan();
    addAuditLog({
      actor: 'System Administrator',
      role: 'SYSTEM',
      action: 'Demo Data Purged (Fresh Slate)',
      details: 'All demo patients, doctors, staff records, active visits, and prescriptions have been wiped clean. Ready for fresh user entry.',
      category: 'SECURITY',
      severity: 'WARNING',
    });
  }, [addAuditLog]);

  // Check In Patient (Attendance & Visit Creation)
  const checkInPatient = useCallback(
    (patientId: string, method: 'Face' | 'RFID' | 'NFC' | 'QR' | 'Face + RFID' | 'Fingerprint', priority: 'Normal' | 'High' | 'Emergency' = 'Normal') => {
      const p = patients.find((pt) => pt.id === patientId);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tokenNum = `TKN-${Math.floor(100 + Math.random() * 899)}`;
      const visitId = generateUniqueId('VST');

      // Update patient status and current token
      setPatients((prev) =>
        prev.map((item) =>
          item.id === patientId
            ? { ...item, status: 'Checked In', currentToken: tokenNum, lastVisitDate: now.toISOString().split('T')[0] }
            : item
        )
      );

      const newVisit: PatientVisit = {
        id: visitId,
        patientId,
        patientName: p?.name || 'Unknown Patient',
        tokenNumber: tokenNum,
        checkInTime: timeStr,
        method,
        status: 'Checked In',
        priority,
        doctorId: 'DOC-01',
        doctorName: 'Dr. Sundar Kumar MD',
      };

      setVisits((prev) => [newVisit, ...prev]);
      soundEffects.playCardScan();

      addAuditLog({
        actor: `Check-in Terminal (${method})`,
        role: 'TERMINAL',
        action: 'Patient Checked In',
        details: `${p?.name || patientId} identified via ${method}. Generated ${tokenNum}. Status: Checked In.`,
        category: 'IDENTIFICATION',
        severity: priority === 'Emergency' ? 'CRITICAL' : 'INFO',
        patientId,
      });

      if (priority === 'Emergency') {
        triggerEmergencyMode(patientId, `Emergency check-in for ${p?.name || patientId}`);
      }

      return newVisit;
    },
    [patients, addAuditLog, triggerEmergencyMode]
  );

  // Toggle Staff Status (Biometric Fingerprint / RFID / Face Attendance)
  const toggleStaffStatus = useCallback(
    (staffId: string, method: 'RFID' | 'Face' | 'Fingerprint' | 'NFC' = 'Fingerprint', deviceId = 'ESP32-BIO-01') => {
      soundEffects.playCardScan();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let action: 'IN' | 'OUT' = 'IN';
      let foundStaff: StaffMember | undefined;

      setStaff((prev) =>
        prev.map((s) => {
          if (s.id === staffId) {
            foundStaff = s;
            const isCurrentlyPresent = s.status === 'Present' || s.status === 'On Duty';
            const nextStatus = isCurrentlyPresent ? 'Checked Out' : 'Present';
            action = nextStatus === 'Present' ? 'IN' : 'OUT';

            addAuditLog({
              actor: s.name,
              role: s.role.toUpperCase(),
              action: nextStatus === 'Present' ? 'Staff Clock-In' : 'Staff Clock-Out',
              details: `${s.name} (${s.id}) clocked ${nextStatus.toLowerCase()} via IoT ${method} Biometrics at ${timeStr} [Device: ${deviceId}]. Department: ${s.department}.`,
              category: 'IDENTIFICATION',
              severity: 'INFO',
            });

            return {
              ...s,
              status: nextStatus,
              checkInTime: nextStatus === 'Present' ? timeStr : s.checkInTime,
            };
          }
          return s;
        })
      );

      soundEffects.playSuccessChirp();
      return { success: true, staffMember: foundStaff, action, timeStr };
    },
    [addAuditLog]
  );

  // Enroll Staff Fingerprint into IoT Node
  const enrollStaffFingerprint = useCallback(
    (staffId: string, slotId = 1) => {
      soundEffects.playSuccessChirp();
      const fpId = `FP-${slotId.toString().padStart(2, '0')}`;
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffId ? { ...s, fingerprintRegistered: true, fingerprintId: fpId } : s
        )
      );
      addAuditLog({
        actor: 'IoT Enrollment Station',
        role: 'SECURITY',
        action: 'Fingerprint Enrolled',
        details: `Enrolled biometric template for Staff ID ${staffId} into ESP32 AS608 Slot #${slotId} (${fpId}).`,
        category: 'IDENTIFICATION',
        severity: 'INFO',
      });
      return { success: true, message: `Fingerprint successfully enrolled to Slot #${slotId} (${fpId})` };
    },
    [addAuditLog]
  );

  // Record Vitals
  const recordVitals = useCallback(
    (visitId: string, vitals: Vitals) => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id === visitId) {
            return {
              ...v,
              vitals,
              status: 'Waiting',
            };
          }
          return v;
        })
      );

      // Also update patient status
      const visit = visits.find((v) => v.id === visitId);
      if (visit) {
        setPatients((prev) =>
          prev.map((p) => (p.id === visit.patientId ? { ...p, status: 'Waiting' } : p))
        );
      }

      soundEffects.playSuccessChirp();

      addAuditLog({
        actor: 'Nurse Station',
        role: 'NURSE',
        action: 'Vitals Logged',
        details: `Vitals recorded for ${visit?.patientName || visitId}: Temp ${vitals.temperatureC}°C, HR ${vitals.heartRateBpm} bpm, BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, SpO2 ${vitals.spo2Percent}%. Abnormal: ${vitals.isAbnormal ? 'YES' : 'NO'}.`,
        category: 'CONSULTATION',
        severity: vitals.isAbnormal ? 'WARNING' : 'INFO',
        patientId: visit?.patientId,
      });
    },
    [visits, addAuditLog]
  );

  // Save Consultation & Create Prescription
  const saveConsultation = useCallback(
    (visitId: string, consultationData: Omit<Consultation, 'id' | 'timestamp'>, rxItems: PrescriptionItem[]) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const consId = generateUniqueId('CNS');
      const rxId = generateUniqueId('RX');

      const consultation: Consultation = {
        id: consId,
        timestamp: timeStr,
        ...consultationData,
      };

      const prescription: Prescription = {
        id: rxId,
        patientId: consultationData.patientId,
        patientName: patients.find((p) => p.id === consultationData.patientId)?.name || 'Patient',
        doctorId: consultationData.doctorId,
        doctorName: consultationData.doctorName,
        items: rxItems,
        status: 'Sent to Pharmacy',
        createdAt: timeStr,
      };

      setPrescriptions((prev) => [prescription, ...prev]);

      setVisits((prev) =>
        prev.map((v) => {
          if (v.id === visitId) {
            return {
              ...v,
              consultation,
              prescriptionId: rxId,
              status: 'Pharmacy',
            };
          }
          return v;
        })
      );

      setPatients((prev) =>
        prev.map((p) => (p.id === consultationData.patientId ? { ...p, status: 'Pharmacy' } : p))
      );

      soundEffects.playSuccessChirp();

      addAuditLog({
        actor: consultationData.doctorName,
        role: 'DOCTOR',
        action: 'Consultation & Rx Created',
        details: `Doctor completed consultation for ${prescription.patientName}. Diagnosis: ${consultation.diagnosis}. Prescription ${rxId} sent to Pharmacy with ${rxItems.length} item(s).`,
        category: 'CONSULTATION',
        severity: 'INFO',
        patientId: consultationData.patientId,
      });

      addAlert({
        title: 'New Prescription Queued',
        message: `${prescription.patientName} has a new prescription (${rxId}) pending pharmacy verification.`,
        severity: 'INFO',
        category: 'PHARMACY',
        linkTab: 'pharmacy',
      });
    },
    [patients, addAuditLog, addAlert]
  );

  // Verify Prescription (Pharmacy)
  const verifyPrescription = useCallback(
    (rxId: string) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setPrescriptions((prev) =>
        prev.map((rx) => (rx.id === rxId ? { ...rx, status: 'Verified', verifiedAt: timeStr } : rx))
      );

      const rx = prescriptions.find((r) => r.id === rxId);
      if (rx) {
        addAuditLog({
          actor: 'Pharm. R. Lakshmi',
          role: 'PHARMACIST',
          action: 'Prescription Verified',
          details: `Prescription ${rxId} for ${rx.patientName} verified. Stock availability and allergen cross-check passed. Forwarded to Smart Vending Hub.`,
          category: 'PHARMACY',
          severity: 'INFO',
          patientId: rx.patientId,
        });

        soundEffects.playSuccessChirp();
      }
    },
    [prescriptions, addAuditLog]
  );

  // Dispense from Vending Machine
  const dispenseVendingSlot = useCallback(
    async (
      vendingId: string,
      slotNumber: number,
      patientId: string,
      prescriptionId?: string,
      method: string = 'RFID'
    ): Promise<{ success: boolean; message: string }> => {
      const vm = vendingMachines.find((m) => m.id === vendingId);
      if (!vm) return { success: false, message: 'Vending machine not found' };

      const slot = vm.slots.find((s) => s.slotNumber === slotNumber);
      if (!slot) return { success: false, message: 'Slot not found' };

      if (slot.currentStock <= 0) {
        return { success: false, message: 'Slot out of stock' };
      }

      // Check if medicine is expired
      const med = medicines.find((m) => m.id === slot.medicineId);
      if (med && med.isExpired) {
        soundEffects.playEmergencyAlert();
        addAlert({
          title: 'BLOCKED: Expired Medicine Dispense',
          message: `Vending machine ${vendingId} halted dispense. ${med.name} is expired.`,
          severity: 'CRITICAL',
          category: 'SECURITY',
        });
        return { success: false, message: 'CRITICAL: Expired medicine is strictly blocked from dispensing.' };
      }

      // Simulate dispensing hardware actions
      soundEffects.playDispenseSound();

      // Step 1: Set slot motor running
      setVendingMachines((prev) =>
        prev.map((m) => {
          if (m.id === vendingId) {
            return {
              ...m,
              status: 'Dispensing',
              slots: (m.slots || []).map((sl) =>
                sl.slotNumber === slotNumber ? { ...sl, motorStatus: 'RUNNING', sensorStatus: 'BEAM_BROKEN' } : sl
              ),
            };
          }
          return m;
        })
      );

      // Brief delay to simulate motor movement, IR beam detection, and HX711 load cell weight change
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const txnId = generateUniqueId('TXN');

      // Step 2: Stop motor, decrement stock, update load cell
      setVendingMachines((prev) =>
        prev.map((m) => {
          if (m.id === vendingId) {
            return {
              ...m,
              status: 'Online',
              lastDispenseTime: 'Just now',
              slots: (m.slots || []).map((sl) => {
                if (sl.slotNumber === slotNumber) {
                  const newQty = sl.currentStock - 1;
                  return {
                    ...sl,
                    currentStock: newQty,
                    motorStatus: 'IDLE',
                    sensorStatus: 'DISPENSED',
                    health: newQty <= sl.minStock ? 'LOW_STOCK' : 'HEALTHY',
                  };
                }
                return sl;
              }),
            };
          }
          return m;
        })
      );

      // Decrement inventory stock
      setMedicines((prev) =>
        prev.map((m) => {
          if (m.id === slot.medicineId) {
            const updatedQty = m.quantity - 1;
            return { ...m, quantity: updatedQty };
          }
          return m;
        })
      );

      // Update prescription if linked
      if (prescriptionId) {
        setPrescriptions((prev) =>
          prev.map((r) => (r.id === prescriptionId ? { ...r, status: 'Dispensed', dispensedAt: timeStr } : r))
        );
      }

      // Update patient status
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'Medicine Dispensed' } : p))
      );

      // Create traceability record
      const patient = patients.find((p) => p.id === patientId);
      const newTrace: MedicineTraceabilityRecord = {
        transactionId: txnId,
        timestamp: timeStr,
        batchNumber: med?.batchNumber || 'B-STD-26',
        medicineName: slot.medicineName,
        quantity: 1,
        source: 'Smart Vending Hub',
        vendingMachine: `${vendingId} (Slot ${slotNumber})`,
        robot: 'Staged for Rover Delivery',
        destination: 'Patient Care Ward',
        patientId,
        patientName: patient?.name || patientId,
        status: 'Dispensed',
      };

      setTraceabilityRecords((prev) => [newTrace, ...prev]);

      addAuditLog({
        actor: `${vendingId} Controller`,
        role: 'HARDWARE',
        action: 'Medicine Dispensed',
        details: `Dispensed 1x ${slot.medicineName} for patient ${patient?.name || patientId} via ${method} auth. IR sensor confirmed drop. HX711 weight verified. Remaining stock: ${slot.currentStock - 1}.`,
        category: 'VENDING',
        severity: 'INFO',
        patientId,
        deviceId: vendingId,
      });

      soundEffects.playSuccessChirp();

      return {
        success: true,
        message: `Successfully dispensed ${slot.medicineName} from ${vendingId} Slot ${slotNumber}. IR & Load Cell Verified.`,
      };
    },
    [vendingMachines, medicines, patients, addAuditLog, addAlert]
  );

  // Dispatch Robot Mission
  const dispatchRobotMission = useCallback(
    (robotId: string, prescriptionId: string, ward: string) => {
      const rx = prescriptions.find((r) => r.id === prescriptionId);
      const missionId = generateUniqueId('MSN');
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const rxItems = rx?.items || rx?.medicines || [];
      const medicineSummary =
        rxItems.length > 0
          ? rxItems.map((i) => `${i.medicineName || i.name} (x${i.quantity})`).join(', ')
          : 'Medicine Package';

      const patient = patients.find((p) => p.id === rx?.patientId);

      setRobots((prev) =>
        prev.map((bot) => {
          if (bot.id === robotId) {
            return {
              ...bot,
              status: 'En Route',
              targetWard: ward,
              currentCheckpointIndex: 1,
              currentLocation: 'Corridor A (RFID-01)',
              currentMission: {
                id: missionId,
                prescriptionId,
                patientId: rx?.patientId || 'PT-1024',
                patientName: rx?.patientName || 'Patient',
                ward,
                priority: isEmergencyMode ? 'Emergency' : 'Normal',
                status: 'En Route',
                dispatchedAt: timeStr,
                medicineSummary,
                authorizedRecipientUid: patient?.identifiers.rfidUid || '04:A3:92:7B:11',
              },
            };
          }
          return bot;
        })
      );

      // Update prescription and patient status
      if (rx) {
        setPrescriptions((prev) =>
          prev.map((r) => (r.id === prescriptionId ? { ...r, status: 'Dispensed' } : r))
        );
        setPatients((prev) =>
          prev.map((p) => (p.id === rx.patientId ? { ...p, status: 'Medicine Dispensed' } : p))
        );
      }

      soundEffects.playRobotPing();

      addAuditLog({
        actor: robotId,
        role: 'ROBOT',
        action: 'Mission Dispatched',
        details: `${robotId} dispatched on mission ${missionId} to deliver [${medicineSummary}] to ${ward}. Compartment locked. Line tracking active.`,
        category: 'ROBOT',
        severity: 'INFO',
        patientId: rx?.patientId,
        deviceId: robotId,
      });

      addAlert({
        title: 'Delivery Robot Dispatched',
        message: `${robotId} is en route to ${ward} with medicine for ${rx?.patientName || 'patient'}.`,
        severity: 'INFO',
        category: 'ROBOT',
        linkTab: 'robot',
      });
    },
    [prescriptions, patients, isEmergencyMode, addAuditLog, addAlert]
  );

  // Advance Robot Step (Line following / RFID checkpoint progression)
  const advanceRobotStep = useCallback(
    (robotId: string) => {
      const checkpoints = [
        'Central Pharmacy Bay (START)',
        'Corridor A (RFID-01)',
        'Central Junction (RFID-02)',
        'Ward 1 Entrance (RFID-03)',
        'Target Destination Ward 2 (RFID-04)',
      ];

      setRobots((prev) =>
        prev.map((bot) => {
          if (bot.id === robotId && bot.currentMission) {
            const nextIndex = Math.min(bot.currentCheckpointIndex + 1, checkpoints.length - 1);
            const isArrived = nextIndex >= checkpoints.length - 1;
            soundEffects.playRobotPing();

            return {
              ...bot,
              currentCheckpointIndex: nextIndex,
              currentLocation: checkpoints[nextIndex],
              status: isArrived ? 'Arrived' : 'En Route',
              currentMission: {
                ...bot.currentMission,
                status: isArrived ? 'At Ward' : 'En Route',
              },
            };
          }
          return bot;
        })
      );

      const currentBot = robots.find((b) => b.id === robotId);
      if (currentBot?.currentMission) {
        addAuditLog({
          actor: robotId,
          role: 'ROBOT',
          action: 'Checkpoint Verified',
          details: `${robotId} reached next checkpoint: ${currentBot.currentLocation}. Destination: ${currentBot.targetWard}.`,
          category: 'ROBOT',
          severity: 'INFO',
          patientId: currentBot.currentMission.patientId,
          deviceId: robotId,
        });
      }
    },
    [robots, addAuditLog]
  );

  // Confirm Robot Delivery (Patient/Nurse scans RFID/NFC at the robot)
  const confirmRobotDelivery = useCallback(
    (robotId: string, recipientUid: string): { success: boolean; message: string } => {
      const bot = robots.find((b) => b.id === robotId);
      if (!bot || !bot.currentMission) {
        return { success: false, message: 'No active mission on this robot' };
      }

      const expectedUid = bot.currentMission.authorizedRecipientUid;
      // Allow recipient if UID matches OR master staff UID
      const isValid = recipientUid === expectedUid || recipientUid.startsWith('STF') || recipientUid === '04:A3:92:7B:11';

      if (!isValid) {
        soundEffects.playEmergencyAlert();
        addAuditLog({
          actor: robotId,
          role: 'SECURITY',
          action: 'Unauthorized Compartment Unlock Attempt',
          details: `Card ${recipientUid} was rejected at ${robotId}. Required UID: ${expectedUid}. Door remained locked.`,
          category: 'SECURITY',
          severity: 'CRITICAL',
          patientId: bot.currentMission.patientId,
          deviceId: robotId,
        });
        return { success: false, message: 'AUTHENTICATION FAILED: UID does not match patient or authorized nurse card.' };
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const patientId = bot.currentMission.patientId;
      const rxId = bot.currentMission.prescriptionId;

      soundEffects.playSuccessChirp();

      // Unlock compartment and complete mission
      setRobots((prev) =>
        prev.map((b) => {
          if (b.id === robotId) {
            return {
              ...b,
              status: 'Delivering',
              compartmentLocked: false,
              currentMission: {
                ...b.currentMission!,
                status: 'Completed',
                completedAt: timeStr,
              },
            };
          }
          return b;
        })
      );

      // Update patient and prescription
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, status: 'Medicine Delivered' } : p))
      );

      setPrescriptions((prev) =>
        prev.map((r) => (r.id === rxId ? { ...r, status: 'Delivered', deliveredAt: timeStr } : r))
      );

      // Update traceability
      setTraceabilityRecords((prev) => [
        {
          transactionId: generateUniqueId('TXN'),
          timestamp: timeStr,
          batchNumber: 'B-DEL-VERIFIED',
          medicineName: bot.currentMission!.medicineSummary,
          quantity: 1,
          source: `${robotId} Secure Compartment`,
          vendingMachine: 'VM-01',
          robot: robotId,
          destination: bot.targetWard,
          patientId,
          patientName: bot.currentMission!.patientName,
          status: 'Delivered',
        },
        ...prev,
      ]);

      addAuditLog({
        actor: robotId,
        role: 'ROBOT',
        action: 'Delivery Verified & Completed',
        details: `Recipient authenticated via RFID (${recipientUid}). Compartment unlocked. ${bot.currentMission.medicineSummary} handed over to ${bot.currentMission.patientName} at ${bot.targetWard}.`,
        category: 'ROBOT',
        severity: 'INFO',
        patientId,
        deviceId: robotId,
      });

      // After 3 seconds, lock compartment and return robot to idle
      setTimeout(() => {
        setRobots((prev) =>
          prev.map((b) => {
            if (b.id === robotId) {
              return {
                ...b,
                status: 'Idle',
                compartmentLocked: true,
                currentLocation: 'Central Pharmacy Bay (START)',
                currentCheckpointIndex: 0,
                currentMission: undefined,
              };
            }
            return b;
          })
        );
      }, 3500);

      return {
        success: true,
        message: `Recipient verified (${recipientUid}). Compartment unlocked. Medicine successfully delivered!`,
      };
    },
    [robots, addAuditLog]
  );

  // Simulation helpers
  const simulateRfidScan = useCallback(
    (uid: string) => {
      soundEffects.playCardScan();
      const patient = patients.find((p) => p.identifiers.rfidUid?.toLowerCase() === uid.toLowerCase());
      if (patient) return { found: true, patient };

      const staffMember = staff.find((s) => s.rfidUid.toLowerCase() === uid.toLowerCase());
      if (staffMember) return { found: true, staff: staffMember };

      return { found: false };
    },
    [patients, staff]
  );

  const simulateNfcScan = useCallback(
    (nfcId: string) => {
      soundEffects.playCardScan();
      const patient = patients.find((p) => p.identifiers.nfcId?.toLowerCase() === nfcId.toLowerCase());
      return { found: !!patient, patient };
    },
    [patients]
  );

  const simulateFaceMatch = useCallback(
    (patientId: string) => {
      const patient = patients.find((p) => p.id === patientId);
      if (patient && patient.identifiers.faceRegistered) {
        soundEffects.playSuccessChirp();
        return { success: true, patient, confidence: 0.984 };
      }
      return { success: false, confidence: 0.22 };
    },
    [patients]
  );

  // AI Reorder Approval
  const approveAiReorder = useCallback(
    (medicineId: string, quantity: number) => {
      setMedicines((prev) =>
        prev.map((m) => (m.id === medicineId ? { ...m, quantity: m.quantity + quantity } : m))
      );

      const med = medicines.find((m) => m.id === medicineId);
      soundEffects.playSuccessChirp();

      addAuditLog({
        actor: 'Admin / Inventory Manager',
        role: 'ADMIN',
        action: 'AI Purchase Order Approved',
        details: `Approved automated purchase order PO-${generateUniqueId('ORD')} for ${quantity} units of ${med?.name || medicineId}. Stock replenished.`,
        category: 'SYSTEM',
        severity: 'INFO',
      });
    },
    [medicines, addAuditLog]
  );

  // Device Ping / Restart
  const pingDevice = useCallback(
    (deviceId: string) => {
      soundEffects.playCardScan();
      setIotDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, lastSeenSecondsAgo: 0, status: 'Online' } : d))
      );
      addAuditLog({
        actor: 'IoT Device Manager',
        role: 'ADMIN',
        action: 'Device Pinged',
        details: `Heartbeat ping sent to ${deviceId}. Response latency: 14ms. Signal: Good.`,
        category: 'SYSTEM',
        severity: 'INFO',
        deviceId,
      });
    },
    [addAuditLog]
  );

  const restartDevice = useCallback(
    (deviceId: string) => {
      soundEffects.playCardScan();
      setIotDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: 'Maintenance', lastSeenSecondsAgo: 1 } : d))
      );
      setTimeout(() => {
        setIotDevices((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, status: 'Online', lastSeenSecondsAgo: 0 } : d))
        );
      }, 2000);

      addAuditLog({
        actor: 'Admin',
        role: 'ADMIN',
        action: 'Device Reboot Request',
        details: `Sent remote reboot signal to ESP32 device ${deviceId}. Firmware re-initialized.`,
        category: 'SYSTEM',
        severity: 'INFO',
        deviceId,
      });
    },
    [addAuditLog]
  );

  const rebootDevice = restartDevice;
  const restockMedicine = approveAiReorder;

  const doctors = useMemo(() => (staff || []).filter((s) => s.role === 'Doctor'), [staff]);

  const createPrescription = useCallback(
    (prescriptionData: {
      patientId: string;
      patientName: string;
      doctorId: string;
      doctorName: string;
      doctorNotes?: string;
      diagnosis?: string;
      medicines?: PrescriptionItem[];
      items?: PrescriptionItem[];
      destination?: string;
    }) => {
      const rxId = `RX-${Math.floor(2050 + Math.random() * 8000)}`;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const itemsList = prescriptionData.medicines || prescriptionData.items || [];
      const newRx: Prescription = {
        id: rxId,
        patientId: prescriptionData.patientId,
        patientName: prescriptionData.patientName,
        doctorId: prescriptionData.doctorId,
        doctorName: prescriptionData.doctorName,
        doctorNotes: prescriptionData.doctorNotes,
        diagnosis: prescriptionData.diagnosis,
        destination: prescriptionData.destination || 'Smart Vending VM-01',
        items: itemsList,
        medicines: itemsList,
        status: 'Sent to Pharmacy',
        createdAt: timeStr,
        vendingMachineId: prescriptionData.destination?.includes('VM-') ? 'VM-01' : undefined,
      };

      setPrescriptions((prev) => [newRx, ...(prev || [])]);
      soundEffects.playSuccessChirp();

      addAuditLog({
        actor: prescriptionData.doctorName,
        role: 'DOCTOR',
        action: 'Prescription Issued',
        details: `Digital Prescription ${rxId} created for ${prescriptionData.patientName}. Routed to ${newRx.destination}. Diagnosis: ${newRx.diagnosis || 'Clinical evaluation'}.`,
        category: 'PRESCRIPTION',
        severity: 'INFO',
        patientId: prescriptionData.patientId,
      });

      addAlert({
        title: 'New Prescription Created',
        message: `Prescription ${rxId} issued for ${prescriptionData.patientName} (${itemsList.length} items).`,
        severity: 'INFO',
        category: 'PHARMACY',
        linkTab: 'pharmacy',
      });

      return newRx;
    },
    [addAuditLog, addAlert]
  );

  const dispensePrescription = useCallback(
    (rxId: string, method: string = 'Manual Dispense') => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPrescriptions((prev) =>
        (prev || []).map((r) =>
          r.id === rxId ? { ...r, status: 'Dispensed', dispensedAt: timeStr } : r
        )
      );
      soundEffects.playMechanicalDispense();
      addAuditLog({
        actor: 'PHARMACIST-01',
        role: 'PHARMACIST',
        action: 'Prescription Dispensed',
        details: `Prescription ${rxId} dispensed via ${method} at ${timeStr}.`,
        category: 'DISPENSING',
        severity: 'INFO',
      });
    },
    [addAuditLog]
  );

  const dispatchRobot = useCallback(
    (robotId: string, destination: string, patientId?: string, prescriptionIds?: string[]) => {
      const rxId = prescriptionIds?.[0] || 'RX-2041';
      dispatchRobotMission(robotId, rxId, destination);
    },
    [dispatchRobotMission]
  );

  // Reset to default seed
  const resetAllToDefault = useCallback(() => {
    localStorage.clear();
    setPatients(INITIAL_PATIENTS);
    setStaff(INITIAL_STAFF);
    setMedicines(INITIAL_MEDICINES);
    setVendingMachines(INITIAL_VENDING_MACHINES);
    setRobots(INITIAL_ROBOTS);
    setIotDevices(INITIAL_IOT_DEVICES);
    setVisits(INITIAL_VISITS);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAlerts(INITIAL_ALERTS);
    setTraceabilityRecords(INITIAL_TRACEABILITY);
    setEmergencies(INITIAL_EMERGENCIES);
    setIsEmergencyMode(false);
    setSelectedPatientId('PT-1024');
    soundEffects.playSuccessChirp();
  }, []);

  // Stop Demo
  const stopDemo = useCallback(() => {
    setDemoProgress((prev) => ({ ...prev, isRunning: false }));
  }, []);

  // One-Click End-to-End Demo (Requested in Section 41 & 52)
  const runCompleteEndToEndDemo = useCallback(async () => {
    setDemoProgress({
      isRunning: true,
      step: 1,
      totalSteps: 21,
      title: 'Initializing End-to-End Hospital Demo',
      description: 'Preparing Arun Kumar (PT-1024) and system telemetry...',
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Step 1: Select patient PT-1024
      setSelectedPatientId('PT-1024');
      setActiveTab('visits');
      setDemoProgress({
        isRunning: true,
        step: 1,
        totalSteps: 21,
        title: 'Step 1/21: Patient Arrival',
        description: 'Patient Arun Kumar (PT-1024) arrives at Hospital Main Entrance.',
      });
      soundEffects.playCardScan();
      await sleep(1800);

      // Step 2: Camera Face detection
      setActiveTab('camera');
      setDemoProgress({
        isRunning: true,
        step: 2,
        totalSteps: 21,
        title: 'Step 2/21: AI Camera Face Detection',
        description: 'Entrance AI Camera detects face bounding box (Confidence 98.4%).',
      });
      soundEffects.playSuccessChirp();
      await sleep(1800);

      // Step 3: RFID scan
      setDemoProgress({
        isRunning: true,
        step: 3,
        totalSteps: 21,
        title: 'Step 3/21: RFID Identification',
        description: 'Patient taps RFID card (04:A3:92:7B:11) at ESP32 Entry Terminal.',
      });
      soundEffects.playCardScan();
      await sleep(1600);

      // Step 4: Check-in patient
      const visit = checkInPatient('PT-1024', 'Face + RFID', 'Normal');
      setActiveTab('visits');
      setDemoProgress({
        isRunning: true,
        step: 4,
        totalSteps: 21,
        title: 'Step 4/21: Patient Visit Created',
        description: `Visit logged automatically. Token generated: ${visit.tokenNumber}.`,
      });
      await sleep(1800);

      // Step 5: Vitals station
      setDemoProgress({
        isRunning: true,
        step: 5,
        totalSteps: 21,
        title: 'Step 5/21: IoT Vitals Sensor Acquisition',
        description: 'Nurse records vitals: Temp 37.2°C, BP 122/82 mmHg, SpO2 98%, HR 74 bpm.',
      });
      recordVitals(visit.id, {
        temperatureC: 37.2,
        heartRateBpm: 74,
        spo2Percent: 98,
        bloodPressureSystolic: 122,
        bloodPressureDiastolic: 82,
        respiratoryRate: 16,
        weightKg: 69.0,
        recordedAt: 'Now',
        isAbnormal: false,
        notes: 'Demo session: Vitals stable.',
      });
      await sleep(1800);

      // Step 6: Doctor queue
      setActiveTab('doctor');
      setDemoProgress({
        isRunning: true,
        step: 6,
        totalSteps: 21,
        title: 'Step 6/21: Doctor Consultation Queue',
        description: `Dr. Sundar Kumar MD calls Token ${visit.tokenNumber}. Previous history loaded.`,
      });
      await sleep(1800);

      // Step 7: Doctor consultation
      setDemoProgress({
        isRunning: true,
        step: 7,
        totalSteps: 21,
        title: 'Step 7/21: Clinical Diagnosis',
        description: 'Doctor diagnoses Acute Cephalea & Fatigue. Prepares electronic prescription.',
      });
      await sleep(1800);

      // Step 8: Prescription created
      const rxItems: PrescriptionItem[] = [
        {
          id: 'DEMO-RXI-1',
          medicineId: 'MED-01',
          medicineName: 'Paracetamol 500mg',
          strength: '500 mg',
          dosage: '1 tablet',
          frequency: '2 times/day',
          duration: '3 days',
          quantity: 6,
          instructions: 'Take after meals for fever/pain',
          slotNumber: 1,
        },
      ];
      saveConsultation(
        visit.id,
        {
          visitId: visit.id,
          patientId: 'PT-1024',
          doctorId: 'DOC-01',
          doctorName: 'Dr. Sundar Kumar MD',
          chiefComplaint: 'Mild intermittent headache and feverish feeling for 24 hours',
          symptoms: ['Headache', 'Mild fever', 'Malaise'],
          observations: 'Patient alert, hydrated. Neurological exam normal.',
          diagnosis: 'Tension-type Headache with Low-grade Pyrexia',
          notes: 'Advised rest, adequate hydration, and Paracetamol 500mg.',
          followUpDate: '2026-09-17',
        },
        rxItems
      );
      await sleep(1800);

      // Step 9: Sent to pharmacy
      setActiveTab('pharmacy');
      setDemoProgress({
        isRunning: true,
        step: 9,
        totalSteps: 21,
        title: 'Step 9/21: Sent to Central Pharmacy',
        description: 'Prescription queued in Central Pharmacy dashboard for pharmacist verification.',
      });
      await sleep(1800);

      // Step 10: Pharmacist verification
      const currentRx = prescriptions[0] || { id: 'RX-2041' };
      verifyPrescription(currentRx.id);
      setDemoProgress({
        isRunning: true,
        step: 10,
        totalSteps: 21,
        title: 'Step 10/21: Pharmacist Approval',
        description: 'Pharm. R. Lakshmi verifies allergen safety & batches. Authorized for Smart Vending.',
      });
      await sleep(1800);

      // Step 11: Switch to Vending Machine VM-01
      setActiveTab('vending');
      setDemoProgress({
        isRunning: true,
        step: 11,
        totalSteps: 21,
        title: 'Step 11/21: Smart Vending Machine Auth',
        description: 'Patient/Nurse presents RFID card at VM-01. Display: DISPENSING AUTHORIZED.',
      });
      soundEffects.playCardScan();
      await sleep(1800);

      // Step 12: Dispense medicine from Slot 1
      setDemoProgress({
        isRunning: true,
        step: 12,
        totalSteps: 21,
        title: 'Step 12/21: Physical Dispensing & IR Verification',
        description: 'Slot 01 motor engages. Paracetamol dispensed. IR sensor confirms medicine drop!',
      });
      await dispenseVendingSlot('VM-01', 1, 'PT-1024', currentRx.id, 'RFID');
      await sleep(2000);

      // Step 13: HX711 Load Cell confirmation
      setDemoProgress({
        isRunning: true,
        step: 13,
        totalSteps: 21,
        title: 'Step 13/21: Load Cell Confirmation',
        description: 'HX711 load cell confirms weight loss delta. Medicine inventory decremented.',
      });
      await sleep(1600);

      // Step 14: Traceability and Dispense Verification
      setActiveTab('traceability');
      setDemoProgress({
        isRunning: true,
        step: 14,
        totalSteps: 21,
        title: 'Step 14/21: Batch & RFID Verification',
        description: 'Prescription scanned and verified against GS1 batch records for Ward 2.',
      });
      await sleep(1800);

      // Step 15: Secure Ward Dispatch
      setDemoProgress({
        isRunning: true,
        step: 15,
        totalSteps: 21,
        title: 'Step 15/21: Secure Ward Dispatch',
        description: 'Medicine sealed in tamper-evident container and routed to Inpatient Ward 2.',
      });
      await sleep(1800);

      // Step 16: Checkpoint Verification
      setDemoProgress({
        isRunning: true,
        step: 16,
        totalSteps: 21,
        title: 'Step 16/21: Ward Entry Checkpoint',
        description: 'Nurse station RFID confirms safe arrival at Inpatient Ward 2.',
      });
      await sleep(1800);

      // Step 17: Ward Nurse Verification
      setDemoProgress({
        isRunning: true,
        step: 17,
        totalSteps: 21,
        title: 'Step 17/21: Ward Handover Handshake',
        description: 'Assigned nurse scans badge and confirms medicine temperature and batch match.',
      });
      await sleep(1800);

      // Step 18: Patient Bedside Confirmation
      setDemoProgress({
        isRunning: true,
        step: 18,
        totalSteps: 21,
        title: 'Step 18/21: Bedside Patient Verification',
        description: 'Arun Kumar / Ward Nurse scans RFID wristband. Dosage safely administered.',
      });
      await sleep(2200);

      // Step 19: Traceability updated
      setActiveTab('traceability');
      setDemoProgress({
        isRunning: true,
        step: 19,
        totalSteps: 21,
        title: 'Step 19/21: End-to-End Traceability Logged',
        description: 'Full custody chain recorded: Warehouse → VM-01 → RB-01 → Ward 2 → PT-1024.',
      });
      await sleep(1800);

      // Step 20: AI Inventory Forecasting & Recommendations
      setActiveTab('ai-forecasting');
      setDemoProgress({
        isRunning: true,
        step: 20,
        totalSteps: 21,
        title: 'Step 20/21: AI Forecasting & Burn Rate',
        description: 'AI model recalculates days-to-stockout and generates smart reorder recommendation.',
      });
      await sleep(1800);

      // Step 21: Command Center complete
      setActiveTab('dashboard');
      setDemoProgress({
        isRunning: true,
        step: 21,
        totalSteps: 21,
        title: 'Step 21/21: Demo Complete! Command Center Synced',
        description: 'All 21 modules verified. System fully operational with live telemetry.',
      });
      soundEffects.playSuccessChirp();
      await sleep(2500);

      setDemoProgress((prev) => ({ ...prev, isRunning: false }));
    } catch (e) {
      console.error(e);
      setDemoProgress((prev) => ({ ...prev, isRunning: false }));
    }
  }, [
    checkInPatient,
    recordVitals,
    saveConsultation,
    prescriptions,
    verifyPrescription,
    dispenseVendingSlot,
    dispatchRobotMission,
    advanceRobotStep,
    confirmRobotDelivery,
    setActiveTab,
  ]);

  return (
    <HospitalContext.Provider
      value={{
        systemMode,
        setSystemMode,
        toggleSystemMode,
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        setTheme,
        colorTheme,
        setColorTheme,
        isEmergencyMode,
        emergencyPatientId,
        triggerEmergencyMode,
        cancelEmergencyMode,
        isAuthenticated,
        currentUser,
        login,
        logout,
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
        triggerCameraAnomaly,
        patients,
        selectedPatientId,
        setSelectedPatientId,
        selectedPatient,
        staff,
        medicines,
        vendingMachines,
        robots,
        iotDevices,
        visits,
        prescriptions,
        auditLogs,
        alerts,
        traceabilityRecords,
        registerPatient,
        updatePatient,
        deletePatient,
        clearAllPatients,
        checkInPatient,
        deleteVisit,
        clearAllVisits,
        registerStaff,
        deleteStaff,
        clearAllStaff,
        wipeDemoDataForFreshStart,
        toggleStaffStatus,
        enrollStaffFingerprint,
        recordVitals,
        saveConsultation,
        verifyPrescription,
        dispenseVendingSlot,
        dispatchRobotMission,
        advanceRobotStep,
        confirmRobotDelivery,
        addAuditLog,
        addAlert,
        markAlertRead,
        clearAllAlerts,
        approveAiReorder,
        restockMedicine,
        pingDevice,
        restartDevice,
        rebootDevice,
        doctors,
        createPrescription,
        dispensePrescription,
        dispatchRobot,
        simulateRfidScan,
        simulateNfcScan,
        simulateFaceMatch,
        demoProgress,
        runCompleteEndToEndDemo,
        stopDemo,
        resetAllToDefault,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
