import React from 'react';
import { HeartPulse, Phone, Mail, MapPin, ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-slate-600 text-sm">
      
      {/* Suwa Seriya Emergency Banner */}
      <div className="bg-rose-50 border-b border-rose-200/80 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-base shadow-sm">1990</span>
            <div className="text-left">
              <div className="font-bold text-slate-900 text-sm sm:text-base">Suwa Seriya Free National Ambulance Service</div>
              <div className="text-xs text-rose-700">Available 24/7 Island-wide for Medical Emergencies</div>
            </div>
          </div>
          <a
            href="tel:1990"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Call 1990 Now
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        
        {/* Col 1: About */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-slate-900">{t('brand')}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            MediCare Lanka is a Sri Lankan private healthcare management platform connecting patients, general practitioners, specialists, and laboratories into one unified digital ecosystem.
          </p>
          <div className="flex items-center space-x-2 text-xs text-teal-700 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>SLMC Registered Medical Practitioners</span>
          </div>
        </div>

        {/* Col 2: Clinic Branches */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-900 text-base">Clinic Branches</h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <span><strong className="text-slate-800">Colombo Central:</strong> No. 45, Galle Road, Colombo 03 (+94 11 234 5678)</span>
            </li>
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <span><strong className="text-slate-800">Kandy General:</strong> No. 12, Peradeniya Road, Kandy (+94 81 222 3344)</span>
            </li>
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <span><strong className="text-slate-800">Galle Care:</strong> No. 88, Main Street, Galle (+94 91 438 9000)</span>
            </li>
          </ul>
        </div>

        {/* Col 3: Consultation Hours */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-900 text-base">Consultation Hours</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Monday - Friday:</span>
              <span className="text-teal-700 font-semibold">07:00 AM - 09:00 PM</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Saturday:</span>
              <span className="text-teal-700 font-semibold">08:00 AM - 06:00 PM</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Sunday / Poya:</span>
              <span className="text-amber-700 font-semibold">08:00 AM - 02:00 PM</span>
            </li>
            <li className="flex items-center justify-between pt-1">
              <span className="text-slate-600">Emergency Care:</span>
              <span className="text-rose-600 font-bold">24 Hours / 7 Days</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Accreditation & Contact */}
        <div className="space-y-3">
          <h4 className="font-heading font-bold text-slate-900 text-base">Contact & Support</h4>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <span>General Helpline: +94 11 700 8000</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              <span>info@medicare.lk</span>
            </div>
          </div>
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <Award className="w-6 h-6 text-amber-600 shrink-0" />
              <div className="text-[11px] text-slate-600 leading-snug">
                Accredited by Private Health Services Regulatory Council (PHSRC) Sri Lanka.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 bg-slate-50 py-5 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} MediCare Lanka (Pvt) Ltd. All Rights Reserved.</div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-teal-700 transition-colors">Home</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('doctors')} className="hover:text-teal-700 transition-colors">Doctors</button>
            <span>•</span>
            <button onClick={() => onNavigate && onNavigate('book')} className="hover:text-teal-700 transition-colors">Book Slot</button>
          </div>
        </div>
      </div>

    </footer>
  );
};
