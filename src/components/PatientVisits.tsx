import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  CalendarCheck2,
  Radio,
  Camera,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Stethoscope,
  Activity,
  AlertTriangle,
  User,
  Trash2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { PatientVisit } from '../types';

export const PatientVisits: React.FC = () => {
  const {
    patients,
    visits,
    checkInPatient,
    deleteVisit,
    clearAllVisits,
    setSelectedPatientId,
    setActiveTab,
  } = useHospital();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedSimPatient, setSelectedSimPatient] = useState(patients[0]?.id || '');
  const [checkinMethod, setCheckinMethod] = useState<'Face + RFID' | 'RFID' | 'NFC' | 'QR' | 'Face' | 'Fingerprint'>('Face + RFID');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Emergency'>('Normal');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deletion Confirmation States
  const [visitToDelete, setVisitToDelete] = useState<PatientVisit | null>(null);
  const [showClearQueueConfirm, setShowClearQueueConfirm] = useState(false);

  // Keep selected patient sync if list changes
  React.useEffect(() => {
    if ((!selectedSimPatient || !patients.some((p) => p.id === selectedSimPatient)) && patients.length > 0) {
      setSelectedSimPatient(patients[0].id);
    }
  }, [patients, selectedSimPatient]);

  const handleQuickCheckin = () => {
    if (!selectedSimPatient) {
      alert('Please select or register a patient first.');
      return;
    }
    const v = checkInPatient(selectedSimPatient, checkinMethod, priority);
    const p = patients.find((pt) => pt.id === selectedSimPatient);
    setSuccessMessage(`Checked in ${p?.name || selectedSimPatient} via ${checkinMethod}. Token: ${v.tokenNumber}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleConfirmDeleteVisit = () => {
    if (visitToDelete) {
      deleteVisit(visitToDelete.id);
      setVisitToDelete(null);
    }
  };

  const handleConfirmClearQueue = () => {
    clearAllVisits();
    setShowClearQueueConfirm(false);
  };

  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.patientName.toLowerCase().includes(search.toLowerCase()) ||
      v.patientId.toLowerCase().includes(search.toLowerCase()) ||
      v.tokenNumber.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === 'ALL' || v.method.includes(methodFilter);
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-cyan-400" />
            Patient Visit & Attendance Manager
          </h2>
          <p className="text-xs text-slate-400">
            Automated check-in via Face / RFID / NFC / QR terminal. Auto-token generation and patient queue tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tech px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            Active Visits in Queue: <strong className="text-white">{visits.length}</strong>
          </span>

          {visits.length > 0 && (
            <button
              onClick={() => setShowClearQueueConfirm(true)}
              className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Delete all visits and clear the active queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Check-in Terminal Simulator */}
      <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold font-tech text-slate-200 uppercase tracking-wider">
              IoT Entry Terminal Check-In Simulation (ESP32 Gateway)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-tech">ESP32-GATE-01</span>
        </div>

        {patients.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              No patients registered in the hospital database. To check in and generate visits, please register your first patient.
            </p>
            <button
              onClick={() => setActiveTab('patients')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Go to Patient Management to Register</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Select Patient</label>
              <select
                value={selectedSimPatient}
                onChange={(e) => setSelectedSimPatient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.name} ({p.bloodGroup})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Identification Method</label>
              <select
                value={checkinMethod}
                onChange={(e) => setCheckinMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
              >
                <option value="Face + RFID">Face + RFID (Dual Auth)</option>
                <option value="Face">Face Biometric Only</option>
                <option value="Fingerprint">Fingerprint Biometric Only</option>
                <option value="RFID">RFID Card Tap (04:A3...)</option>
                <option value="NFC">NFC Phone/Badge</option>
                <option value="QR">QR Code Scanner</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono-tech"
              >
                <option value="Normal">Normal Queue</option>
                <option value="High">High (Urgent)</option>
                <option value="Emergency">Emergency (Code Blue)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleQuickCheckin}
                className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition font-tech uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>Simulate Check-In</span>
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Patient Name, ID, or Token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Methods</option>
            <option value="Face">Face</option>
            <option value="Fingerprint">Fingerprint</option>
            <option value="RFID">RFID</option>
            <option value="NFC">NFC</option>
            <option value="QR">QR</option>
          </select>
        </div>
      </div>

      {/* Attendance & Visit Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono-tech uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Patient Name & ID</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Identification Method</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CalendarCheck2 className="w-7 h-7 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-400">No Visits Found in Queue</span>
                      <span className="text-[11px] text-slate-500">
                        {search || methodFilter !== 'ALL'
                          ? 'Try clearing the search filter.'
                          : 'Use the check-in terminal above to add patients to the active queue.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-850/50 transition">
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono-tech font-bold border border-cyan-800">
                        {visit.tokenNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{visit.patientName}</div>
                      <div className="text-[11px] font-mono-tech text-cyan-400">{visit.patientId}</div>
                    </td>
                    <td className="px-4 py-3 font-mono-tech text-slate-400">
                      {visit.checkInTime}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-tech text-[10px] border border-slate-700">
                        {visit.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono-tech uppercase ${
                          visit.priority === 'Emergency'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : visit.priority === 'High'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {visit.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                          visit.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : visit.status === 'Consultation'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : visit.status === 'Pharmacy'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : visit.status === 'Waiting' || visit.status === 'Checked In'
                            ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPatientId(visit.patientId);
                            setActiveTab('doctor');
                          }}
                          className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs flex items-center gap-1 transition font-medium"
                          title="Open Doctor Consultation"
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>Consult</span>
                        </button>

                        <button
                          onClick={() => setVisitToDelete(visit)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-200 transition"
                          title="Delete visit from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Single Visit Confirmation Modal */}
      {visitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/60 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-tech uppercase tracking-wide">
                  Delete Visit Record?
                </h3>
                <p className="text-xs text-slate-400 font-mono-tech">
                  Token: {visitToDelete.tokenNumber} • Visit #{visitToDelete.id}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p>
                <strong className="text-white">Patient:</strong> {visitToDelete.patientName} ({visitToDelete.patientId})
              </p>
              <p>
                <strong className="text-white">Check-in:</strong> {visitToDelete.checkInTime} ({visitToDelete.method})
              </p>
              <p className="text-amber-300 text-[11px] pt-1">
                Removing this visit will delete it from the doctor consultation queue and reset the patient's active token.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setVisitToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteVisit}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Entire Queue Confirmation Modal */}
      {showClearQueueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-tech uppercase tracking-wide">
                  Clear All Visits / Queue?
                </h3>
                <p className="text-xs text-rose-300 font-mono-tech">
                  Total {visits.length} active visit records will be purged
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will remove all patients from the waiting and consultation queue, clearing active tokens. Patients will remain registered in the database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearQueueConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearQueue}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear Entire Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
