import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PDFExporter } from '../components/PDFExporter';
import { 
  Calendar, FileText, Pill, FlaskConical, CreditCard, 
  CheckCircle2, Star 
} from 'lucide-react';

export const PatientDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  
  const [appointments, setAppointments] = useState([]);
  const [ehrData, setEhrData] = useState(null);
  const [labTests, setLabTests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Rating Modal
  const [reviewDoctor, setReviewDoctor] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    if (user && user.patient_id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    const [apptRes, ehrRes, labRes, invRes] = await Promise.all([
      api.getAppointments(),
      api.getPatientHistory(user.patient_id),
      api.getLabTests(),
      api.getInvoices()
    ]);

    if (apptRes.success) setAppointments(apptRes.appointments);
    if (ehrRes.success) setEhrData(ehrRes);
    if (labRes.success) setLabTests(labRes.labTests);
    if (invRes.success) setInvoices(invRes.invoices);
  };

  const handlePayInvoice = async () => {
    if (!payingInvoice) return;
    const res = await api.payInvoice(payingInvoice.id, paymentMethod, payingInvoice.total_amount);
    if (res.success) {
      setPaySuccessMsg(`Payment of LKR ${payingInvoice.total_amount.toLocaleString()} successful!`);
      setPayingInvoice(null);
      loadDashboardData();
    }
  };

  const handleCancelAppointment = async (apptId) => {
    const res = await api.updateAppointmentStatus(apptId, 'cancelled');
    if (res.success) {
      loadDashboardData();
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewDoctor) return;
    const res = await api.submitReview(reviewDoctor.doctor_id, rating, reviewComment);
    if (res.success) {
      setReviewSuccessMsg(`Thank you! Your ${rating}-star review for ${reviewDoctor.doctor_name} has been posted.`);
      setReviewDoctor(null);
      setRating(5);
      setReviewComment('');
    }
  };

  const upcomingAppt = appointments.find(a => a.status === 'confirmed' || a.status === 'checked_in');
  const unpaidCount = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-left">
      
      {/* Patient Greeting Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Patient Portal
            </span>
            <span className="text-xs text-slate-500 font-mono">NIC: {user?.nic_passport || 'N/A'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your appointments, clinical medical records, digital prescriptions, and lab results.
          </p>
        </div>

        <button
          onClick={() => onNavigate('book')}
          className="w-full md:w-auto px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all shrink-0 text-center"
        >
          + Book New Appointment
        </button>
      </div>

      {/* Quick Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Appointments</div>
          <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1">{appointments.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Medical Records</div>
          <div className="text-2xl font-extrabold text-teal-700 font-heading mt-1">{ehrData?.records?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Lab Reports</div>
          <div className="text-2xl font-extrabold text-slate-900 font-heading mt-1">{labTests.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Unpaid Bills</div>
          <div className={`text-2xl font-extrabold font-heading mt-1 ${unpaidCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {unpaidCount}
          </div>
        </div>
      </div>

      {/* Upcoming Appointment Spotlight Banner */}
      {upcomingAppt && (
        <div className="bg-teal-50/70 rounded-2xl p-5 border border-teal-200 border-l-4 border-l-teal-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider">Upcoming Consultation</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
              {upcomingAppt.doctor_name} <span className="text-sm font-medium text-slate-600">({upcomingAppt.specialization})</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-mono">
              {upcomingAppt.date} • {upcomingAppt.time_slot} • {upcomingAppt.room_no}
            </p>
          </div>
          <span className="self-start sm:self-center px-3.5 py-1.5 rounded-full bg-white border border-teal-200 text-teal-800 text-xs font-bold font-mono uppercase shadow-xs">
            Token #{upcomingAppt.appointment_no}
          </span>
        </div>
      )}

      {/* Responsive Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto no-scrollbar pb-px text-xs sm:text-sm font-bold">
        {[
          { id: 'appointments', icon: Calendar, label: `Appointments (${appointments.length})` },
          { id: 'records', icon: FileText, label: `Records & Rx (${ehrData?.records?.length || 0})` },
          { id: 'labs', icon: FlaskConical, label: `Lab Reports (${labTests.length})` },
          { id: 'billing', icon: CreditCard, label: `Invoices (${invoices.length})` },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-t-xl transition-all border-b-2 flex items-center space-x-2 shrink-0 ${
                active
                  ? 'border-teal-600 text-teal-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {reviewSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reviewSuccessMsg}</span>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              No appointments found. Click &quot;Book New Appointment&quot; to schedule a consultation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map(appt => (
                <div key={appt.id} className="glass-card rounded-2xl p-5 space-y-3 text-left">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-bold text-base text-slate-900">{appt.doctor_name}</div>
                      <div className="text-xs text-teal-700 font-semibold">{appt.specialization} • {appt.department_name}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                      appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      appt.status === 'confirmed' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      appt.status === 'checked_in' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap justify-between gap-2">
                    <span>{appt.date} ({appt.time_slot})</span>
                    <span className="font-bold text-slate-900">#{appt.appointment_no}</span>
                  </div>

                  {appt.status === 'confirmed' && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  )}

                  {appt.status === 'completed' && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => setReviewDoctor(appt)}
                        className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>Leave Review for Doctor</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Medical Records & Prescriptions */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {!ehrData || ehrData.records.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              No medical records recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {ehrData.records.map(rec => (
                <div key={rec.id} className="glass-card rounded-3xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[11px] text-slate-400 font-mono uppercase block font-bold">Consultation Record</span>
                      <h3 className="font-bold text-slate-900 text-lg">{rec.diagnosis}</h3>
                      <p className="text-xs sm:text-sm text-teal-700 font-medium">Attending Specialist: {rec.doctor_name} ({rec.specialization})</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg self-start">{rec.date}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[11px] block mb-1">Symptoms Reported</span>
                      <p className="text-slate-800">{rec.symptoms}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[11px] block mb-1">Treatment &amp; Doctor Notes</span>
                      <p className="text-slate-800">{rec.treatment_notes}</p>
                    </div>
                  </div>

                  {/* Digital Prescription Box */}
                  {rec.prescription && (
                    <div className="bg-teal-50/50 p-4 sm:p-5 rounded-2xl border border-teal-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-teal-600" />
                          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">Digital Prescription (Rx)</span>
                        </div>
                        <PDFExporter
                          type="prescription"
                          data={{
                            ...rec,
                            ...rec.prescription,
                            patient_name: ehrData?.patient?.full_name || user?.full_name,
                            nic_passport: ehrData?.patient?.nic_passport || user?.nic_passport
                          }}
                          title="Print / Download Rx Slip"
                        />
                      </div>

                      <div className="space-y-2">
                        {rec.prescription.items.map((item, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-xs sm:text-sm">
                            <span className="font-bold text-slate-900">{item.medicine_name}</span>
                            <span className="text-teal-700 font-mono text-xs">{item.dosage} • {item.frequency} ({item.duration})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Lab Test Reports */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {labTests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              No laboratory tests ordered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labTests.map(test => (
                <div key={test.id} className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{test.test_name}</h4>
                      <p className="text-xs text-slate-500">Order Ref: {test.appointment_no} • Priority: {test.priority}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                      test.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {test.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm">
                    <span className="text-slate-500 font-bold text-[11px] uppercase block mb-1">Laboratory Findings &amp; Result Notes</span>
                    <p className="text-slate-800">{test.result_notes || 'Lab test sample is currently under analysis.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Invoices & Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {paySuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{paySuccessMsg}</span>
            </div>
          )}

          {invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
              No invoices available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invoices.map(inv => (
                <div key={inv.id} className="glass-card rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-teal-700 font-bold text-xs">{inv.invoice_no}</span>
                      <h4 className="font-bold text-slate-900 text-base">{inv.doctor_name} Consultation</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase shrink-0 ${
                      inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 border-t border-b border-slate-100 py-3 font-mono">
                    <div className="flex justify-between">
                      <span>Doctor Fee:</span>
                      <span>Rs. {inv.consultation_fee?.toLocaleString()}</span>
                    </div>
                    {inv.lab_fee > 0 && (
                      <div className="flex justify-between">
                        <span>Lab Charges:</span>
                        <span>Rs. {inv.lab_fee?.toLocaleString()}</span>
                      </div>
                    )}
                    {inv.medicine_fee > 0 && (
                      <div className="flex justify-between">
                        <span>Pharmacy Medicines:</span>
                        <span>Rs. {inv.medicine_fee?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 pt-1">
                      <span>Total Amount:</span>
                      <span className="text-teal-700">Rs. {inv.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {inv.status === 'unpaid' ? (
                      <button
                        onClick={() => setPayingInvoice(inv)}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
                      >
                        Pay Online Now
                      </button>
                    ) : (
                      <PDFExporter type="invoice" data={inv} title="Download Receipt PDF" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay Invoice Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-200 space-y-5 shadow-2xl">
            <h3 className="font-heading font-bold text-xl text-slate-900">Settle Medical Invoice</h3>
            
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Invoice:</span>
                <span className="text-teal-700 font-bold">{payingInvoice.invoice_no}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm">
                <span>Total Amount Due:</span>
                <span className="text-emerald-700">Rs. {payingInvoice.total_amount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500"
              >
                <option value="card">Visa / Mastercard / AMEX (Credit/Debit)</option>
                <option value="ezcash">eZ Cash / Genie / Frimi (Mobile Wallet)</option>
                <option value="cash">Pay Cash at Reception Counter</option>
              </select>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5">
              <button
                onClick={() => setPayingInvoice(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePayInvoice}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Review Modal */}
      {reviewDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-200 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold text-amber-600">Rate Your Experience</span>
              <h3 className="font-heading font-bold text-xl text-slate-900">Review {reviewDoctor.doctor_name}</h3>
              <p className="text-xs text-slate-500">{reviewDoctor.specialization} • Appt #{reviewDoctor.appointment_no}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Star Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-amber-700 font-bold ml-2">{rating} / 5</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your consultation experience..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewDoctor(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
