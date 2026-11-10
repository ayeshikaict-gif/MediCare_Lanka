import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { DoctorsPage } from './pages/DoctorsPage';
import { BookingPage } from './pages/BookingPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthModal } from './pages/AuthModals';

const AppContent = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('home'); // home, doctors, book, dashboard
  const [preSelectedDoctor, setPreSelectedDoctor] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSelectDoctorToBook = (doctor) => {
    setPreSelectedDoctor(doctor);
    setCurrentTab('book');
  };

  const renderDashboardByRole = () => {
    if (!user) return <Home onNavigate={setCurrentTab} onSelectDoctorToBook={handleSelectDoctorToBook} />;
    switch (user.role) {
      case 'patient':
        return <PatientDashboard onNavigate={setCurrentTab} />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Home onNavigate={setCurrentTab} onSelectDoctorToBook={handleSelectDoctorToBook} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          openAuthModal={() => setAuthModalOpen(true)}
        />

        <main className="transition-all duration-300">
          {currentTab === 'home' && (
            <Home
              onNavigate={setCurrentTab}
              onSelectDoctorToBook={handleSelectDoctorToBook}
            />
          )}

          {currentTab === 'doctors' && (
            <DoctorsPage onSelectDoctorToBook={handleSelectDoctorToBook} />
          )}

          {currentTab === 'book' && (
            <BookingPage
              preSelectedDoctor={preSelectedDoctor}
              onBookingCompleted={() => setCurrentTab('dashboard')}
              openAuthModal={() => setAuthModalOpen(true)}
            />
          )}

          {currentTab === 'dashboard' && renderDashboardByRole()}
        </main>
      </div>

      <Footer onNavigate={setCurrentTab} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
