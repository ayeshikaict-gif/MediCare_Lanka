import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PDFExporter } from '../components/PDFExporter';
import { 
  UserPlus, Calendar, CreditCard, Clock, CheckCircle2, 
  FlaskConical, ShieldCheck, AlertCircle
} from 'lucide-react';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');

  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labTests, setLabTests] = useState([]);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    email: '',
    password: 'password123',
    full_name: '',
    phone: '+94 77 ',
    nic_passport: '',
    dob: '1995-01-01',
    gender: 'Male',
    blood_group: 'O+',
    address: 'Colombo, Sri Lanka'
  });
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Walk-In Booking State
  const [walkInBooking, setWalkInBooking] = useState({
    patient_id_override: '',
    doctor_id: '',
    date: new Date().toISOString().split('T')[0],
    time_slot: '',
    notes: ''
  });
  const [walkInSlots, setWalkInSlots] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Lab Test Update State
  const [editingLabTest, setEditingLabTest] = useState(null);
  const [labStatus, setLabStatus] = useState('completed');
  const [labNotes, setLabNotes] = useState('');
  const [labSuccessMsg, setLabSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (walkInBooking.doctor_id && walkInBooking.date) {
      api.getDoctorSlots(walkInBooking.doctor_id, walkInBooking.date).then(res => {
        if (res.success) setWalkInSlots(res.slots);
      });
    } else {
      setWalkInSlots([]);
    }
  }, [walkInBooking.doctor_id, walkInBooking.date]);

  const loadData = async () => {
    const [apptRes, invRes, patRes, docRes, labRes] = await Promise.all([
      api.getAppointments(),
      api.getInvoices(),
      api.getPatients(),
      api.getDoctors(),
      api.getLabTests()
    ]);
    if (apptRes.success) setAppointments(apptRes.appointments);
    if (invRes.success) setInvoices(invRes.invoices);
    if (patRes.success) setPatients(patRes.patients);
    if (docRes.success) setDoctors(docRes.doctors);
    if (labRes.success) setLabTests(labRes.labTests);
  };

  const handleStatusChange = async (id, status) => {
    await api.updateAppointmentStatus(id, status);
    loadData();
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegSuccess('');
    setRegError('');
    const res = await api.registerPatient(regForm);
    if (res.success) {
      setRegSuccess(`Patient ${regForm.full_name} registered successfully!`);
      setRegForm({
        email: '',
        password: 'password123',
        full_name: '',
        phone: '+94 77 ',
        nic_passport: '',
        dob: '1995-01-01',
        gender: 'Male',
        blood_group: 'O+',
        address: 'Colombo, Sri Lanka'
      });
      loadData();
    } else {
      setRegError(res.message || 'Failed to register patient.');
    }
  };

  const handleWalkInBooking = async (e) => {
    e.preventDefault();
    setBookingSuccess('');
    setBookingError('');
    if (!walkInBooking.patient_id_override || !walkInBooking.doctor_id || !walkInBooking.time_slot) {
      setBookingError('Please select a patient, specialist doctor, and available time slot.');
      return;
    }

    const res = await api.bookAppointment(walkInBooking);
    if (res.success) {
      setBookingSuccess(`Appointment confirmed! Token #${res.appointment.appointment_no}`);
      setWalkInBooking({
        ...walkInBooking,
        time_slot: '',
        notes: ''
      });
      loadData();
    } else {
      setBookingError(res.message || 'Failed to create walk-in appointment.');
    }
  };

  const handleUpdateLabTest = async (e) => {
    e.preventDefault();
    if (!editingLabTest) return;
    const res = await api.updateLabTest(editingLabTest.id, labStatus, labNotes);
    if (res.success) {
      setLabSuccessMsg(`Lab test "${editingLabTest.test_name}" updated to ${labStatus}.`);
      setEditingLabTest(null);
      setLabNotes('');
      loadData();
    }
  };

  const handleCashPayment = async (inv) => {
    const res = await api.payInvoice(inv.id, 'cash', inv.total_amount);
    if (res.success) {
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Front Desk &amp; Receptionist Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">
            {user?.profile?.branch_name || 'Colombo Central'} Reception Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Staff ID: {user?.profile?.staff_id || 'REC-CLM-01'} • {user?.full_name || 'Reception Staff'}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-full text-emerald-700 text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Shift</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto no-scrollbar pb-px text-xs sm:text-sm font-bold">
        {[
          { id: 'checkin', icon: Clock, label: `Check-In (${appointments.length})` },
          { id: 'register', icon: UserPlus, label: 'Register Patient' },
          { id: 'booking', icon: Calendar, label: 'Walk-In Booking' },
          { id: 'labs', icon: FlaskConical, label: `Lab Reports (${labTests.length})` },
          { id: 'billing', icon: CreditCard, label: `Billing (${invoices.length})` },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-t-xl transition-all border-b-2 flex items-center space-x-2 shrink-0 ${
                active
                  ? 'border-amber-600 text-amber-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Check-In Queue */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map(appt => (
            <div key={appt.id} className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-700">Token #{appt.appointment_no}</span>
                  <h4 className="font-bold text-base text-slate-900">{appt.patient_name}</h4>
                  <p className="text-xs text-slate-500">{appt.patient_phone || 'N/A'}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                  appt.status === 'checked_in' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  appt.status === 'completed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                  appt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {appt.status}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-mono bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-0.5">
                <div>Doctor: {appt.doctor_name} ({appt.room_no})</div>
                <div>Slot: {appt.date} • {appt.time_slot}</div>
              </div>

              {appt.status === 'confirmed' && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleStatusChange(appt.id, 'checked_in')}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check-In Patient</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Walk-In Registration Form */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-heading font-bold text-xl text-slate-900">Register Walk-In Patient</h3>

          {regSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{regSuccess}</span>
            </div>
          )}

          {regError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regForm.full_name}
                  onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                  placeholder="e.g. Sahan Wickramasinghe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="e.g. sahan@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Phone Number (+94)</label>
                <input
                  type="text"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">NIC / Passport Number</label>
                <input
                  type="text"
                  value={regForm.nic_passport}
                  onChange={(e) => setRegForm({ ...regForm, nic_passport: e.target.value })}
                  placeholder="e.g. 199384930291"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Gender</label>
                <select
                  value={regForm.gender}
                  onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Blood Group</label>
                <select
                  value={regForm.blood_group}
                  onChange={(e) => setRegForm({ ...regForm, blood_group: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm"
              >
                Register Walk-In Patient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Walk-In Appointment Booking */}
      {activeTab === 'booking' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-heading font-bold text-xl text-slate-900">Book Appointment for Patient</h3>

          {bookingSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          {bookingError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleWalkInBooking} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Select Patient *</label>
                <select
                  required
                  value={walkInBooking.patient_id_override}
                  onChange={(e) => setWalkInBooking({ ...walkInBooking, patient_id_override: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.nic_passport || p.phone || p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Select Specialist *</label>
                <select
                  required
                  value={walkInBooking.doctor_id}
                  onChange={(e) => setWalkInBooking({ ...walkInBooking, doctor_id: e.target.value, time_slot: '' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Consultation Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={walkInBooking.date}
                  onChange={(e) => setWalkInBooking({ ...walkInBooking, date: e.target.value, time_slot: '' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Available Time Slot *</label>
                <select
                  required
                  value={walkInBooking.time_slot}
                  onChange={(e) => setWalkInBooking({ ...walkInBooking, time_slot: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                >
                  <option value="">-- Choose Slot --</option>
                  {walkInSlots.filter(s => s.available).map((s, idx) => (
                    <option key={idx} value={s.time}>{s.time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Visit Notes</label>
              <input
                type="text"
                value={walkInBooking.notes}
                onChange={(e) => setWalkInBooking({ ...walkInBooking, notes: e.target.value })}
                placeholder="Reason for visit..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm"
              >
                Confirm Walk-In Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Lab Reports Management */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {labSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{labSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labTests.map(test => (
              <div key={test.id} className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-mono text-xs text-amber-700 font-bold">Ref #{test.appointment_no}</span>
                    <h4 className="font-bold text-slate-900 text-base">{test.test_name}</h4>
                    <p className="text-xs text-slate-500">Patient: {test.patient_name} • Ordered by {test.doctor_name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                    test.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    test.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {test.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700">
                  {test.result_notes || 'Pending laboratory technician result entry.'}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingLabTest(test);
                      setLabStatus(test.status === 'requested' ? 'completed' : test.status);
                      setLabNotes(test.result_notes || '');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs"
                  >
                    Update Status / Enter Result
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingLabTest && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-200 space-y-4 shadow-2xl">
                <h3 className="font-heading font-bold text-xl text-slate-900">Update Lab Report</h3>
                <p className="text-xs text-slate-500">{editingLabTest.test_name} • Patient: {editingLabTest.patient_name}</p>

                <form onSubmit={handleUpdateLabTest} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Test Status</label>
                    <select
                      value={labStatus}
                      onChange={(e) => setLabStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                    >
                      <option value="requested">Requested</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Laboratory Result Findings</label>
                    <textarea
                      rows={3}
                      value={labNotes}
                      onChange={(e) => setLabNotes(e.target.value)}
                      placeholder="Enter test values and findings..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingLabTest(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                    >
                      Save Lab Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Counter Billing */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map(inv => (
            <div key={inv.id} className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono text-amber-700 font-bold text-xs">{inv.invoice_no}</span>
                  <h4 className="font-bold text-slate-900 text-base">{inv.patient_name}</h4>
                  <p className="text-xs text-slate-500">Doctor: {inv.doctor_name}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                  inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {inv.status}
                </span>
              </div>

              <div className="text-xs sm:text-sm font-mono text-slate-900 font-bold flex justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span>Total Amount:</span>
                <span className="text-emerald-700">Rs. {inv.total_amount?.toLocaleString()}</span>
              </div>

              <div className="flex justify-end">
                {inv.status === 'unpaid' ? (
                  <button
                    onClick={() => handleCashPayment(inv)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                  >
                    Collect Cash &amp; Issue Receipt
                  </button>
                ) : (
                  <PDFExporter type="invoice" data={inv} title="Print Tax Receipt" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
