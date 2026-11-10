import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Users, Stethoscope, Calendar, DollarSign, TrendingUp, 
  Plus, CheckCircle2, X 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  // New Doctor Form State
  const [docForm, setDocForm] = useState({
    email: '',
    password: 'password123',
    full_name: '',
    phone: '+94 77 ',
    nic_passport: '',
    department_id: 1,
    specialization: 'General Physician',
    slmc_reg_no: '',
    consultation_fee: 2500,
    room_no: 'Room 105',
    bio: ''
  });

  const [addDocSuccess, setAddDocSuccess] = useState('');
  const [addDocError, setAddDocError] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadStats();
    api.getDepartments().then(res => res.success && setDepartments(res.departments));
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const res = await api.getAdminStats();
    if (res.success) {
      setStatsData(res);
    }
    setLoading(false);
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setAddDocError('');
    const res = await api.createDoctor(docForm);
    if (res.success) {
      setAddDocSuccess(`Doctor ${docForm.full_name} created successfully!`);
      setShowAddDoctor(false);
      setDocForm({
        email: '',
        password: 'password123',
        full_name: '',
        phone: '+94 77 ',
        nic_passport: '',
        department_id: 1,
        specialization: 'General Physician',
        slmc_reg_no: '',
        consultation_fee: 2500,
        room_no: 'Room 105',
        bio: ''
      });
      loadStats();
    } else {
      setAddDocError(res.message || 'Failed to create doctor profile.');
    }
  };

  const COLORS = ['#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-left">
      
      {/* Admin Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Executive Administrative Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-2">
            MediCare Lanka Analytics Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">System Administrator: {user?.full_name}</p>
        </div>
        <button
          onClick={() => { setAddDocError(''); setShowAddDoctor(true); }}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {addDocSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{addDocSuccess}</span>
        </div>
      )}

      {loading || !statsData ? (
        <div className="text-center py-16 text-slate-500 font-medium">Loading admin KPIs and analytics...</div>
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs uppercase font-bold tracking-wider">Total Patients</span>
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-heading">
                {statsData.stats.total_patients}
              </div>
              <div className="text-xs text-emerald-700 font-semibold">Active registered profiles</div>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs uppercase font-bold tracking-wider">Active Doctors</span>
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-heading">
                {statsData.stats.total_doctors}
              </div>
              <div className="text-xs text-slate-500 font-medium">Across 5 Clinical Departments</div>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs uppercase font-bold tracking-wider">Today&apos;s Appointments</span>
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-heading">
                {statsData.stats.today_appointments}
              </div>
              <div className="text-xs text-teal-700 font-semibold">Live Schedule</div>
            </div>

            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs uppercase font-bold tracking-wider">Total Revenue (LKR)</span>
                <DollarSign className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-3xl font-extrabold text-teal-700 font-heading">
                Rs. {statsData.stats.total_revenue_lkr?.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-700 font-semibold">Settled Payments</div>
            </div>

          </div>

          {/* Recharts Graphical Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Revenue Trend Area Chart */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <span>Monthly Clinic Revenue Trend (LKR)</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">2026 Financial Year</span>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData.revenueTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Volume Pie Chart */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900">Department Volume</h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData.deptBreakdown}
                      dataKey="appointment_count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label
                    >
                      {statsData.deptBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {statsData.deptBreakdown.map((dept, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      <span>{dept.name}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">{dept.appointment_count} appts</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Registrations Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900">Recently Registered Patients</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[540px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] font-mono">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statsData.recentPatients.map(pat => (
                    <tr key={pat.id} className="hover:bg-slate-50 text-slate-700">
                      <td className="py-3 px-4 font-bold text-slate-900">{pat.full_name}</td>
                      <td className="py-3 px-4 text-slate-600">{pat.email}</td>
                      <td className="py-3 px-4 text-teal-700 font-mono">{pat.phone}</td>
                      <td className="py-3 px-4 font-bold">{pat.blood_group}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{new Date(pat.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowAddDoctor(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-xl text-slate-900 pr-8">Create Doctor Profile</h3>

            {addDocError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {addDocError}
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={docForm.full_name}
                    onChange={(e) => setDocForm({ ...docForm, full_name: e.target.value })}
                    placeholder="e.g. Dr. Priyantha Dissanayake"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={docForm.email}
                    onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                    placeholder="e.g. doctor.priyantha@medicare.lk"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Department *</label>
                  <select
                    value={docForm.department_id}
                    onChange={(e) => setDocForm({ ...docForm, department_id: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">SLMC Reg No *</label>
                  <input
                    type="text"
                    required
                    value={docForm.slmc_reg_no}
                    onChange={(e) => setDocForm({ ...docForm, slmc_reg_no: e.target.value })}
                    placeholder="SLMC-99881"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Specialization</label>
                  <input
                    type="text"
                    value={docForm.specialization}
                    onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Consultation Fee (LKR)</label>
                  <input
                    type="number"
                    value={docForm.consultation_fee}
                    onChange={(e) => setDocForm({ ...docForm, consultation_fee: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Room No</label>
                  <input
                    type="text"
                    value={docForm.room_no}
                    onChange={(e) => setDocForm({ ...docForm, room_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
