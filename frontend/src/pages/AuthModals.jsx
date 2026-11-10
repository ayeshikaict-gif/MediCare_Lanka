import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { QuickDemoBar } from '../components/QuickDemoBar';
import { X, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { loginUser, registerPatientUser } = useAuth();
  const [mode, setMode] = useState(defaultMode);

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '+94 77 ',
    nic_passport: '',
    dob: '1996-06-15',
    gender: 'Male',
    blood_group: 'O+',
    address: 'Colombo, Sri Lanka'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const res = await loginUser(email, password);
    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'Login failed.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    const res = await registerPatientUser(regData);
    setSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-5 relative shadow-2xl text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MediCare Lanka Secure Portal</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            {mode === 'login' ? 'Account Login' : 'Create Patient Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {mode === 'login'
              ? 'Sign in with your credentials or pick a 1-click demo role below.'
              : 'Register to access electronic health records and online appointment scheduling.'}
          </p>
        </div>

        {/* Quick Demo Login Bar inside Modal */}
        <QuickDemoBar onLoginSuccess={onClose} />

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="font-bold text-slate-700 uppercase text-xs block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@medicare.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase text-xs block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-sm"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>

            <div className="text-center pt-1 text-slate-500 text-xs sm:text-sm">
              Don&apos;t have a patient account?{' '}
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setMode('register'); }}
                className="text-teal-700 font-bold hover:underline"
              >
                Register Here
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Kamal Perera"
                  value={regData.full_name}
                  onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="kamal@gmail.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-xs block mb-1">NIC / Passport</label>
                <input
                  type="text"
                  placeholder="199234567890"
                  value={regData.nic_passport}
                  onChange={(e) => setRegData({ ...regData, nic_passport: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all shadow-sm"
            >
              {submitting ? 'Creating Account...' : 'Complete Patient Registration'}
            </button>

            <div className="text-center pt-1 text-slate-500 text-xs sm:text-sm">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setMode('login'); }}
                className="text-teal-700 font-bold hover:underline"
              >
                Sign In Here
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
