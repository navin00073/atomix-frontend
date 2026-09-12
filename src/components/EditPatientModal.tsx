import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Patient, PatientStatus } from '../types';
import {
  X,
  Pencil,
  Save,
  CheckCircle2,
  Camera,
  Radio,
  QrCode,
  AlertCircle,
  FileText,
  Shield,
  Phone,
  User,
  Mail,
  MapPin,
  Heart,
  Calendar,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface EditPatientModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedPatient: Patient) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { updatePatient, deletePatient, theme } = useHospital();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Basic Info Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [status, setStatus] = useState<PatientStatus>('Registered');

  // Contact Info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Family');

  // Medical Information
  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');

  // Identifiers
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [faceHash, setFaceHash] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [nfcId, setNfcId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [biometricConsent, setBiometricConsent] = useState(true);

  // Status feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'medical' | 'biometrics'>('general');

  // Initialize form state when a patient is opened
  useEffect(() => {
    if (patient) {
      setName(patient.name || '');
      setAge(patient.age || 0);
      setDob(patient.dob || '1990-01-01');
      setGender(patient.gender || 'Male');
      setBloodGroup(patient.bloodGroup || 'O+');
      setStatus(patient.status || 'Registered');

      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setAddress(patient.address || '');

      setEmergencyName(patient.emergencyContact?.name || '');
      setEmergencyPhone(patient.emergencyContact?.phone || '');
      setEmergencyRel(patient.emergencyContact?.relationship || 'Family');

      setAllergiesText((patient.allergies || []).join(', '));
      setConditionsText((patient.existingConditions || []).join(', '));
      setEmergencyNotes(patient.emergencyNotes || '');

      setFaceRegistered(Boolean(patient.identifiers?.faceRegistered));
      setFaceHash(patient.identifiers?.faceHash || '');
      setRfidUid(patient.identifiers?.rfidUid || '');
      setNfcId(patient.identifiers?.nfcId || '');
      setQrCode(patient.identifiers?.qrCode || `QR-${patient.id}`);
      setBiometricConsent(patient.biometricConsent ?? true);
      setSavedSuccess(false);
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleScanNewRfid = () => {
    soundEffects.playCardScan();
    const hex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
    const newUid = `04:${hex()}:${hex()}:${hex()}:${hex()}`;
    setRfidUid(newUid);
  };

  const handleRegisterNewNfc = () => {
    soundEffects.playCardScan();
    const newNfc = `NFC-${Math.floor(1000 + Math.random() * 9000)}`;
    setNfcId(newNfc);
  };

  const handleRegenerateQr = () => {
    soundEffects.playSuccessChirp();
    const newQr = `QR-PT-${Math.floor(1000 + Math.random() * 9000)}`;
    setQrCode(newQr);
  };

  const handleToggleFaceEnroll = () => {
    soundEffects.playSuccessChirp();
    if (faceRegistered) {
      setFaceRegistered(false);
      setFaceHash('');
    } else {
      setFaceRegistered(true);
      const mockHash = `SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
      setFaceHash(mockHash);
    }
  };

  const handleReset = () => {
    if (patient) {
      setName(patient.name || '');
      setAge(patient.age || 0);
      setDob(patient.dob || '1990-01-01');
      setGender(patient.gender || 'Male');
      setBloodGroup(patient.bloodGroup || 'O+');
      setStatus(patient.status || 'Registered');
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setAddress(patient.address || '');
      setEmergencyName(patient.emergencyContact?.name || '');
      setEmergencyPhone(patient.emergencyContact?.phone || '');
      setEmergencyRel(patient.emergencyContact?.relationship || 'Family');
      setAllergiesText((patient.allergies || []).join(', '));
      setConditionsText((patient.existingConditions || []).join(', '));
      setEmergencyNotes(patient.emergencyNotes || '');
      setFaceRegistered(Boolean(patient.identifiers?.faceRegistered));
      setFaceHash(patient.identifiers?.faceHash || '');
      setRfidUid(patient.identifiers?.rfidUid || '');
      setNfcId(patient.identifiers?.nfcId || '');
      setQrCode(patient.identifiers?.qrCode || `QR-${patient.id}`);
      setBiometricConsent(patient.biometricConsent ?? true);
      soundEffects.playCardScan();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allergies = allergiesText
      ? allergiesText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const existingConditions = conditionsText
      ? conditionsText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const updated = updatePatient(patient.id, {
      name: name.trim(),
      age: Number(age),
      dob,
      gender,
      bloodGroup,
      status,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      emergencyContact: {
        name: emergencyName.trim() || 'Emergency Contact',
        relationship: emergencyRel.trim() || 'Contact',
        phone: emergencyPhone.trim() || phone.trim(),
      },
      allergies,
      existingConditions,
      emergencyNotes: emergencyNotes.trim(),
      biometricConsent,
      identifiers: {
        faceRegistered,
        faceHash: faceRegistered ? faceHash : undefined,
        rfidUid: rfidUid.trim() || undefined,
        nfcId: nfcId.trim() || undefined,
        qrCode: qrCode.trim() || patient.identifiers.qrCode,
      },
    });

    if (updated) {
      setSavedSuccess(true);
      if (onSaved) {
        onSaved(updated);
      }
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`rounded-2xl border max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative my-6 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-200 shadow-cyan-950/40'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-400/40'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition ${
            isDark
              ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 pb-4 border-b border-slate-800/80 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-tech uppercase tracking-wider text-cyan-400">
                Edit Patient Record
              </h3>
              <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                {patient.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Update demographics, medical allergies, emergency contacts, and multi-modal identifiers.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'general'
                ? isDark
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Demographics & Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('medical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'medical'
                ? isDark
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Medical History & Allergies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('biometrics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSubTab === 'biometrics'
                ? isDark
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Biometrics & Identifiers</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TAB 1: General Demographics & Contact */}
          {activeSubTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Hospital Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PatientStatus)}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="Registered">Registered</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Medicine Dispensed">Medicine Dispensed</option>
                    <option value="Completed">Completed</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={130}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={`w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as any)}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
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
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-2">
                  Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs font-mono-tech focus:outline-none focus:border-cyan-500 border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-2">
                  Emergency Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={emergencyRel}
                      onChange={(e) => setEmergencyRel(e.target.value)}
                      placeholder="e.g. Spouse, Parent, Sibling"
                      className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 98400 11223"
                      className={`w-full rounded-lg px-3 py-1.5 text-xs font-mono-tech focus:outline-none focus:border-cyan-500 border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Medical History & Allergies */}
          {activeSubTab === 'medical' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-800/60">
                <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  Known Drug Allergies (Critical for Clinical Prescribing)
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Comma-separated list (e.g., Penicillin, Aspirin, Sulfa drugs). The doctor station cross-checks these against prescribed formulations.
                </p>
                <textarea
                  rows={2}
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin, Ibuprofen"
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none focus:border-rose-500 border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-rose-200 placeholder-slate-600'
                      : 'bg-white border-rose-200 text-rose-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Existing Medical Conditions
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Comma-separated list (e.g., Hypertension, Type 2 Diabetes, Asthma, CAD).
                </p>
                <textarea
                  rows={2}
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Emergency Clinical Notes / Special Care Instructions
                </label>
                <textarea
                  rows={3}
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  placeholder="e.g. Requires wheelchair assistance, pacemaker installed, sensitive to sudden posture changes..."
                  className={`w-full rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-500 border ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Biometrics & Identifiers */}
          {activeSubTab === 'biometrics' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-tech uppercase text-cyan-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    Multi-Modal Identification Links
                  </span>
                  <span className="text-[10px] font-mono-tech text-slate-400">
                    4 Identifiers &rarr; Patient ID ({patient.id})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Edit or re-pair physical and biometric credentials for this patient record.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Face Biometric Status */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" /> Face Biometrics
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleFaceEnroll}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                          faceRegistered
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-rose-950 hover:text-rose-300'
                            : 'bg-cyan-950 text-cyan-300 border-cyan-800 hover:bg-cyan-900'
                        }`}
                      >
                        {faceRegistered ? 'Enrolled (Toggle)' : '+ Enroll Template'}
                      </button>
                    </div>
                    {faceRegistered ? (
                      <div className="text-[10px] font-mono-tech text-slate-400 truncate">
                        Hash: <span className="text-cyan-300">{faceHash || 'SHA256:VERIFIED_FACE_EMBEDDING'}</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 italic">No face template enrolled</div>
                    )}
                  </div>

                  {/* RFID Card */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-blue-400" /> RFID Wristband UID
                      </span>
                      <button
                        type="button"
                        onClick={handleScanNewRfid}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900 transition"
                      >
                        Scan / Re-assign
                      </button>
                    </div>
                    <input
                      type="text"
                      value={rfidUid}
                      onChange={(e) => setRfidUid(e.target.value)}
                      placeholder="e.g. 04:A3:2B:1C:89"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono-tech text-blue-300"
                    />
                  </div>

                  {/* NFC Identifier */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-400" /> NFC Card / Tag
                      </span>
                      <button
                        type="button"
                        onClick={handleRegisterNewNfc}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 transition"
                      >
                        Register New
                      </button>
                    </div>
                    <input
                      type="text"
                      value={nfcId}
                      onChange={(e) => setNfcId(e.target.value)}
                      placeholder="e.g. NFC-8821"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono-tech text-purple-300"
                    />
                  </div>

                  {/* Patient QR Code */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" /> Digital QR Code
                      </span>
                      <button
                        type="button"
                        onClick={handleRegenerateQr}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition"
                      >
                        Regenerate
                      </button>
                    </div>
                    <input
                      type="text"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="e.g. QR-PT-1024"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono-tech text-cyan-300"
                    />
                  </div>
                </div>

                {/* Consent checkbox */}
                <div className="mt-3 flex items-start gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="checkbox"
                    id="editConsentCheck"
                    checked={biometricConsent}
                    onChange={(e) => setBiometricConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="editConsentCheck" className="text-[11px] text-slate-400 leading-snug">
                    <strong className="text-slate-200">Patient Biometric Authorization:</strong> Consent confirmed to store encrypted biometric feature vectors for touchless authentication at hospital gates.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Patient details successfully updated and synchronized to hospital EMR!</span>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80 mt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {confirmDelete ? (
                <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-700/80 px-2.5 py-1 rounded-lg animate-in fade-in">
                  <span className="text-[11px] text-rose-300 font-semibold">Confirm delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (patient) {
                        deletePatient(patient.id);
                        onClose();
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Yes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-white"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-1.5 transition"
                  title="Permanently Delete Patient"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Patient</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3 py-1.5 rounded-lg text-xs transition ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition font-tech uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
