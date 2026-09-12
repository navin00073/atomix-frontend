import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { X, UserPlus, Fingerprint, Radio, ScanFace, Check, Sparkles } from 'lucide-react';
import { StaffRole } from '../types';
import { soundEffects } from '../utils/audio';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose }) => {
  const { registerStaff } = useHospital();

  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>('Doctor');
  const [department, setDepartment] = useState('General Medicine');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [rfidUid, setRfidUid] = useState(`04:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:A1`);
  const [nfcId, setNfcId] = useState(`NFC-STF-${Math.floor(10 + Math.random() * 89)}`);
  const [faceRegistered, setFaceRegistered] = useState(true);
  const [fingerprintRegistered, setFingerprintRegistered] = useState(true);

  if (!isOpen) return null;

  const handleGenerateRfid = () => {
    soundEffects.playCardScan();
    const hex = () => Math.floor(16 + Math.random() * 239).toString(16).toUpperCase().padStart(2, '0');
    setRfidUid(`04:${hex()}:${hex()}:${hex()}`);
    setNfcId(`NFC-STF-${Math.floor(100 + Math.random() * 899)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide the staff or doctor name.');
      return;
    }

    registerStaff({
      name: name.trim(),
      role,
      department,
      specialization: specialization.trim() || (role === 'Doctor' ? `${department} Specialist` : undefined),
      rfidUid,
      nfcId,
      faceRegistered,
      fingerprintRegistered,
      status: 'Present',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workingHoursToday: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-tech uppercase tracking-wide">
                Enrol New Doctor / Hospital Personnel
              </h3>
              <p className="text-[11px] text-slate-400 font-mono-tech">
                IoT Biometric & RFID/NFC Badge Registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={role === 'Doctor' ? 'e.g. Dr. Aravind Swamy MD' : 'e.g. Nurse Priya Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Hospital Role <span className="text-rose-400">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Doctor">Doctor / Physician</option>
                <option value="Nurse">Staff Nurse</option>
                <option value="Pharmacist">Clinical Pharmacist</option>
                <option value="Technician">IoT / Biomedical Technician</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Department & Specialization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency & Trauma">Emergency & Trauma (ICU)</option>
                <option value="Pharmacy">Pharmacy & Dispensary</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Radiology">Radiology & Imaging</option>
                <option value="Administration">Hospital Administration</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Specialization / Qualification
              </label>
              <input
                type="text"
                placeholder={role === 'Doctor' ? 'e.g. Senior Cardiologist' : 'e.g. ICU Certified'}
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Contact Phone / Pager
            </label>
            <input
              type="text"
              placeholder="+91 98401 23456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
            />
          </div>

          {/* Contactless Badge / Hardware Credentials */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-tech">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                IoT Badge Credentials (RFID / NFC)
              </span>
              <button
                type="button"
                onClick={handleGenerateRfid}
                className="text-[11px] font-mono-tech text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Generate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  13.56MHz RFID UID
                </label>
                <input
                  type="text"
                  value={rfidUid}
                  onChange={(e) => setRfidUid(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono-tech focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  NFC Badge Tag
                </label>
                <input
                  type="text"
                  value={nfcId}
                  onChange={(e) => setNfcId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-purple-300 font-mono-tech focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Biometrics Registration Options */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-tech">
              <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
              Biometric Attendance Profiles
            </span>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex-1">
                <input
                  type="checkbox"
                  checked={fingerprintRegistered}
                  onChange={(e) => setFingerprintRegistered(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-0"
                />
                <Fingerprint className="w-4 h-4 text-teal-400" />
                <span>R307 Optical Fingerprint Template</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex-1">
                <input
                  type="checkbox"
                  checked={faceRegistered}
                  onChange={(e) => setFaceRegistered(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <ScanFace className="w-4 h-4 text-cyan-400" />
                <span>ESP32-CAM Face Vector Enrolled</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-600/30 flex items-center gap-2 font-tech uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>Save & Enrol Personnel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
