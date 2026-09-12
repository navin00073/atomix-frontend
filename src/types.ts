export type UserRole = 'ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'NURSE' | 'PATIENT';

export type ColorTheme = 'cyan' | 'sapphire' | 'emerald' | 'purple' | 'amber' | 'crimson';

export type SystemMode = 'SIMULATION' | 'LIVE HARDWARE';

export type PatientStatus =
  | 'Registered'
  | 'Checked In'
  | 'Waiting'
  | 'Consultation'
  | 'Pharmacy'
  | 'Medicine Dispensed'
  | 'Medicine Delivered'
  | 'Completed'
  | 'Checked Out';

export interface PatientIdentifiers {
  faceRegistered: boolean;
  faceHash?: string;
  fingerprintRegistered?: boolean;
  fingerprintId?: string;
  rfidUid?: string;
  nfcId?: string;
  qrCode: string;
}

export interface Patient {
  id: string; // e.g. PT-1024
  name: string;
  age: number;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  existingConditions: string[];
  emergencyNotes?: string;
  identifiers: PatientIdentifiers;
  status: PatientStatus;
  currentToken?: string;
  lastVisitDate: string;
  registeredAt: string;
  avatarUrl?: string;
  biometricConsent: boolean;
}

export interface Vitals {
  temperatureC: number;
  heartRateBpm: number;
  spo2Percent: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  respiratoryRate: number;
  weightKg: number;
  recordedAt: string;
  isAbnormal: boolean;
  notes?: string;
}

export interface PrescriptionItem {
  id?: string;
  medicineId?: string;
  name?: string;
  medicineName?: string;
  strength?: string; // e.g. "500 mg"
  dosage?: string; // e.g. "1 tablet"
  frequency?: string; // e.g. "2 times/day"
  duration?: string; // e.g. "3 days"
  quantity: number; // e.g. 6
  instructions?: string;
  slotNumber?: number;
}

export interface MedicineItem {
  id: string;
  medicineId?: string;
  name: string;
  medicineName?: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  slotNumber?: number;
}

export interface Prescription {
  id: string; // e.g. RX-2041
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  items: PrescriptionItem[];
  medicines?: PrescriptionItem[];
  diagnosis?: string;
  doctorNotes?: string;
  destination?: string;
  status:
    | 'Created'
    | 'Sent to Pharmacy'
    | 'Verified'
    | 'Dispensing'
    | 'Dispensed'
    | 'Delivered'
    | 'Completed';
  createdAt: string;
  verifiedAt?: string;
  dispensedAt?: string;
  deliveredAt?: string;
  notes?: string;
  vendingMachineId?: string;
}

export interface Consultation {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  chiefComplaint: string;
  symptoms: string[];
  observations: string;
  diagnosis: string;
  notes: string;
  followUpDate?: string;
  timestamp: string;
}

export interface PatientVisit {
  id: string; // e.g. VST-8891
  patientId: string;
  patientName: string;
  tokenNumber: string; // e.g. TKN-104
  checkInTime: string;
  method: 'Face' | 'RFID' | 'NFC' | 'QR' | 'Face + RFID' | 'Fingerprint' | 'Manual';
  status: PatientStatus;
  priority: 'Normal' | 'High' | 'Emergency';
  doctorId?: string;
  doctorName?: string;
  vitals?: Vitals;
  consultation?: Consultation;
  prescriptionId?: string;
  wardAssigned?: string;
  completedAt?: string;
}

export type StaffRole = 'Doctor' | 'Nurse' | 'Pharmacist' | 'Technician' | 'Admin';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  department: string;
  specialization?: string;
  rfidUid: string;
  nfcId: string;
  faceRegistered: boolean;
  fingerprintRegistered?: boolean;
  fingerprintId?: string;
  status: 'Present' | 'Late' | 'Checked Out' | 'On Duty';
  checkInTime?: string;
  workingHoursToday?: number;
  phone: string;
}

export interface Medicine {
  id: string; // e.g. MED-01
  name: string;
  brandName?: string;
  category: string;
  strength?: string;
  dosageForm?: string;
  batchNumber: string;
  supplier: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  minStock: number;
  reorderQuantity?: number;
  unit: string;
  vendingSlot?: number;
  vendingMachineId?: string;
  dailyUsageAvg: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  aiRecommendation?: {
    recommendedOrderQty: number;
    reason: string;
  };
}

export interface VendingSlot {
  slotNumber: number;
  medicineId: string;
  medicineName: string;
  currentStock: number;
  minStock: number;
  motorStatus: 'IDLE' | 'RUNNING' | 'JAMMED';
  sensorStatus: 'CLEAR' | 'BEAM_BROKEN' | 'DISPENSED';
  loadCellGrams: number;
  expiryDate: string;
  health: 'HEALTHY' | 'LOW_STOCK' | 'WARNING' | 'ERROR';
}

export interface VendingMachine {
  id: string; // e.g. VM-01
  name: string;
  location: string;
  status: 'Online' | 'Dispensing' | 'Error' | 'Maintenance' | 'Emergency Stop';
  slots: VendingSlot[];
  lastDispenseTime?: string;
  hx711Calibration: number;
  doorLocked: boolean;
  irBeamActive: boolean;
}

