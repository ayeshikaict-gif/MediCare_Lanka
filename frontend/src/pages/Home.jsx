import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QuickDemoBar } from '../components/QuickDemoBar';
import { api } from '../services/api';
import { 
  HeartPulse, Calendar, Stethoscope, Clock, MapPin, 
  ArrowRight, Star, Sparkles, CheckCircle2, ChevronRight, ShieldCheck 
} from 'lucide-react';

export const Home = ({ onNavigate, onSelectDoctorToBook }) => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.getDepartments().then(data => data.success && setDepartments(data.departments));
    api.getDoctors().then(data => data.success && setDoctors(data.doctors.slice(0, 3)));
  }, []);

  return (
    <div className="space-y-14 sm:space-y-20 pb-12">
      
      {/* 1. Hero Banner */}
      <section className="pt-8 sm:pt-12 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Next-Gen Private Healthcare in Sri Lanka</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.12] font-heading">
              Healthcare Designed for{' '}
              <span className="text-teal-600">
                Your Health &amp; Peace of Mind
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Book consultations with SLMC registered specialists, access your electronic health records, download digital prescriptions, and manage lab test results seamlessly across Colombo, Kandy, and Galle.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={() => onNavigate('book')}
                className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-teal-600/20 flex items-center justify-center space-x-2.5 transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span>{t('bookAppointment')} Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('doctors')}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>Find Specialists</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">30+</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">SLMC Specialists</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 font-heading">15k+</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">Happy Patients</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-heading">99.8%</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Right Quick Specialist Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 space-y-5 border border-slate-200 shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">Today&apos;s Active Specialists</h3>
                    <p className="text-xs text-slate-500">Live Consultation Schedule</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  OPEN
                </span>
              </div>

              <div className="space-y-3 text-left">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoctorToBook ? onSelectDoctorToBook(doc) : onNavigate('book')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">{doc.full_name}</div>
                      <div className="text-xs text-slate-500 truncate">{doc.specialization} • {doc.room_no}</div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-teal-700 text-xs font-bold shrink-0 shadow-xs">
                      Rs. {doc.consultation_fee?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onNavigate('book')}
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Launch Appointment Wizard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Clean Instant Role Demo Switcher */}
        <QuickDemoBar onLoginSuccess={() => onNavigate('dashboard')} />
      </section>

      {/* 2. Medical Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-teal-600">Specialized Care</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Our Clinical Departments</h2>
          <p className="text-sm text-slate-600">Equipped with modern diagnostic infrastructure and experienced SLMC specialists.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {departments.map(dept => (
            <div key={dept.id} className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 text-left flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">{dept.name}</h3>
                  <span className="text-xs text-teal-700 font-semibold">{dept.doctor_count || 0} Active Specialists</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {dept.description}
                </p>
              </div>
              <button
                onClick={() => onNavigate('doctors')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors pt-1"
              >
                <span>Explore {dept.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Doctors Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 text-left">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-600">SLMC Certified</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">Featured Medical Specialists</h2>
          </div>
          <button
            onClick={() => onNavigate('doctors')}
            className="text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <div key={doc.id} className="glass-card glass-card-hover rounded-2xl p-6 text-left flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                    {doc.full_name.split(' ')[1]?.[0] || 'D'}
                  </div>
                  <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-700 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{Number(doc.rating || 4.9).toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">{doc.full_name}</h3>
                  <p className="text-xs sm:text-sm font-semibold text-teal-700">{doc.specialization}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.department_name} • {doc.room_no}</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-bold block">Consultation Fee</span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">Rs. {doc.consultation_fee?.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => onSelectDoctorToBook ? onSelectDoctorToBook(doc) : onNavigate('book')}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-sm"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Choose MediCare Lanka */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-left">
            <div className="space-y-5">
              <div className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-bold text-teal-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Integrated EHR &amp; Billing</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
                Streamlined Healthcare from Consultation to Recovery
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Our clinic platform ensures complete patient privacy, instant token generation, paperless digital prescriptions, online payment settlement, and real-time laboratory result access.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start space-x-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">Zero Queue Wait Times:</strong> Book exact 30-minute time slots online with instant token confirmation.</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">Digital Prescriptions:</strong> View and print official prescriptions signed by certified doctors.</span>
                </div>
                <div className="flex items-start space-x-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong className="text-slate-900">Sri Lankan Payment Options:</strong> Pay conveniently via Cash, Visa/Mastercard, eZ Cash, or Genie.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-base flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span>Our Island-Wide Clinic Network</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Colombo Central Branch</div>
                  <div className="text-slate-600 mt-0.5">No. 45, Galle Road, Colombo 03</div>
                  <div className="text-teal-700 font-semibold mt-1 text-xs">+94 11 234 5678 • Open 07:00 AM - 09:00 PM</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Kandy General Branch</div>
                  <div className="text-slate-600 mt-0.5">No. 12, Peradeniya Road, Kandy</div>
                  <div className="text-teal-700 font-semibold mt-1 text-xs">+94 81 222 3344 • Open 08:00 AM - 06:00 PM</div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <div className="font-bold text-slate-900">Galle Care Branch</div>
                  <div className="text-slate-600 mt-0.5">No. 88, Main Street, Galle</div>
                  <div className="text-teal-700 font-semibold mt-1 text-xs">+94 91 438 9000 • Open 08:00 AM - 05:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
