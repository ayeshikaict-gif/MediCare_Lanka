import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Stethoscope, UserCog, ShieldAlert, Sparkles } from 'lucide-react';

export const QuickDemoBar = ({ onLoginSuccess }) => {
  const { loginUser } = useAuth();

  const handleDemoLogin = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-slate-900 text-sm flex flex-wrap items-center gap-2">
              <span>Instant Role Access</span>
              <span className="text-[11px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">1-Click Demo</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Preview any clinical portal immediately with sample data:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => handleDemoLogin('patient.kamal@gmail.com', 'password123')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 hover:border-teal-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('doctor.perera@medicare.lk', 'password123')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('reception.colombo@medicare.lk', 'password123')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <UserCog className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Reception</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin@medicare.lk', 'password123')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Admin</span>
          </button>
        </div>

      </div>
    </div>
  );
};
