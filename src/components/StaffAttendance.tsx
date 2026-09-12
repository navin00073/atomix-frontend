import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  UserCog,
  Radio,
  Camera,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  Sparkles,
  LogOut,
  LogIn,
  Fingerprint,
  ScanFace,
  Trash2,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../utils/audio';
import { StaffMember } from '../types';
import { AddStaffModal } from './AddStaffModal';

export const StaffAttendance: React.FC = () => {
  const {
    staff,
    toggleStaffStatus: globalToggleStaffStatus,
    deleteStaff,
    clearAllStaff,
  } = useHospital();

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [recentAction, setRecentAction] = useState<{
    id: string;
    type: 'IN' | 'OUT';
    name: string;
    method?: string;
  } | null>(null);

  const [selectedStaffForBio, setSelectedStaffForBio] = useState<string>(staff[0]?.id || '');
  const [bioScanning, setBioScanning] = useState<'Face' | 'Fingerprint' | null>(null);

  // Modals & Confirmation States
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [showClearStaffConfirm, setShowClearStaffConfirm] = useState(false);

  // Keep selectedStaffForBio in sync if list changes
  useEffect(() => {
    if ((!selectedStaffForBio || !staff.some((s) => s.id === selectedStaffForBio)) && staff.length > 0) {
      setSelectedStaffForBio(staff[0].id);
    }
  }, [staff, selectedStaffForBio]);

  const toggleStaffStatus = (id: string, methodUsed: 'RFID' | 'Face' | 'Fingerprint' = 'RFID') => {
    const result = globalToggleStaffStatus(id, methodUsed, 'ESP32-BIO-01');
    if (result && result.staffMember) {
      setRecentAction({
        id,
        type: result.action,
        name: result.staffMember.name,
        method: methodUsed,
      });
      setTimeout(() => {
        setRecentAction((curr) => (curr?.id === id ? null : curr));
      }, 3000);
    }
  };

  const handleBiometricPunch = (method: 'Face' | 'Fingerprint') => {
    if (bioScanning || !selectedStaffForBio) return;
    setBioScanning(method);
    soundEffects.playCardScan();

    setTimeout(() => {
      toggleStaffStatus(selectedStaffForBio, method);
      setBioScanning(null);
    }, 850);
  };

  const handleConfirmDeleteStaff = () => {
    if (staffToDelete) {
      deleteStaff(staffToDelete.id);
      setStaffToDelete(null);
    }
  };

  const handleConfirmClearStaff = () => {
    clearAllStaff(false);
    setShowClearStaffConfirm(false);
  };

  const filteredStaff = staff.filter((s) => {
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.rfidUid.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const presentCount = staff.filter((s) => s.status === 'Present' || s.status === 'On Duty').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <UserCog className="w-5 h-5 text-cyan-400" />
            Hospital Staff & Doctor Management
          </h2>
          <p className="text-xs text-slate-400">
            Biometric (Fingerprint & Face) and Contactless (RFID/NFC) badge attendance tracking for Medical, Nursing & Technical Personnel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono-tech px-3 py-1.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
            On Duty: {presentCount} / {staff.length}
          </span>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/30 font-tech uppercase tracking-wide"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Doctor / Staff</span>
          </button>

          {staff.length > 0 && (
            <button
              onClick={() => setShowClearStaffConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Delete all staff and doctor records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Roster</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Micro-Notification Toast */}
      <AnimatePresence>
        {recentAction && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className={`p-3 rounded-xl border text-xs flex items-center justify-between shadow-xl ${
              recentAction.type === 'IN'
                ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {recentAction.type === 'IN' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              ) : (
                <LogOut className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="font-semibold">
                {recentAction.name} successfully clocked {recentAction.type === 'IN' ? 'IN' : 'OUT'} via {recentAction.method || 'Fingerprint'} verification!
              </span>
            </div>
            <span className="text-[10px] font-mono-tech opacity-75">Template Vector Confirmed</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Attendance Terminal Punch Kiosk */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 font-tech uppercase tracking-wider">
              Biometric Clock-In / Out Terminal (ICCU Entrance Gate)
            </span>
          </div>
          <span className="text-[10px] font-mono-tech text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FIDO2 / 508 DPI Sensor Online
          </span>
        </div>

        {staff.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              No medical staff or doctors enrolled in the roster. Add your team members to simulate IoT biometric clock-in.
            </p>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Your First Doctor or Staff Member</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-6">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Select Enrolled Medical Staff:
              </label>
              <select
                value={selectedStaffForBio}
                onChange={(e) => setSelectedStaffForBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role} - {s.department}) [{s.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-6 flex items-center gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => handleBiometricPunch('Fingerprint')}
                disabled={bioScanning !== null || !selectedStaffForBio}
                className="flex-1 py-2 px-3 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-600 text-teal-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-md shadow-teal-950/50"
              >
                <Fingerprint className={`w-3.5 h-3.5 ${bioScanning === 'Fingerprint' ? 'animate-pulse text-teal-300' : 'text-teal-400'}`} />
                <span>{bioScanning === 'Fingerprint' ? 'Acquiring Minutiae...' : 'Touch Fingerprint Sensor'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleBiometricPunch('Face')}
                disabled={bioScanning !== null || !selectedStaffForBio}
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <ScanFace className={`w-3.5 h-3.5 ${bioScanning === 'Face' ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{bioScanning === 'Face' ? 'Scanning Face...' : 'Face ID Scan'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Name, Staff ID, Department, or RFID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Roles</option>
            <option value="Doctor">Doctors</option>
            <option value="Nurse">Nurses</option>
            <option value="Pharmacist">Pharmacists</option>
            <option value="Technician">Technicians</option>
            <option value="Admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Staff Roster & Attendance Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Staff ID & Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">IoT Credentials</th>
                <th className="px-4 py-3">Check-In</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCog className="w-8 h-8 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-400">No Personnel Found</span>
                      <span className="text-[11px] text-slate-500">
                        {search || roleFilter !== 'ALL'
                          ? 'Try clearing your search or filter.'
                          : 'Click "+ Add Doctor / Staff" above to register doctor and staff records.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const isPresent = member.status === 'Present' || member.status === 'On Duty';
                  const isJustChanged = recentAction?.id === member.id;

                  return (
                    <tr
                      key={member.id}
                      className={`transition ${
                        isJustChanged
                          ? 'bg-cyan-950/30'
                          : 'hover:bg-slate-850/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.specialization && (
                            <span className="text-[10px] text-cyan-400 font-normal hidden sm:inline">
                              ({member.specialization})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono-tech text-cyan-400">{member.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono-tech uppercase ${
                            member.role === 'Doctor'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : member.role === 'Nurse'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : member.role === 'Pharmacist'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {member.department}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono-tech text-[10px]"
                            title={member.rfidUid}
                          >
                            RFID
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono-tech text-[10px]">
                            NFC
                          </span>
                          {member.faceRegistered && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono-tech text-[10px]">
                              FACE
                            </span>
                          )}
                          {member.fingerprintRegistered && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700 font-mono-tech text-[10px] flex items-center gap-1 font-semibold"
                              title="R307 / AS608 Fingerprint Enrolled"
                            >
                              <Fingerprint className="w-2.5 h-2.5 text-teal-400" />
                              FP:OK
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono-tech text-slate-400">
                        {member.checkInTime || '--:--'}
                      </td>
                      <td className="px-4 py-3 font-mono-tech text-slate-300">
                        {member.workingHoursToday ? `${member.workingHoursToday} hrs` : '--'}
                      </td>
                      <td className="px-4 py-3">
                        <motion.span
                          key={member.status}
                          initial={{ scale: 0.85 }}
                          animate={{ scale: 1 }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border inline-block transition-colors ${
                            isPresent
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                              : member.status === 'Late'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {member.status}
                        </motion.span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => toggleStaffStatus(member.id, 'Fingerprint')}
                            title="Instant Fingerprint Biometric Attendance"
                            className="px-2 py-1 rounded-lg text-xs font-semibold font-mono-tech transition flex items-center gap-1 cursor-pointer bg-teal-950/80 hover:bg-teal-900 border border-teal-700 text-teal-300 shadow-sm"
                          >
                            <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
                            <span className="hidden sm:inline">Bio</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => toggleStaffStatus(member.id, 'RFID')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono-tech transition flex items-center gap-1.5 cursor-pointer shadow ${
                              isPresent
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {isJustChanged ? (
                              <div className="flex items-center gap-1 text-emerald-400">
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved</span>
                              </div>
                            ) : isPresent ? (
                              <>
                                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                                <span className="hidden sm:inline">Out</span>
                              </>
                            ) : (
                              <>
                                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="hidden sm:inline">In</span>
                              </>
                            )}
                          </motion.button>

                          <button
                            type="button"
                            onClick={() => setStaffToDelete(member)}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-200 transition"
                            title={`Delete ${member.role} ${member.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff / Doctor Modal */}
      {isAddStaffOpen && (
        <AddStaffModal
          isOpen={isAddStaffOpen}
          onClose={() => setIsAddStaffOpen(false)}
        />
      )}

      {/* Delete Single Staff Member Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/60 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-tech uppercase tracking-wide">
                  Delete Personnel Record?
                </h3>
                <p className="text-xs text-slate-400 font-mono-tech">
                  {staffToDelete.id} • {staffToDelete.role}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>
                <strong className="text-white">Name:</strong> {staffToDelete.name}
              </p>
              <p>
                <strong className="text-white">Department:</strong> {staffToDelete.department}
              </p>
              <p>
                <strong className="text-white">RFID UID:</strong> {staffToDelete.rfidUid}
              </p>
              <p className="text-rose-300 text-[11px] pt-1">
                Removing this record will delete their biometrics and credentials from the system.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setStaffToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteStaff}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Staff Confirmation Modal */}
      {showClearStaffConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-tech uppercase tracking-wide">
                  Clear All Personnel / Doctors?
                </h3>
                <p className="text-xs text-rose-300 font-mono-tech">
                  Total {staff.length} staff records will be removed
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove all doctors, nurses, pharmacists, and technicians from the roster. You can then add your own doctors and staff freshly.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearStaffConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearStaff}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear All Personnel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
