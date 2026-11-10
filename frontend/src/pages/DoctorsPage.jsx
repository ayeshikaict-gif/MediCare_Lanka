import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Star, Clock, Calendar, X } from 'lucide-react';

export const DoctorsPage = ({ onSelectDoctorToBook }) => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [search, selectedDept]);

  const fetchData = async () => {
    setLoading(true);
    const [deptRes, docRes] = await Promise.all([
      api.getDepartments(),
      api.getDoctors(selectedDept, search)
    ]);
    if (deptRes.success) setDepartments(deptRes.departments);
    if (docRes.success) setDoctors(docRes.doctors);
    setLoading(false);
  };

  const handleOpenSlots = async (doc) => {
    setSelectedDoctor(doc);
    const res = await api.getDoctorSlots(doc.id, selectedDate);
    if (res.success) setSlots(res.slots);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    if (selectedDoctor) {
      const res = await api.getDoctorSlots(selectedDoctor.id, date);
      if (res.success) setSlots(res.slots);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest font-bold text-teal-600">Medical Directory</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Find SLMC Registered Specialists
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Search doctors by specialization, check live consultation slot availability, and book appointments instantly.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search doctor by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full sm:w-64">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-medium">Loading specialists directory...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 text-slate-600 bg-white rounded-2xl border border-slate-200 shadow-sm">
          No medical specialists found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <div key={doc.id} className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                    {doc.full_name.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-700 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{Number(doc.rating || 4.8).toFixed(1)} ({doc.review_count || 0})</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">{doc.full_name}</h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-700">{doc.specialization}</p>
                  <p className="text-xs text-slate-500 mt-1">{doc.department_name} • {doc.room_no}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{doc.slmc_reg_no}</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {doc.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Consultation Fee</span>
                  <span className="font-bold text-slate-900 text-base">Rs. {doc.consultation_fee?.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleOpenSlots(doc)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>View Slots</span>
                  </button>

                  <button
                    onClick={() => onSelectDoctorToBook(doc)}
                    className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slots Availability Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-slate-200 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <h3 className="font-heading font-bold text-xl text-slate-900">{selectedDoctor.full_name}</h3>
              <p className="text-xs sm:text-sm text-teal-700 font-semibold">{selectedDoctor.specialization} • {selectedDoctor.department_name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Select Consultation Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Available Time Slots</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {slots.map((slot, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                      slot.available
                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                        : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const doc = selectedDoctor;
                  setSelectedDoctor(null);
                  onSelectDoctorToBook(doc);
                }}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm"
              >
                Proceed to Book →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
