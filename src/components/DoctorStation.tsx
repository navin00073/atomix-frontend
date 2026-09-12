import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { MedicineItem, Prescription } from '../types';
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  AlertTriangle,
  Plus,
  Trash2,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  ShieldAlert,
  Cpu,
  FileCheck,
  Pencil,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { EditPatientModal } from './EditPatientModal';

export const DoctorStation: React.FC = () => {
  const {
    patients,
    visits,
    medicines,
    selectedPatientId,
    setSelectedPatientId,
    recordVitals,
    createPrescription,
    doctors,
    deleteVisit,
    setActiveTab,
  } = useHospital();

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientVisit = visits.find((v) => v.patientId === selectedPatient?.id);

  // Vitals State
  const [bp, setBp] = useState('120/80');
  const [heartRate, setHeartRate] = useState(74);
  const [temp, setTemp] = useState(36.8);
  const [spo2, setSpo2] = useState(99);
  const [respRate, setRespRate] = useState(16);
  const [isSimulatingSensor, setIsSimulatingSensor] = useState(false);

  // Consultation State
  const [chiefComplaint, setChiefComplaint] = useState('Moderate headache, fever and mild throat irritation');
  const [symptoms, setSymptoms] = useState('Body pain, chills, elevated evening temperature');
  const [observations, setObservations] = useState('Pharyngeal erythema observed, clear lung sounds, normal heart rhythm.');
  const [diagnosis, setDiagnosis] = useState('Acute Viral Upper Respiratory Infection');
  const [doctorNotes, setDoctorNotes] = useState('Advised hydration, rest, and follow-up if fever exceeds 3 days.');
  const [followUpDate, setFollowUpDate] = useState('2026-09-17');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'DOC-01');

  // Prescription builder state
  const [prescribedItems, setPrescribedItems] = useState<MedicineItem[]>([
    {
      id: 'MED-01',
      name: 'Paracetamol',
      strength: '650mg',
      dosage: '1 tablet',
      frequency: '1-0-1 (Morning & Night)',
      duration: '3 Days',
      quantity: 6,
      instructions: 'Take after meals',
    },
    {
      id: 'MED-04',
      name: 'Pantoprazole',
      strength: '40mg',
      dosage: '1 tablet',
      frequency: '1-0-0 (Morning Empty Stomach)',
      duration: '5 Days',
      quantity: 5,
      instructions: 'Take 30 mins before breakfast',
    },
  ]);

  const [selectedMedToAdd, setSelectedMedToAdd] = useState(medicines[0]?.id || 'MED-01');
  const [rxSuccessMsg, setRxSuccessMsg] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Update vitals when patient changes
  useEffect(() => {
    if (selectedPatient && selectedPatient.vitalsHistory && selectedPatient.vitalsHistory.length > 0) {
      const latest = selectedPatient.vitalsHistory[selectedPatient.vitalsHistory.length - 1];
      setBp(latest.bloodPressure);
      setHeartRate(latest.heartRate);
      setTemp(latest.temperature);
      setSpo2(latest.spO2);
      setRespRate(latest.respiratoryRate);
    }
  }, [selectedPatient]);

  // Simulate IoT Sensor reading
  const handleReadIoTSensors = () => {
    setIsSimulatingSensor(true);
    soundEffects.playCardScan();
    setTimeout(() => {
      const simulatedBp = `${Math.floor(115 + Math.random() * 20)}/${Math.floor(75 + Math.random() * 15)}`;
      const simulatedHr = Math.floor(70 + Math.random() * 25);
      const simulatedTemp = Number((36.5 + Math.random() * 1.5).toFixed(1));
      const simulatedSpo2 = Math.floor(96 + Math.random() * 4);
      const simulatedResp = Math.floor(14 + Math.random() * 6);

      setBp(simulatedBp);
      setHeartRate(simulatedHr);
      setTemp(simulatedTemp);
      setSpo2(simulatedSpo2);
      setRespRate(simulatedResp);

      if (selectedPatient) {
        recordVitals(selectedPatient.id, {
          heartRate: simulatedHr,
          bloodPressure: simulatedBp,
          temperature: simulatedTemp,
          spO2: simulatedSpo2,
          respiratoryRate: simulatedResp,
        });
      }

      setIsSimulatingSensor(false);
      soundEffects.playSuccessChirp();
    }, 600);
  };

  const handleAddMedicineToRx = () => {
    const med = medicines.find((m) => m.id === selectedMedToAdd);
    if (!med) return;

    const newItem: MedicineItem = {
      id: med.id,
      name: med.name,
      strength: med.strength,
      dosage: '1 unit',
      frequency: '1-0-1',
      duration: '5 Days',
      quantity: 10,
      instructions: 'As directed by physician',
    };

    setPrescribedItems((prev) => [...prev, newItem]);
    soundEffects.playSuccessChirp();
  };

  const handleRemoveItem = (index: number) => {
    setPrescribedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndSendRx = (target: 'PHARMACY' | 'VENDING') => {
    if (!selectedPatient || prescribedItems.length === 0) return;

    // Check allergy conflict
    const hasPenicillinAllergy = selectedPatient.allergies.some((a) =>
      a.toLowerCase().includes('penicillin')
    );
    const hasAmoxPrescribed = prescribedItems.some((i) =>
      i.name.toLowerCase().includes('amoxicillin')
    );

    if (hasPenicillinAllergy && hasAmoxPrescribed) {
      soundEffects.playEmergencyAlert();
      alert(`ALLERGY CONFLICT DETECTED: Patient ${selectedPatient.name} is allergic to Penicillin. Amoxicillin cannot be prescribed!`);
      return;
    }

    const doctor = (doctors || []).find((d) => d.id === selectedDoctorId) || doctors?.[0] || { id: 'DOC-01', name: 'Dr. Sundar Kumar MD' };

    const rx = createPrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorNotes,
      diagnosis,
      medicines: prescribedItems,
      destination: target === 'VENDING' ? 'Smart Vending VM-01' : 'Central Pharmacy',
    });

    soundEffects.playSuccessChirp();
    setRxSuccessMsg(`Prescription ${rx.id} generated and transmitted to ${target === 'VENDING' ? 'Smart Vending VM-01' : 'Central Pharmacy Queue'}.`);

    setTimeout(() => {
      setRxSuccessMsg(null);
      if (target === 'VENDING') setActiveTab('vending');
      else setActiveTab('pharmacy');
    }, 1800);
  };

  // Waiting queue
  const waitingVisits = visits.filter(
    (v) => v.status === 'Waiting' || v.status === 'Checked In' || v.status === 'Consultation'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-tech text-white uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            Doctor Clinical Consultation & Digital Rx Station
          </h2>
          <p className="text-xs text-slate-400">
            Triage queue, IoT sensor telemetry integration, electronic health records, and closed-loop prescription routing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-slate-400 mr-2">Consulting Doctor:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono-tech focus:outline-none"
            >
              {(doctors || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization || d.department || 'Clinical Medicine'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Column 1: Today's Patient Queue (Section 13) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold font-tech text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Patient Queue ({waitingVisits.length})
            </span>
            <span className="text-[10px] font-mono-tech text-slate-400">Live</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {waitingVisits.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1 text-slate-500">
                <Clock className="w-5 h-5 mx-auto text-slate-600 mb-1" />
                <p className="text-xs font-semibold text-slate-400">Queue is Empty</p>
                <p className="text-[10px] text-slate-500">No patients waiting in queue. Check in patients from Visits tab.</p>
              </div>
            ) : (
              waitingVisits.map((v) => {
                const isSelected = selectedPatient?.id === v.patientId;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedPatientId(v.patientId)}
                    className={`p-3 rounded-xl border cursor-pointer transition relative group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono-tech text-xs font-bold text-cyan-400">
                        {v.tokenNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono-tech font-bold uppercase px-1.5 py-0.2 rounded ${
                            v.priority === 'Emergency'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : v.priority === 'High'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {v.priority}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Remove ${v.patientName} (${v.tokenNumber}) from queue?`)) {
                              deleteVisit(v.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition"
                          title="Delete visit / Remove from queue"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-xs text-slate-200">{v.patientName}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400 mt-1">
                      <span>{v.patientId}</span>
                      <span>{v.checkInTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2 & 3: Clinical Hub (Vitals, Medical History & Consultation Notes) */}
        <div className="lg:col-span-3 space-y-5">
          {!selectedPatient ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <User className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-tech">No Patient Available</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are no patients registered or in queue. Register a fresh patient profile to begin clinical consultations, vitals capture, and prescriptions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('patients')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition"
              >
                <User className="w-4 h-4" />
                <span>Register New Patient</span>
              </button>
            </div>
          ) : (
            <>
              {/* Patient Banner & Allergy Warning (Section 14) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white font-tech">
                  {selectedPatient?.name ? selectedPatient.name.split(' ').map((n) => n[0]).join('') : 'PT'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-tech">{selectedPatient?.name}</h3>
                    <span className="text-xs font-mono-tech px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {selectedPatient?.id}
                    </span>
                    {patientVisit && (
                      <span className="text-xs font-mono-tech px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                        Token: {patientVisit.tokenNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedPatient?.age} yrs • {selectedPatient?.gender} • Blood Group: <strong className="text-rose-400">{selectedPatient?.bloodGroup}</strong> • Phone: {selectedPatient?.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tech px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Status: {selectedPatient?.status}
                </span>
                {selectedPatient && (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs flex items-center gap-1 transition"
                    title="Edit Patient Details & Allergies"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit Patient</span>
                  </button>
                )}
              </div>
            </div>

            {/* Red Allergy Highlight Box (Section 14 requirement) */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                  selectedPatient?.allergies && selectedPatient.allergies.length > 0
                    ? 'bg-rose-950/60 border-rose-600 text-rose-200 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-rose-300">
                    Known Drug Allergies
                  </span>
                  <span>
                    {selectedPatient?.allergies && selectedPatient.allergies.length > 0
                      ? selectedPatient.allergies.join(', ')
                      : 'No known drug allergies on record.'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start gap-2">
                <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-400">
                    Existing Medical Conditions
                  </span>
                  <span className="text-slate-300">
                    {selectedPatient?.existingConditions && selectedPatient.existingConditions.length > 0
                      ? selectedPatient.existingConditions.join(', ')
                      : 'None documented.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Recording Section with IoT Sensor Hub (Section 15) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider">
                  Patient Vitals & Biometric Telemetry
                </h4>
              </div>

              <button
                type="button"
                onClick={handleReadIoTSensors}
                disabled={isSimulatingSensor}
                className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition font-mono-tech"
              >
                <Cpu className={`w-3.5 h-3.5 ${isSimulatingSensor ? 'animate-spin' : 'text-cyan-400'}`} />
                <span>{isSimulatingSensor ? 'Reading Sensors...' : '⚡ Read from IoT Sensor Hub'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 block mb-1">Blood Pressure</span>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono-tech font-bold focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[9px] text-slate-500">mmHg (Normal: 120/80)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 block mb-1">Heart Rate</span>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className={`w-full bg-slate-900 border rounded px-2 py-1 text-xs font-mono-tech font-bold focus:outline-none ${
                    heartRate > 100 || heartRate < 55
                      ? 'border-rose-500 text-rose-300'
                      : 'border-slate-700 text-slate-100'
                  }`}
                />
                <span className="text-[9px] text-slate-500">BPM (60 - 100)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 block mb-1">Temperature</span>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className={`w-full bg-slate-900 border rounded px-2 py-1 text-xs font-mono-tech font-bold focus:outline-none ${
                    temp >= 38.0 ? 'border-rose-500 text-rose-300' : 'border-slate-700 text-slate-100'
                  }`}
                />
                <span className="text-[9px] text-slate-500">°C (Normal: 36.5-37.5)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 block mb-1">SpO2 (Pulse Ox)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className={`w-full bg-slate-900 border rounded px-2 py-1 text-xs font-mono-tech font-bold focus:outline-none ${
                    spo2 < 95 ? 'border-amber-500 text-amber-300' : 'border-slate-700 text-slate-100'
                  }`}
                />
                <span className="text-[9px] text-slate-500">% (Normal: 95-100%)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono-tech text-slate-400 block mb-1">Resp. Rate</span>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 font-mono-tech font-bold focus:outline-none"
                />
                <span className="text-[9px] text-slate-500">breaths/min (12-20)</span>
              </div>
            </div>
          </div>

          {/* Consultation Notes (Section 15) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider pb-2 border-b border-slate-800">
              Clinical Assessment & Diagnosis
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Chief Complaint</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Clinical Observations & Examination</label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Digital Prescription Builder (Section 16) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold font-tech uppercase text-slate-200 tracking-wider">
                  Digital Prescription Builder
                </h4>
              </div>
              <span className="text-[10px] font-mono-tech text-slate-400">
                Connected with Smart Vending & Pharmacy
              </span>
            </div>

            {/* Prescribed Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-mono-tech uppercase text-slate-400">
                  <tr>
                    <th className="p-2">Medicine Name & Strength</th>
                    <th className="p-2">Dosage</th>
                    <th className="p-2">Frequency</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Instructions</th>
                    <th className="p-2 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {prescribedItems.map((item, idx) => (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-slate-850/40">
                      <td className="p-2 font-semibold text-cyan-300">
                        {item.name} <span className="text-[11px] text-slate-400 font-mono-tech font-normal">({item.strength})</span>
                      </td>
                      <td className="p-2 font-mono-tech text-slate-300">{item.dosage}</td>
                      <td className="p-2 text-slate-300">{item.frequency}</td>
                      <td className="p-2 font-mono-tech text-slate-300">{item.duration}</td>
                      <td className="p-2 font-mono-tech font-bold text-slate-200">{item.quantity}</td>
                      <td className="p-2 text-slate-400 text-[11px]">{item.instructions}</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Medicine to Rx Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <select
                value={selectedMedToAdd}
                onChange={(e) => setSelectedMedToAdd(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.strength}) - Stock: {m.quantity}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddMedicineToRx}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Feedback Message */}
            {rxSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{rxSuccessMsg}</span>
              </div>
            )}

            {/* Transmit Action Buttons (Section 16) */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveAndSendRx('PHARMACY')}
                className="px-4 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Pharmacy Queue</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAndSendRx('VENDING')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-600/30 flex items-center gap-2 font-tech uppercase tracking-wider"
              >
                <span>Direct to Smart Vending VM-01</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Patient Modal in Doctor Consultation */}
      {isEditOpen && selectedPatient && (
        <EditPatientModal
          patient={selectedPatient}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </div>
  );
};
