import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Clock, Pill, FlaskConical, CheckCircle2, Plus, Trash2 
} from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patientEhrHistory, setPatientEhrHistory] = useState(null);

  // Consultation Form
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [instructions, setInstructions] = useState('Take medicines after meals with warm water.');

  // Prescription Items
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_name: 'Paracetamol 500mg', dosage: '1-1-1', duration: '5 days', frequency: 'After meals' },
    { medicine_name: 'Amoxicillin 500mg', dosage: '1-0-1', duration: '7 days', frequency: 'After meals' }
  ]);

  // Lab Tests Requested
  const [selectedLabTests, setSelectedLabTests] = useState(['Full Blood Count (FBC)']);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadTodayQueue();
  }, []);

  const loadTodayQueue = async () => {
    const res = await api.getAppointments();
    if (res.success) {
      setAppointments(res.appointments);
    }
  };

  const handleSelectAppointment = async (appt) => {
    setSelectedAppt(appt);
    setSymptoms(appt.notes || '');
    setDiagnosis('');
    setTreatmentNotes('');
    setSuccessMsg('');
    setErrorMsg('');

    const res = await api.getPatientHistory(appt.patient_id);
    if (res.success) {
      setPatientEhrHistory(res);
    }
  };

  const handleAddMedicineLine = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicine_name: '', dosage: '1-0-1', duration: '5 days', frequency: 'After meals' }
    ]);
  };

  const handleRemoveMedicineLine = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const toggleLabTest = (testName) => {
    if (selectedLabTests.includes(testName)) {
      setSelectedLabTests(selectedLabTests.filter(t => t !== testName));
    } else {
      setSelectedLabTests([...selectedLabTests, testName]);
    }
  };

  const handleSaveConsultation = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!selectedAppt || !diagnosis.trim()) {
      setErrorMsg('Please enter the diagnosis before saving consultation notes.');
      return;
    }

    setSaving(true);
    const res = await api.saveConsultation({
      appointment_id: selectedAppt.id,
      symptoms,
      diagnosis,
      treatment_notes: treatmentNotes,
      instructions,
      prescription_items: prescriptionItems.filter(p => p.medicine_name.trim() !== ''),
      lab_tests: selectedLabTests
    });

    setSaving(false);

    if (res.success) {
      setSuccessMsg('Consultation saved successfully! Appointment marked as completed.');
      loadTodayQueue();
    } else {
      setErrorMsg(res.message || 'Failed to save consultation.');
    }
  };

  const handleStatusChange = async (id, status) => {
    await api.updateAppointmentStatus(id, status);
    loadTodayQueue();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-left">
      
      {/* Doctor Portal Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Doctor Consultation Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">{user?.full_name}</h1>
          <p className="text-xs sm:text-sm text-slate-500">SLMC Certified Specialist • Consultation Room</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-mono text-xs text-slate-700 self-stretch sm:self-auto flex sm:flex-col justify-between sm:text-right">
          <div>Today: {new Date().toLocaleDateString('en-GB')}</div>
          <div className="text-teal-700 font-bold">Queue Size: {appointments.length} Patients</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: Today's Appointments Queue */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Patient Queue ({appointments.length})</span>
          </h3>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-sm text-slate-500 text-center">
              No appointments scheduled in your queue.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <div
                  key={appt.id}
                  onClick={() => handleSelectAppointment(appt)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAppt?.id === appt.id
                      ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-teal-700">{appt.date} • {appt.time_slot}</span>
                      <h4 className="font-bold text-base text-slate-900 mt-0.5">{appt.patient_name}</h4>
                      <p className="text-xs text-slate-500">{appt.gender} • {appt.blood_group} Blood</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                      appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      appt.status === 'in_consultation' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs gap-2">
                    <span className="text-slate-500 font-mono font-semibold">#{appt.appointment_no}</span>
                    <select
                      value={appt.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(appt.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="in_consultation">In Consultation</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Consultation Room & EHR Form */}
        <div className="lg:col-span-7 space-y-6">
          {selectedAppt ? (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <span className="text-[11px] uppercase font-mono text-teal-700 font-bold">Active Consultation Room</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">{selectedAppt.patient_name}</h2>
                  <p className="text-xs text-slate-500">Phone: {selectedAppt.patient_phone || 'N/A'}</p>
                </div>
                <span className="self-start px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full font-mono text-xs font-bold">
                  Appt #{selectedAppt.appointment_no}
                </span>
              </div>

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Patient History Preview */}
              {patientEhrHistory && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-700 uppercase tracking-wider">Previous Medical Diagnoses History</div>
                  {patientEhrHistory.records.length === 0 ? (
                    <div className="text-slate-500">First-time consultation. No prior history logged.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {patientEhrHistory.records.map((r, idx) => (
                        <div key={idx} className="text-slate-700">
                          • <strong className="text-slate-900">{r.date}:</strong> {r.diagnosis} ({r.doctor_name})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Consultation Logger */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Patient Symptoms &amp; Complaints</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. High fever 38.8 C, persistent headache, sore throat..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Doctor Diagnosis / Clinical Impression *</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Upper Respiratory Viral Infection"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Treatment Notes &amp; Advice</label>
                  <textarea
                    rows={2}
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    placeholder="e.g. Prescribed oral antipyretics. Advised complete bed rest for 3 days..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Digital Prescription Builder */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    <span>Digital Prescription Builder (Rx)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMedicineLine}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptionItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-1">Medicine</label>
                        <input
                          type="text"
                          placeholder="Medicine Name"
                          value={item.medicine_name}
                          onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-1">Dosage</label>
                        <input
                          type="text"
                          placeholder="1-0-1"
                          value={item.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-1">Frequency</label>
                        <input
                          type="text"
                          placeholder="After meals"
                          value={item.frequency}
                          onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase sm:hidden block mb-1">Duration</label>
                        <input
                          type="text"
                          placeholder="5 days"
                          value={item.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end sm:justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineLine(idx)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Remove medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">Prescription Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take medicines after meals with warm water."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Lab Request Builder */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  <span>Request Laboratory Diagnostics</span>
                </h4>

                <div className="flex flex-wrap gap-2 text-xs">
                  {['Full Blood Count (FBC)', 'Fasting Blood Sugar (FBS)', 'Lipid Profile', 'Liver Function Test', 'ECG Review'].map((test, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => toggleLabTest(test)}
                      className={`px-3.5 py-2 rounded-xl border font-bold transition-all ${
                        selectedLabTests.includes(test)
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      {test} {selectedLabTests.includes(test) ? '✓' : '+'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Consultation Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  disabled={saving}
                  onClick={handleSaveConsultation}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{saving ? 'Saving Records...' : 'Save Consultation & Complete'}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
              Select a patient from the queue to start the consultation and fill out their electronic health record.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