export interface RobotMission {
  id: string; // e.g. MSN-4091
  prescriptionId: string;
  patientId: string;
  patientName: string;
  ward: string;
  priority: 'Normal' | 'Emergency';
  status: 'Dispatched' | 'En Route' | 'At Ward' | 'Completed' | 'Aborted';
  dispatchedAt: string;
  completedAt?: string;
  medicineSummary: string;
  authorizedRecipientUid?: string;
}

export interface DeliveryRobot {
  id: string; // e.g. RB-01
  name: string;
  batteryPercent: number;
  status: 'Idle' | 'En Route' | 'Arrived' | 'Delivering' | 'Returning' | 'Charging' | 'Offline';
  currentLocation: string; // e.g. "Corridor A (RFID-01)"
  currentCheckpointIndex: number; // 0 to 4
  targetWard: string;
  speedKmh: number;
  currentMission?: RobotMission;
  compartmentLocked: boolean;
  lineSensorActive: boolean;
}

export interface IoTDevice {
  id: string;
  name: string;
  type:
    | 'ESP32 Entry Terminal'
    | 'RFID Reader'
    | 'NFC Reader'
    | 'Vending Controller'
    | 'Robot Controller'
    | 'AI Camera Node'
    | 'Vitals Sensor Hub'
    | 'Biometric R307 Gate';
  ipAddress: string;
  firmware: string;
  lastSeenSecondsAgo: number;
  status: 'Online' | 'Offline' | 'Maintenance';
  signalDbm: number;
  batteryPercent?: number;
  location: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  category:
    | 'IDENTIFICATION'
    | 'CONSULTATION'
    | 'PHARMACY'
    | 'VENDING'
    | 'ROBOT'
    | 'EMERGENCY'
    | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  patientId?: string;
  deviceId?: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  category: string;
  isRead: boolean;
  linkTab?: string;
}

export interface MedicineTraceabilityRecord {
  transactionId: string;
  timestamp: string;
  batchNumber: string;
  medicineName: string;
  quantity: number;
  source: string;
  vendingMachine: string;
  robot: string;
  destination: string;
  patientId: string;
  patientName: string;
  status: 'Delivered' | 'In Transit' | 'Dispensed' | 'Stock Entry';
}

export interface AiForecastingItem {
  medicineId: string;
  medicineName: string;
  currentStock: number;
  avgDailyUsage: number;
  predictedDaysUntilOut: number;
  recommendedOrder: number;
  status: 'CRITICAL' | 'REORDER_NOW' | 'OPTIMAL' | 'OVERSTOCKED';
  confidenceScore: number;
  approved?: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  badgeId: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type EmergencyStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface EmergencyIncident {
  id: string; // e.g. "EMG-2026-01"
  code: 'CODE BLUE' | 'CODE RED' | 'TRAUMA ALERT' | 'CODE STROKE';
  title: string; // e.g. "Acute Cardiac Arrhythmia"
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  status: 'ACTIVE' | 'RESPONDING' | 'AT_SCENE' | 'RESOLVED' | 'CANCELLED';
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  location: {
    building: string;
    floor: string;
    room: string;
    bed: string;
    coordinates?: { x: number; y: number };
  };
  detectedAt: string;
  detectionSource: 'IoT Vitals Telemetry' | 'AI Vision Anomaly' | 'Bedside Code Blue Button' | 'Nurse Call';
  currentStage: EmergencyStageNumber;
  stageHistory: {
    stage: EmergencyStageNumber;
    title: string;
    timestamp: string;
    actor: string;
    completed: boolean;
  }[];
  assignedDoctor?: {
    id: string;
    name: string;
    specialization: string;
    distanceMeters: number;
    etaSeconds: number;
    contact: string;
    acknowledged: boolean;
  };
  assignedNurse?: {
    id: string;
    name: string;
    department: string;
    distanceMeters: number;
    etaSeconds: number;
    acknowledged: boolean;
  };
  emergencyTeam?: {
    id: string;
    name: string;
    leadDoctor: string;
    status: 'Standby' | 'En Route' | 'On Scene';
  };
  requiredMedicines: {
    id: string;
    name: string;
    dosage: string;
    route: string;
    prepared: boolean;
    source: string; // e.g. "Crash Cart #02" or "Vending VM-01 Slot 01"
  }[];
  requiredEquipment: {
    name: string;
    location: string;
    ready: boolean;
  }[];
  countdownSeconds: number; // e.g. 180s target
  elapsedSeconds: number;
  resolvedAt?: string;
  outcomeNotes?: string;
}

export interface CameraNodeConfig {
  id: string;
  name: string;
  location: string;
  ward: string;
  status: 'Online' | 'Offline' | 'Warning' | 'Connecting';
  fps: number;
  bitrate: string;
  resolution: string;
  isRecording: boolean;
  lastDetection: string;
  facesDetected: number;
  anomalyDetected: boolean;
  anomalyType?: string;
  deviceId: string;
  streamUrl?: string;
  aiFeatures: string[];
}
