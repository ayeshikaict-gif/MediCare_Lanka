import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    brand: "MediCare Lanka",
    tagline: "Sri Lanka's Premier Healthcare & Clinic Network",
    emergencyCall: "Emergency 1990",
    home: "Home",
    doctors: "Doctors",
    departments: "Departments",
    services: "Services",
    bookAppointment: "Book Appointment",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    patientPortal: "Patient Portal",
    doctorPortal: "Doctor Portal",
    receptionistPortal: "Reception Desk",
    adminDashboard: "Admin Analytics",
    quickDemo: "Quick Demo Logins",
    currency: "Rs.",
    emergencySubtitle: "National Health Hotline / Suwa Seriya Ambulance",
    findDoctor: "Search Doctors & Specialists",
    selectDept: "Choose Department",
    selectTime: "Select Available Time Slot",
    confirmBooking: "Confirm Booking",
    recentAppointments: "Recent Appointments",
    prescriptions: "Prescriptions",
    medicalRecords: "Medical Records",
    labResults: "Lab Tests & Reports",
    invoices: "Invoices & Payments",
    payNow: "Pay Now",
    printReceipt: "Print Receipt"
  },
  si: {
    brand: "මෙඩිකෙයා ලංකා",
    tagline: "ශ්‍රී ලංකාවේ ප්‍රමුඛතම සායනික සේවා ජාලය",
    emergencyCall: "හදිසි ඇමතුම් 1990",
    home: "මුල් පිටුව",
    doctors: "වෛද්‍යවරුන්",
    departments: "අංශයන්",
    services: "සේවාවන්",
    bookAppointment: "වේලාවක් වෙන්කරන්න",
    login: "ඇතුල් වන්න",
    register: "ලියාපදිංචි වන්න",
    logout: "නික්ම යන්න",
    dashboard: "පුවරුව",
    patientPortal: "රෝගී ද්වාරය",
    doctorPortal: "වෛද්‍ය ද්වාරය",
    receptionistPortal: "පිළිගැනීමේ කවුන්ටරය",
    adminDashboard: "පරිපාලන පුවරුව",
    quickDemo: "ක්ෂණික අත්හදා බැලීම්",
    currency: "රු.",
    emergencySubtitle: "සුව සැරිය ගිලන්රථ සේවාව 1990",
    findDoctor: "වෛද්‍යවරුන් සොයන්න",
    selectDept: "අංශය තෝරන්න",
    selectTime: "වේලාවක් තෝරන්න",
    confirmBooking: "තහවුරු කරන්න",
    recentAppointments: "මෑත හමුවීම්",
    prescriptions: "බෙහෙත් වට්ටෝරු",
    medicalRecords: "වෛද්‍ය වාර්තා",
    labResults: "පරීක්ෂණ වාර්තා",
    invoices: "ගෙවීම් සහ රිසිට්පත්",
    payNow: "දැන් ගෙවන්න",
    printReceipt: "රිසිට්පත මුද්‍රණය"
  },
  ta: {
    brand: "மெடிகேர் லங்கா",
    tagline: "இலங்கையின் முன்னணி மருத்துவமனை வலையமைப்பு",
    emergencyCall: "அவசரம் 1990",
    home: "முகப்பு",
    doctors: "மருத்துவர்கள்",
    departments: "துறைகள்",
    services: "சேவைகள்",
    bookAppointment: "முன்பதிவு செய்ய",
    login: "உள்நுழைக",
    register: "பதிவு செய்ய",
    logout: "வெளியேறு",
    dashboard: "டாஷ்போர்டு",
    patientPortal: "நோயாளி போர்ட்டல்",
    doctorPortal: "மருத்துவர் போர்ட்டல்",
    receptionistPortal: "வரவேற்பு கவுண்டர்",
    adminDashboard: "நிர்வாகி பகுதி",
    quickDemo: "டெமோ கணக்குகள்",
    currency: "ரூ.",
    emergencySubtitle: "சுவ செரிய ஆம்புலன்ஸ் சேவை 1990",
    findDoctor: "மருத்துவர்களைத் தேடுக",
    selectDept: "துறையைத் தேர்ந்தெடுக்கவும்",
    selectTime: "நேரத்தைத் தேர்ந்தெடுக்கவும்",
    confirmBooking: "உறுதிப்படுத்துங்கள்",
    recentAppointments: "சமீபத்திய முன்பதிவுகள்",
    prescriptions: "மருந்து சீட்டுகள்",
    medicalRecords: "மருத்துவ பதிவுகள்",
    labResults: "ஆய்வக அறிக்கைகள்",
    invoices: "கட்டணங்கள் & ரசீதுகள்",
    payNow: "இப்போது செலுத்துங்கள்",
    printReceipt: "ரசீதை அச்சிடுக"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
