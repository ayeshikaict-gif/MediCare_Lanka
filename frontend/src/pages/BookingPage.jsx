import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export const BookingPage = ({ preSelectedDoctor, onBookingCompleted, openAuthModal }) => {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Form State
  const [selectedDeptId, setSelectedDeptId] = useState(preSelectedDoctor?.department_id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(preSelectedDoctor?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getDepartments().then(res => res.success && setDepartments(res.departments));
  }, []);

  useEffect(() => {
    if (preSelectedDoctor) {
      setSelectedDeptId(preSelectedDoctor.department_id || '');
      setSelectedDoctorId(preSelectedDoctor.id || '');
      setStep(2);
    }
  }, [preSelectedDoctor]);

  useEffect(() => {
    if (selectedDeptId) {
      api.getDoctors(selectedDeptId).then(res => res.success && setDoctors(res.doctors));
    }
  }, [selectedDeptId]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      fetchSlots();
    }
  }, [selectedDoctorId, selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    const res = await api.getDoctorSlots(selectedDoctorId, selectedDate);
    if (res.success) {
      setSlots(res.slots);
    }
    setLoadingSlots(false);
  };

  const handleBook = async () => {
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Please sign in or register a patient account to confirm your appointment.');
      return;
    }

    if (!selectedDoctorId || !selectedDate || !selectedTimeSlot) {
      setErrorMsg('Please complete doctor, date, and time slot selections.');
      return;
    }

    setSubmitting(true);
    const res = await api.bookAppointment({
      doctor_id: selectedDoctorId,
      service_id: 1,
      date: selectedDate,
      time_slot: selectedTimeSlot,
      notes
    });

    setSubmitting(false);

    if (res.success) {
      setBookingResult(res.appointment);
      setStep(4);
    } else {
      setErrorMsg(res.message || 'Booking failed. Slot may have been taken.');
    }
  };

  const selectedDoctorObj = doctors.find(d => d.id === parseInt(selectedDoctorId, 10)) || preSelectedDoctor;

  const steps = [
    { num: 1, label: 'Specialist' },
    { num: 2, label: 'Date & Slot' },
    { num: 3, label: 'Review' },
    { num: 4, label: 'Confirmed' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6 text-left">
      
      {/* Responsive Stepper Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-4 gap-2 text-center sm:text-left">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col sm:flex-row items-center sm:space-x-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step >= s.num
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {s.num}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-bold mt-1 sm:mt-0 ${
                  step >= s.num ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-500 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {!user && openAuthModal && (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}

      {/* STEP 1: Department & Doctor Selection */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Step 1: Select Department &amp; Specialist</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Choose the clinical department and your preferred SLMC doctor.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Clinical Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedDoctorId('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="">-- Select Department --</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {selectedDeptId && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Specialist Doctor</label>
                {doctors.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    No specialists currently assigned to this department.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {doctors.map(doc => (
                      <button
                        type="button"
                        key={doc.id}
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          parseInt(selectedDoctorId, 10) === doc.id
                            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-base text-slate-900">{doc.full_name}</div>
                        <div className="text-xs text-teal-700 font-semibold mt-0.5">{doc.specialization}</div>
                        <div className="text-xs text-slate-500 mt-1.5 font-medium">
                          Fee: Rs. {doc.consultation_fee?.toLocaleString()} • {doc.room_no}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              disabled={!selectedDoctorId}
              onClick={() => setStep(2)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <span>Next: Select Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Available Time Slot */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Step 2: Choose Date &amp; Time Slot</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Live availability for <strong className="text-slate-800">{selectedDoctorObj?.full_name}</strong>.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Consultation Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot('');
                }}
                className="w-full sm:max-w-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Available Time Slots</label>
              {loadingSlots ? (
                <div className="text-xs text-slate-500 py-8 text-center">Checking slot availability...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {slots.map((slot, idx) => (
                    <button
                      type="button"
                      key={idx}
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className={`p-3 rounded-xl border text-center font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        selectedTimeSlot === slot.time
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                          : slot.available
                          ? 'bg-slate-50 border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50'
                          : 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{slot.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={!selectedTimeSlot}
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <span>Next: Review &amp; Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Patient Details */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Step 3: Review Appointment Summary</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Verify your booking details before confirming.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 uppercase font-bold text-[11px] block">Specialist</span>
                <span className="font-bold text-slate-900 text-base">{selectedDoctorObj?.full_name}</span>
                <span className="text-teal-700 block font-semibold text-xs">{selectedDoctorObj?.specialization}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-bold text-[11px] block">Date &amp; Time</span>
                <span className="font-bold text-slate-900 text-base">{selectedDate}</span>
                <span className="text-teal-700 block font-mono font-bold text-xs">{selectedTimeSlot}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-bold text-[11px] block">Patient Name</span>
                <span className="font-bold text-slate-900 text-base">{user ? user.full_name : 'Guest (Sign in required)'}</span>
              </div>

              <div>
                <span className="text-slate-500 uppercase font-bold text-[11px] block">Consultation Fee</span>
                <span className="font-bold text-emerald-700 text-base">Rs. {selectedDoctorObj?.consultation_fee?.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Reason for Visit / Symptoms (Optional)</label>
              <textarea
                rows={3}
                placeholder="Briefly describe your symptoms (e.g. fever for 2 days, back pain)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-between gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              disabled={submitting}
              onClick={handleBook}
              className="px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-teal-600/20"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{submitting ? 'Confirming Token...' : 'Confirm Appointment Booking'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success Screen */}
      {step === 4 && bookingResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase">
              Appointment Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Token #{bookingResult.appointment_no}</h2>
            <p className="text-sm text-slate-600">Your consultation slot has been reserved in our system.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 max-w-md mx-auto border border-slate-200 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Date &amp; Time:</span>
              <span className="font-bold text-slate-900">{bookingResult.date} at {bookingResult.time_slot}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-bold text-teal-700">{selectedDoctorObj?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-700 uppercase">Confirmed</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onBookingCompleted && onBookingCompleted()}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-sm"
            >
              Go to Patient Dashboard →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
