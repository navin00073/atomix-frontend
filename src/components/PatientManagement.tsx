import React, { useState, useRef, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Patient } from '../types';
import {
  Search,
  UserPlus,
  QrCode,
  Radio,
  Check,
  X,
  Camera,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  Calendar,
  Phone,
  Shield,
  Stethoscope,
  Pencil,
  Trash2,
  User,
  AlertTriangle,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { EditPatientModal } from './EditPatientModal';

export const PatientManagement: React.FC = () => {
  const {
    patients,
    registerPatient,
    updatePatient,
    deletePatient,
    clearAllPatients,
    checkInPatient,
    selectedPatientId,
    setSelectedPatientId,
    visits,
    prescriptions,
    setActiveTab,
  } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bloodFilter, setBloodFilter] = useState('ALL');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Form State for Add Patient
  const [name, setName] = useState('');
  const [age, setAge] = useState(30);
  const [dob, setDob] = useState('1996-05-12');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('+91 98400 99887');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Anna Nagar, Chennai');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRel, setEmergencyContactRel] = useState('Spouse');
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [biometricConsent, setBiometricConsent] = useState(true);

  // Multi-modal identification state
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [faceHash, setFaceHash] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [nfcId, setNfcId] = useState('');
  const [qrCode, setQrCode] = useState(`QR-PT-${Math.floor(1000 + Math.random() * 9000)}`);

  // Camera preview state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start real webcam preview if available
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Webcam API not supported in this browser. Using simulation capture.');
        setIsCameraActive(true);
      }
    } catch {
      setCameraError('Camera access denied or unavailable. Simulation face capture active.');
      setIsCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCaptureFace = () => {
    soundEffects.playSuccessChirp();
    const mockHash = `SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    setFaceRegistered(true);
    setFaceHash(mockHash);
    stopCamera();
  };

  const handleScanRfid = () => {
    soundEffects.playCardScan();
    const hex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
    const newUid = `04:${hex()}:${hex()}:${hex()}:${hex()}`;
    setRfidUid(newUid);
  };

  const handleRegisterNfc = () => {
    soundEffects.playCardScan();
    const newNfc = `NFC-${Math.floor(1000 + Math.random() * 9000)}`;
    setNfcId(newNfc);
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatient = registerPatient({
      name,
      age: Number(age),
      dob,
      gender,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      address,
      bloodGroup,
      emergencyContact: {
        name: emergencyContactName || 'Emergency Contact',
        relationship: emergencyContactRel,
        phone: emergencyContactPhone || phone,
      },
      allergies: allergiesText ? allergiesText.split(',').map((s) => s.trim()) : [],
      existingConditions: conditionsText ? conditionsText.split(',').map((s) => s.trim()) : [],
      emergencyNotes,
      biometricConsent,
      identifiers: {
        faceRegistered,
        faceHash: faceRegistered ? faceHash : undefined,
        rfidUid: rfidUid || undefined,
        nfcId: nfcId || undefined,
        qrCode,
      },
    });

    setIsRegisterOpen(false);
    setViewingPatient(newPatient);
    // Reset form
    setName('');
    setFaceRegistered(false);
    setRfidUid('');
    setNfcId('');
  };

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.identifiers.rfidUid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.identifiers.nfcId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.identifiers.qrCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesBlood = bloodFilter === 'ALL' || p.bloodGroup === bloodFilter;

    return matchesSearch && matchesStatus && matchesBlood;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Patient Management & Biometric Directory
          </h2>
          <p className="text-xs text-slate-400">
            Unified Patient ID linked to Multi-Modal Identifiers (Face biometric hash, RFID UID, NFC tag, and QR code)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsRegisterOpen(true);
              setQrCode(`QR-PT-${Math.floor(1000 + Math.random() * 9000)}`);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition font-tech uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>

          {patients.length > 0 && (
            <button
              onClick={() => setShowClearAllConfirm(true)}
              className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-xs transition flex items-center gap-1.5"
              title="Delete all patient profiles"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All ({patients.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Name, Patient ID, Phone, RFID (04:A3...), NFC, or QR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Checked In">Checked In</option>
            <option value="Waiting">Waiting</option>
            <option value="Consultation">Consultation</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Medicine Dispensed">Medicine Dispensed</option>
            <option value="Medicine Delivered">Medicine Delivered</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Blood:</span>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name & Details</th>
                <th className="px-4 py-3">Blood Group</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Identities (Face / RFID / NFC / QR)</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User className="w-8 h-8 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-400">No Patient Records Found</span>
                      <span className="text-[11px] text-slate-500">
                        {searchQuery || statusFilter !== 'ALL' || bloodFilter !== 'ALL'
                          ? 'Try clearing your search query or filters.'
                          : 'Click "Register New Patient" above to enroll patient records.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.id;
                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-slate-850/60 transition ${
                      isSelected ? 'bg-cyan-950/25 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono-tech font-bold text-cyan-400">
                      {patient.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{patient.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {patient.age} yrs • {patient.gender}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-mono-tech font-semibold border border-rose-800/80">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono-tech text-slate-400">
                      {patient.phone}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          title={patient.identifiers.faceRegistered ? 'Face Registered' : 'Face Not Registered'}
                          className={`p-1 rounded text-[10px] font-mono-tech flex items-center gap-1 border ${
                            patient.identifiers.faceRegistered
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          <Camera className="w-3 h-3" />
                          <span>FACE</span>
                        </span>

                        <span
                          title={patient.identifiers.rfidUid ? `RFID: ${patient.identifiers.rfidUid}` : 'No RFID'}
                          className={`p-1 rounded text-[10px] font-mono-tech flex items-center gap-1 border ${
                            patient.identifiers.rfidUid
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          <Radio className="w-3 h-3" />
                          <span>RFID</span>
                        </span>

                        <span
                          title={patient.identifiers.nfcId ? `NFC: ${patient.identifiers.nfcId}` : 'No NFC'}
                          className={`p-1 rounded text-[10px] font-mono-tech flex items-center gap-1 border ${
                            patient.identifiers.nfcId
                              ? 'bg-purple-950 text-purple-300 border-purple-800'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          <span>NFC</span>
                        </span>

                        <span
                          title={`QR: ${patient.identifiers.qrCode}`}
                          className="p-1 rounded text-[10px] font-mono-tech flex items-center gap-1 bg-cyan-950 text-cyan-300 border border-cyan-800"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border ${
                          patient.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : patient.status === 'Consultation'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : patient.status === 'Pharmacy'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : patient.status === 'Waiting'
                            ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setViewingPatient(patient);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition"
                          title="View Profile & Timeline"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setEditingPatient(patient);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs flex items-center gap-1 transition"
                          title="Edit Patient Details"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setPatientToDelete(patient)}
                          className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs flex items-center gap-1 transition"
                          title="Delete Patient Record"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Delete</span>
                        </button>

                        <button
                          onClick={() => {
                            checkInPatient(patient.id, 'Face + RFID', 'Normal');
                            setActiveTab('visits');
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-1 transition"
                          title="Quick Check-In"
                        >
                          <Check className="w-3 h-3" />
                          <span>Check-In</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Modal / Timeline (Section 11 & 12 requirement) */}
      {viewingPatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setViewingPatient(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-lg text-white font-tech">
                  {viewingPatient?.name ? viewingPatient.name.split(' ').map((n) => n[0]).join('') : 'PT'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-tech">{viewingPatient.name}</h3>
                    <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {viewingPatient.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {viewingPatient.age} years old • {viewingPatient.gender} • Blood Group: <strong className="text-rose-400">{viewingPatient.bloodGroup}</strong>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-cyan-300 border border-cyan-800/60 uppercase">
                Status: {viewingPatient.status}
              </span>
            </div>

            {/* Identification Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono-tech">Face Biometric</div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {viewingPatient.identifiers.faceRegistered ? 'Verified & Enrolled' : 'Not Registered'}
                </div>
                {viewingPatient.identifiers.faceHash && (
                  <div className="text-[9px] font-mono-tech text-slate-500 truncate mt-1">
                    {viewingPatient.identifiers.faceHash}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono-tech">RFID UID</div>
                <div className="text-xs font-mono-tech text-blue-300 mt-0.5 truncate">
                  {viewingPatient.identifiers.rfidUid || 'None'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono-tech">NFC Tag</div>
                <div className="text-xs font-mono-tech text-purple-300 mt-0.5 truncate">
                  {viewingPatient.identifiers.nfcId || 'None'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-mono-tech">QR Identifier</div>
                <div className="text-xs font-mono-tech text-cyan-300 mt-0.5 truncate">
                  {viewingPatient.identifiers.qrCode}
                </div>
              </div>
            </div>

            {/* Clinical & Allergy Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/60 text-xs">
                <span className="font-semibold text-rose-300 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Allergies
                </span>
                <p className="text-slate-300">
                  {viewingPatient.allergies.length > 0 ? viewingPatient.allergies.join(', ') : 'No known drug allergies reported.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Existing Conditions
                </span>
                <p className="text-slate-300">
                  {viewingPatient.existingConditions.length > 0 ? viewingPatient.existingConditions.join(', ') : 'None documented.'}
                </p>
              </div>
            </div>

            {/* Visual Patient Timeline (Section 12 requirement) */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold font-tech uppercase text-slate-200 tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                Live Patient Journey Timeline
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-cyan-500/30">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-200">Patient Arrival & Checked In</div>
                  <div className="text-[11px] text-slate-400">Identified via Face + RFID (ESP32 Gate Node). Token generated.</div>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-200">Vitals Logged</div>
                  <div className="text-[11px] text-slate-400">IoT sensor readings: BP 122/82, HR 76, SpO2 98%, Temp 37.1°C.</div>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-200">Doctor Consultation & Prescription</div>
                  <div className="text-[11px] text-slate-400">Dr. Sundar Kumar MD completed consultation. Rx sent to pharmacy.</div>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-purple-500 ring-4 ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-200">Smart Vending Dispense (VM-01)</div>
                  <div className="text-[11px] text-slate-400">Slot 01 motor operated. IR beam & HX711 load cell verified drop.</div>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                  <div className="text-xs font-semibold text-slate-200">Inpatient Ward Dispensing & Confirmation</div>
                  <div className="text-[11px] text-slate-400">Medication safely administered. Patient verified via RFID wristband.</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setPatientToDelete(viewingPatient);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-xs transition flex items-center gap-1.5"
                title="Delete Patient Record"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Record</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingPatient(viewingPatient);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPatientId(viewingPatient.id);
                    setViewingPatient(null);
                    setActiveTab('doctor');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Open in Doctor Station</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Patient Modal (Section 6 requirement) */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => {
                stopCamera();
                setIsRegisterOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-lg font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Patient Registration & Biometric Enrollment
              </h3>
              <p className="text-xs text-slate-400">
                Enroll patient demographics and link Face, RFID, NFC, and QR identifiers to a single Patient ID.
              </p>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              {/* Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
                  />
                </div>
              </div>

              {/* Allergies & Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Aspirin"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Existing Conditions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Asthma"
                    value={conditionsText}
                    onChange={(e) => setConditionsText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Multi-Modal Identifiers Section (Section 6) */}
              <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold font-tech uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Multi-Modal Identification Enrollment
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-tech">4 Identifiers → 1 Patient ID</span>
                </div>

                {/* Face Biometric Enrollment */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-semibold text-slate-200">1. Face Biometric Template</span>
                    </div>
                    {faceRegistered ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs transition"
                      >
                        Open Camera & Register
                      </button>
                    )}
                  </div>

                  {isCameraActive && (
                    <div className="mt-2 p-3 bg-black rounded-lg border border-cyan-500/50 flex flex-col items-center">
                      <div className="relative w-60 h-44 bg-slate-950 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        {/* Biometric alignment grid overlay */}
                        <div className="absolute inset-4 border-2 border-dashed border-cyan-400/70 rounded-full pointer-events-none flex items-center justify-center">
                          <span className="text-[9px] text-cyan-300 font-mono-tech bg-black/60 px-1 py-0.5 rounded">
                            Align Face Here
                          </span>
                        </div>
                      </div>

                      {cameraError && (
                        <p className="text-[10px] text-amber-300 mt-1">{cameraError}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={handleCaptureFace}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                        >
                          Capture & Store Hash
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {faceRegistered && (
                    <div className="text-[10px] font-mono-tech text-slate-400">
                      Biometric Hash: <span className="text-cyan-300">{faceHash}</span> (Encrypted)
                    </div>
                  )}
                </div>

                {/* RFID & NFC & QR */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-200 mb-1">2. RFID UID</div>
                    <div className="text-[11px] font-mono-tech text-blue-300 truncate mb-1">
                      {rfidUid || 'Not scanned yet'}
                    </div>
                    <button
                      type="button"
                      onClick={handleScanRfid}
                      className="w-full py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 text-xs hover:bg-blue-900 transition"
                    >
                      Scan RFID
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-200 mb-1">3. NFC Identifier</div>
                    <div className="text-[11px] font-mono-tech text-purple-300 truncate mb-1">
                      {nfcId || 'Not registered'}
                    </div>
                    <button
                      type="button"
                      onClick={handleRegisterNfc}
                      className="w-full py-1 rounded bg-purple-950 border border-purple-800 text-purple-300 text-xs hover:bg-purple-900 transition"
                    >
                      Register NFC
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-200 mb-1">4. Patient QR</div>
                    <div className="text-[11px] font-mono-tech text-cyan-300 truncate mb-1">
                      {qrCode}
                    </div>
                    <span className="inline-block text-[10px] text-emerald-400 font-semibold">
                      Auto-generated ✓
                    </span>
                  </div>
                </div>

                {/* Consent checkbox (Section 38 & 39 requirement) */}
                <div className="flex items-start gap-2 pt-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={biometricConsent}
                    onChange={(e) => setBiometricConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="consentCheck" className="text-[11px] text-slate-400 leading-snug">
                    <strong className="text-slate-200">Biometric Consent:</strong> Patient agrees to secure storage of biometric template references for automated hospital check-in. (Can disable anytime to use RFID/NFC/QR fallback).
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition font-tech uppercase tracking-wider"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          isOpen={Boolean(editingPatient)}
          onClose={() => setEditingPatient(null)}
          onSaved={(updated) => {
            if (viewingPatient?.id === updated.id) {
              setViewingPatient(updated);
            }
          }}
        />
      )}

      {/* Delete Patient Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-600/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-base font-bold font-tech text-white">Delete Patient Record?</h4>
                <p className="text-xs text-rose-300/80">Permanent Removal Warning</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to permanently delete patient{' '}
              <strong className="text-white">{patientToDelete.name}</strong> (
              <span className="font-mono-tech text-cyan-300">{patientToDelete.id}</span>
              )? This action will purge their hospital profile, biometric associations, and RFID credentials from the system.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePatient(patientToDelete.id);
                  if (viewingPatient?.id === patientToDelete.id) {
                    setViewingPatient(null);
                  }
                  if (editingPatient?.id === patientToDelete.id) {
                    setEditingPatient(null);
                  }
                  setPatientToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Patients Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/80 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold font-tech text-white uppercase">Clear All Patients?</h4>
                <p className="text-xs text-rose-300 font-mono-tech">
                  Total {patients.length} patient records will be removed
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will purge all patient records, medical profiles, and queue visit tokens from the hospital database. You will then have a completely fresh slate to register your own patients.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllPatients();
                  setViewingPatient(null);
                  setEditingPatient(null);
                  setShowClearAllConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear All Patients</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
